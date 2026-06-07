import asyncio
import json
import logging
import os
from importlib.metadata import version
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)

BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(BACKEND_ENV, override=False)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS = tuple(
    model.strip()
    for model in os.getenv(
        "GEMINI_FALLBACK_MODELS",
        "gemini-2.5-flash-lite,gemini-2.0-flash",
    ).split(",")
    if model.strip() and model.strip() != GEMINI_MODEL
)
GEMINI_TIMEOUT_SECONDS = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "60"))
GEMINI_MAX_RESUME_CHARS = int(os.getenv("GEMINI_MAX_RESUME_CHARS", "30000"))
GEMINI_SDK_NAME = "google-genai"
GEMINI_SDK_VERSION = version(GEMINI_SDK_NAME)
MAX_JOB_DESCRIPTION_CHARS = 10000


class ResumeAnalysisPayload(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    compatibilidade: int = Field(ge=0, le=100)
    pontos_fortes: list[str] = Field(max_length=8)
    pontos_fracos: list[str] = Field(max_length=8)
    palavras_chave_faltantes: list[str] = Field(max_length=15)
    plano_de_melhoria: list[str] = Field(max_length=10)


class ResumeAnalysis(ResumeAnalysisPayload):
    model: str


class GeminiAnalysisError(RuntimeError):
    def __init__(
        self,
        message: str,
        *,
        status_code: int = 503,
        provider_status: str | None = None,
        response_body: str | None = None,
        safe_message: str | None = None,
        model: str | None = None,
        temporary: bool = False,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.provider_status = provider_status
        self.response_body = response_body
        self.safe_message = safe_message or message
        self.model = model
        self.temporary = temporary


def get_gemini_models() -> tuple[str, ...]:
    return tuple(dict.fromkeys((GEMINI_MODEL, *GEMINI_FALLBACK_MODELS)))


def has_gemini_api_key() -> bool:
    return bool(os.getenv("GEMINI_API_KEY", "").strip())


def _get_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise GeminiAnalysisError(
            "GEMINI_API_KEY nao configurada no backend.",
            status_code=503,
        )
    return api_key


def _serialize_for_log(value: Any) -> str:
    if value is None:
        return "null"
    try:
        if hasattr(value, "model_dump"):
            value = value.model_dump(mode="json", exclude_none=True)
        return json.dumps(value, ensure_ascii=False, default=str)
    except (TypeError, ValueError):
        return repr(value)


def _response_text(response: Any) -> str | None:
    if response is None:
        return None
    try:
        text = getattr(response, "text", None)
        return text if isinstance(text, str) else None
    except Exception as exc:
        return f"<erro ao ler resposta HTTP: {type(exc).__name__}: {exc}>"


def _log_gemini_response(operation: str, model: str, response: Any) -> None:
    logger.info(
        "Resposta recebida da Gemini: operacao=%s modelo=%s http_status=200 resposta=%s",
        operation,
        model,
        _serialize_for_log(response),
    )


def _gemini_api_error(
    operation: str,
    model: str,
    exc: errors.APIError,
) -> GeminiAnalysisError:
    http_status = getattr(exc, "code", None)
    error_code = getattr(exc, "code", None)
    provider_status = getattr(exc, "status", None)
    original_message = getattr(exc, "message", None)
    details = getattr(exc, "details", None)
    response_body = _response_text(getattr(exc, "response", None))

    logger.error(
        "Erro original da Gemini: operacao=%s sdk=%s sdk_version=%s modelo=%s "
        "http_status=%s error_code=%s provider_status=%s mensagem=%s "
        "detalhes=%s resposta_http=%s",
        operation,
        GEMINI_SDK_NAME,
        GEMINI_SDK_VERSION,
        model,
        http_status,
        error_code,
        provider_status,
        original_message,
        _serialize_for_log(details),
        response_body,
        exc_info=True,
    )

    status_code = http_status if isinstance(http_status, int) and 400 <= http_status <= 599 else 502
    temporary = status_code == 503 or str(provider_status).upper() == "UNAVAILABLE"
    return GeminiAnalysisError(
        str(exc),
        status_code=status_code,
        provider_status=provider_status,
        response_body=response_body,
        safe_message=(
            f"{provider_status or 'GEMINI_ERROR'}: "
            f"{original_message or 'Erro retornado pela Gemini API.'}"
        ),
        model=model,
        temporary=temporary,
    )


def _build_prompt(
    resume_text: str,
    job_description: str,
    job_title: str,
    level: str,
    area: str,
) -> str:
    target_context = "\n".join(
        [
            f"Cargo desejado: {job_title.strip() or 'nao informado'}",
            f"Nivel: {level.strip() or 'nao informado'}",
            f"Area: {area.strip() or 'nao informada'}",
            (
                "Descricao da vaga:\n"
                + (job_description.strip()[:MAX_JOB_DESCRIPTION_CHARS] or "nao informada")
            ),
        ]
    )

    return f"""
Voce e um especialista em recrutamento, curriculos e sistemas ATS.
Analise somente as informacoes presentes no curriculo. Nao invente experiencias,
habilidades, formacoes, empresas ou resultados.

O ats_score deve medir a qualidade do curriculo para leitura por sistemas ATS.
A compatibilidade deve considerar a vaga e o contexto alvo quando informados.
Se nao houver vaga ou contexto suficiente, estime a aderencia geral ao mercado e
deixe essa limitacao clara nos pontos fracos ou no plano de melhoria.

Retorne frases curtas, especificas e acionaveis em portugues do Brasil.

CONTEXTO ALVO:
{target_context}

CURRICULO:
{resume_text[:GEMINI_MAX_RESUME_CHARS]}
""".strip()


async def _generate_analysis_with_model(
    client: genai.Client,
    model: str,
    prompt: str,
    resume_text_length: int,
) -> ResumeAnalysis:
    try:
        logger.info(
            "Enviando curriculo ao Gemini: sdk=%s sdk_version=%s "
            "modelo=%s caracteres=%s",
            GEMINI_SDK_NAME,
            GEMINI_SDK_VERSION,
            model,
            min(resume_text_length, GEMINI_MAX_RESUME_CHARS),
        )
        async with asyncio.timeout(GEMINI_TIMEOUT_SECONDS):
            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                    response_schema=ResumeAnalysisPayload,
                ),
            )

        _log_gemini_response("analyze", model, response)

        if response.parsed is not None:
            payload = ResumeAnalysisPayload.model_validate(response.parsed)
        elif response.text:
            payload = ResumeAnalysisPayload.model_validate_json(response.text)
        else:
            raise GeminiAnalysisError(
                "O Gemini nao retornou conteudo para a analise.",
                status_code=502,
                model=model,
            )

        analysis = ResumeAnalysis(**payload.model_dump(), model=model)
        logger.info(
            "Analise Gemini concluida: modelo_usado=%s ats_score=%s "
            "compatibilidade=%s",
            model,
            analysis.ats_score,
            analysis.compatibilidade,
        )
        return analysis
    except GeminiAnalysisError:
        raise
    except TimeoutError as exc:
        logger.exception(
            "Timeout da Gemini: operacao=analyze modelo=%s timeout_segundos=%s erro=%s",
            model,
            GEMINI_TIMEOUT_SECONDS,
            exc,
        )
        raise GeminiAnalysisError(
            f"{type(exc).__name__}: timeout de {GEMINI_TIMEOUT_SECONDS}s ao consultar o Gemini",
            status_code=504,
            provider_status="TIMEOUT",
            safe_message="TIMEOUT: o modelo excedeu o tempo limite da analise.",
            model=model,
            temporary=True,
        ) from exc
    except ValidationError as exc:
        logger.exception(
            "Resposta Gemini fora do schema: modelo=%s erro=%s",
            model,
            exc,
        )
        raise GeminiAnalysisError(
            f"{type(exc).__name__}: {exc}",
            status_code=502,
            model=model,
        ) from exc
    except errors.APIError as exc:
        raise _gemini_api_error("analyze", model, exc) from exc
    except Exception as exc:
        logger.exception(
            "Excecao nao mascarada da Gemini: operacao=analyze modelo=%s "
            "tipo=%s mensagem=%s",
            model,
            type(exc).__name__,
            exc,
        )
        raise GeminiAnalysisError(
            f"{type(exc).__name__}: {exc}",
            status_code=500,
            model=model,
        ) from exc


async def generate_resume_analysis(
    resume_text: str,
    *,
    job_description: str = "",
    job_title: str = "",
    level: str = "",
    area: str = "",
) -> ResumeAnalysis:
    prompt = _build_prompt(
        resume_text,
        job_description,
        job_title,
        level,
        area,
    )
    models = get_gemini_models()
    client = genai.Client(api_key=_get_api_key())

    logger.info(
        "Modelos Gemini configurados para analise: principal=%s fallbacks=%s",
        GEMINI_MODEL,
        list(models[1:]),
    )

    try:
        for index, model in enumerate(models):
            try:
                return await _generate_analysis_with_model(
                    client,
                    model,
                    prompt,
                    len(resume_text),
                )
            except GeminiAnalysisError as exc:
                has_fallback = index + 1 < len(models)
                if not exc.temporary or not has_fallback:
                    raise

                next_model = models[index + 1]
                logger.warning(
                    "Falha temporaria no modelo Gemini: modelo=%s "
                    "http_status=%s provider_status=%s erro=%s. "
                    "Tentando fallback=%s",
                    model,
                    exc.status_code,
                    exc.provider_status,
                    exc,
                    next_model,
                )

        raise GeminiAnalysisError(
            "Nenhum modelo Gemini configurado para analise.",
            status_code=503,
        )
    finally:
        await client.aio.aclose()


async def check_gemini_connection() -> None:
    client = genai.Client(api_key=_get_api_key())

    try:
        logger.info(
            "Testando conexao com Gemini: sdk=%s sdk_version=%s "
            "modelo=%s timeout_segundos=%s",
            GEMINI_SDK_NAME,
            GEMINI_SDK_VERSION,
            GEMINI_MODEL,
            GEMINI_TIMEOUT_SECONDS,
        )
        async with asyncio.timeout(GEMINI_TIMEOUT_SECONDS):
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents="Responda somente com OK.",
                config=types.GenerateContentConfig(
                    temperature=0,
                    max_output_tokens=8,
                ),
            )

        _log_gemini_response("health", GEMINI_MODEL, response)
        logger.info(
            "Conexao Gemini validada: modelo=%s resposta=%s",
            GEMINI_MODEL,
            response.text,
        )
    except GeminiAnalysisError:
        raise
    except TimeoutError as exc:
        logger.exception(
            "Timeout da Gemini: operacao=health modelo=%s timeout_segundos=%s erro=%s",
            GEMINI_MODEL,
            GEMINI_TIMEOUT_SECONDS,
            exc,
        )
        raise GeminiAnalysisError(
            f"{type(exc).__name__}: timeout de {GEMINI_TIMEOUT_SECONDS}s ao consultar o Gemini",
            status_code=504,
        ) from exc
    except errors.APIError as exc:
        raise _gemini_api_error("health", GEMINI_MODEL, exc) from exc
    except Exception as exc:
        logger.exception(
            "Excecao nao mascarada da Gemini: operacao=health modelo=%s "
            "tipo=%s mensagem=%s",
            GEMINI_MODEL,
            type(exc).__name__,
            exc,
        )
        raise GeminiAnalysisError(
            f"{type(exc).__name__}: {exc}",
            status_code=500,
        ) from exc
    finally:
        await client.aio.aclose()
