import json
import logging
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import APIConnectionError, APIError, APITimeoutError, OpenAI, RateLimitError

logger = logging.getLogger(__name__)

BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(BACKEND_ENV)
load_dotenv()

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TIMEOUT_SECONDS = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "45"))
MAX_RESUME_CHARS = int(os.getenv("OPENAI_MAX_RESUME_CHARS", "12000"))
MAX_JOB_CHARS = int(os.getenv("OPENAI_MAX_JOB_CHARS", "6000"))


class OpenAIAnalysisError(ValueError):
    def __init__(self, message: str, *, configuration_error: bool = False):
        super().__init__(message)
        self.configuration_error = configuration_error


def _get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise OpenAIAnalysisError(
            "OPENAI_API_KEY nao configurada. Configure a chave da OpenAI no backend.",
            configuration_error=True,
        )

    return OpenAI(api_key=api_key, timeout=OPENAI_TIMEOUT_SECONDS)


def _extract_json(response_text: str) -> dict[str, Any]:
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not json_match:
            raise OpenAIAnalysisError("A IA retornou uma resposta em formato invalido.")
        return json.loads(json_match.group())


def _openai_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    try:
        logger.info("Enviando prompt para OpenAI API com modelo %s...", OPENAI_MODEL)
        response = _get_client().chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        if not content:
            raise OpenAIAnalysisError("A IA nao retornou conteudo para analise.")

        logger.info("Resposta OpenAI recebida: %s caracteres", len(content))
        return _extract_json(content.strip())
    except OpenAIAnalysisError:
        raise
    except (APITimeoutError, APIConnectionError, RateLimitError, APIError) as exc:
        logger.error("Falha na OpenAI API: %s", exc, exc_info=True)
        raise OpenAIAnalysisError("Servico de IA temporariamente indisponivel.") from exc
    except Exception as exc:
        logger.error("Erro inesperado na analise OpenAI: %s", exc, exc_info=True)
        raise OpenAIAnalysisError("Nao foi possivel gerar a analise agora.") from exc


def _as_int(value: Any, default: int = 50) -> int:
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        number = default
    return max(0, min(100, number))


def _as_string_list(value: Any, limit: int | None = None) -> list[str]:
    if not isinstance(value, list):
        return []

    items = [str(item).strip() for item in value if str(item).strip()]
    return items[:limit] if limit else items


def _importance(value: Any) -> str:
    normalized = str(value or "medium").lower()
    return normalized if normalized in {"high", "medium", "low"} else "medium"


def _priority(value: Any) -> str:
    normalized = str(value or "medium").lower()
    return normalized if normalized in {"high", "medium", "low"} else "medium"


def _proof_status(value: Any) -> str:
    normalized = str(value or "unproven").lower()
    return normalized if normalized in {"proven", "unproven", "missing"} else "unproven"


def _normalize_keywords(value: Any, *, found: bool, limit: int = 12) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    normalized: list[dict[str, Any]] = []
    for item in value[:limit]:
        if isinstance(item, dict):
            keyword = str(item.get("keyword", "")).strip()
            importance = _importance(item.get("importance"))
        else:
            keyword = str(item).strip()
            importance = "medium"

        if keyword:
            normalized.append({"keyword": keyword, "found": found, "importance": importance})

    return normalized


def _normalize_section_suggestions(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    suggestions = []
    for item in value[:8]:
        if not isinstance(item, dict):
            continue
        suggestions.append(
            {
                "section": str(item.get("section", "Curriculo")).strip() or "Curriculo",
                "current": str(item.get("current", "")).strip(),
                "suggestion": str(item.get("suggestion", "")).strip(),
                "priority": _priority(item.get("priority")),
            }
        )
    return suggestions


def _normalize_proof_check(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    proof_items = []
    for item in value[:8]:
        if not isinstance(item, dict):
            continue
        evidence = item.get("evidence")
        proof_items.append(
            {
                "skill": str(item.get("skill", "")).strip() or "Competencia",
                "status": _proof_status(item.get("status")),
                "evidence": str(evidence).strip() if evidence else None,
                "message": str(item.get("message", "")).strip(),
            }
        )
    return proof_items


def _normalize_improvement_plan(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []

    steps = []
    for index, item in enumerate(value[:6], 1):
        if not isinstance(item, dict):
            continue
        steps.append(
            {
                "step": int(item.get("step") or index),
                "action": str(item.get("action", "")).strip() or "Melhorar curriculo",
                "impact": _importance(item.get("impact")),
                "detail": str(item.get("detail", "")).strip(),
            }
        )
    return steps


def _normalize_analysis(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "atsScore": _as_int(data.get("atsScore")),
        "jobMatch": _as_int(data.get("jobMatch")),
        "clarityScore": _as_int(data.get("clarityScore")),
        "strengths": _as_string_list(data.get("strengths"), 5),
        "weaknesses": _as_string_list(data.get("weaknesses"), 5),
        "risks": _as_string_list(data.get("risks"), 3),
        "foundKeywords": _normalize_keywords(data.get("foundKeywords"), found=True),
        "missingKeywords": _normalize_keywords(data.get("missingKeywords"), found=False),
        "sectionSuggestions": _normalize_section_suggestions(data.get("sectionSuggestions")),
        "proofCheck": _normalize_proof_check(data.get("proofCheck")),
        "improvementPlan": _normalize_improvement_plan(data.get("improvementPlan")),
    }


def generate_analysis(
    resume_text: str,
    job_description: str,
    job_title: str,
    level: str,
    area: str,
) -> dict[str, Any]:
    """
    Analyze resume text against a job description using the OpenAI API.
    """
    system_prompt = (
        "Voce e um especialista em recrutamento tecnico, ATS e analise de curriculos. "
        "Seja honesto, pratico e profissional. Nao invente experiencias. "
        "Retorne somente um objeto JSON valido, sem markdown e sem texto adicional."
    )

    user_prompt = f"""
Analise este curriculo em relacao a vaga e retorne JSON no formato solicitado.

CURRICULO DO CANDIDATO:
{resume_text[:MAX_RESUME_CHARS]}

DESCRICAO DA VAGA:
{job_description[:MAX_JOB_CHARS]}

INFORMACOES DA VAGA:
- Cargo: {job_title}
- Nivel: {level}
- Area: {area}

Formato obrigatorio:
{{
  "atsScore": 0,
  "jobMatch": 0,
  "clarityScore": 0,
  "strengths": ["maximo 5 pontos fortes"],
  "weaknesses": ["maximo 5 pontos fracos"],
  "risks": ["maximo 3 riscos"],
  "foundKeywords": [
    {{"keyword": "termo encontrado", "found": true, "importance": "high"}}
  ],
  "missingKeywords": [
    {{"keyword": "termo ausente", "found": false, "importance": "high"}}
  ],
  "sectionSuggestions": [
    {{"section": "Experiencia", "current": "texto atual", "suggestion": "sugestao objetiva", "priority": "high"}}
  ],
  "proofCheck": [
    {{"skill": "React", "status": "proven", "evidence": "evidencia encontrada ou null", "message": "avaliacao curta"}}
  ],
  "improvementPlan": [
    {{"step": 1, "action": "acao", "impact": "high", "detail": "detalhe pratico"}}
  ]
}}

Use apenas estes valores para importance, priority e impact: high, medium, low.
Use apenas estes valores para status: proven, unproven, missing.
"""

    analysis_data = _normalize_analysis(_openai_json(system_prompt, user_prompt))
    logger.info(
        "Analise OpenAI completada: atsScore=%s, jobMatch=%s",
        analysis_data.get("atsScore"),
        analysis_data.get("jobMatch"),
    )
    return analysis_data


def generate_optimized_resume(resume_text: str, analysis_data: dict[str, Any], job_description: str) -> str:
    """Generate an optimized resume version with OpenAI."""
    try:
        system_prompt = (
            "Voce otimiza curriculos para ATS. Retorne somente JSON valido no formato "
            "{\"optimizedResume\":\"texto\"}."
        )
        user_prompt = f"""
Com base na analise, gere uma versao otimizada do curriculo.

CURRICULO ORIGINAL:
{resume_text[:MAX_RESUME_CHARS]}

SUGESTOES:
{json.dumps(analysis_data.get("sectionSuggestions", []), ensure_ascii=False, indent=2)}

REQUISITOS DA VAGA:
{job_description[:MAX_JOB_CHARS]}

Nao invente experiencias, empresas, cursos ou metricas.
"""
        response = _openai_json(system_prompt, user_prompt)
        optimized_resume = str(response.get("optimizedResume", "")).strip()
        return optimized_resume or resume_text
    except Exception as exc:
        logger.warning("Erro ao otimizar curriculo, usando original: %s", exc)
        return resume_text


def generate_recruiter_view(resume_text: str, job_title: str, analysis_data: dict[str, Any]) -> dict[str, Any]:
    """Generate the recruiter perspective view with OpenAI."""
    fallback = {
        "summary30s": "Candidato com perfil a revisar para esta vaga.",
        "strengths": analysis_data.get("strengths", [])[:3],
        "risks": analysis_data.get("risks", [])[:3],
        "topSkills": [item.get("keyword") for item in analysis_data.get("foundKeywords", [])[:6] if item.get("keyword")],
        "interviewQuestions": ["Conte sobre sua experiencia mais relevante para esta vaga."],
    }

    try:
        system_prompt = (
            "Voce e um recrutador avaliando um candidato. Retorne somente JSON valido, "
            "sem markdown e sem texto adicional."
        )
        user_prompt = f"""
Gere uma visao do recrutador para a vaga de {job_title}.

CURRICULO:
{resume_text[:8000]}

ANALISE:
{json.dumps(analysis_data, ensure_ascii=False, indent=2)[:5000]}

Formato obrigatorio:
{{
  "summary30s": "resumo em ate 30 segundos",
  "strengths": ["2 a 3 pontos fortes"],
  "risks": ["2 a 3 riscos"],
  "topSkills": ["5 a 6 skills relevantes"],
  "interviewQuestions": ["5 a 6 perguntas para entrevista"]
}}
"""
        response = _openai_json(system_prompt, user_prompt)
        return {
            "summary30s": str(response.get("summary30s") or fallback["summary30s"]),
            "strengths": _as_string_list(response.get("strengths"), 3) or fallback["strengths"],
            "risks": _as_string_list(response.get("risks"), 3) or fallback["risks"],
            "topSkills": _as_string_list(response.get("topSkills"), 6) or fallback["topSkills"],
            "interviewQuestions": _as_string_list(response.get("interviewQuestions"), 6)
            or fallback["interviewQuestions"],
        }
    except Exception as exc:
        logger.warning("Erro ao gerar visao do recrutador, usando fallback: %s", exc)
        return fallback


def generate_improvement_plan(analysis_data: dict[str, Any], ats_score: int) -> list[dict[str, Any]]:
    """Generate an improvement plan based on analysis."""
    if analysis_data.get("improvementPlan"):
        logger.info("Plano de melhoria encontrado na analise")
        return analysis_data["improvementPlan"]

    logger.info("Gerando plano de melhoria padrao")
    steps: list[dict[str, Any]] = []
    weaknesses = analysis_data.get("weaknesses", [])

    if weaknesses:
        steps.append(
            {
                "step": 1,
                "action": f"Melhore: {weaknesses[0][:50]}",
                "impact": "high",
                "detail": "Acao necessaria para aumentar sua taxa de aprovacao em triagens automaticas.",
            }
        )

    steps.extend(
        [
            {
                "step": len(steps) + 1,
                "action": "Adicione palavras-chave da vaga",
                "impact": "high",
                "detail": "Inclua termos especificos da descricao da vaga quando eles refletirem sua experiencia real.",
            },
            {
                "step": len(steps) + 2,
                "action": "Inclua metricas nos projetos",
                "impact": "high",
                "detail": "Use resultados verificaveis, como reducao de tempo, aumento de conversao ou escala atendida.",
            },
            {
                "step": len(steps) + 3,
                "action": "Atualize LinkedIn e GitHub",
                "impact": "medium",
                "detail": "Mantenha perfis online sincronizados com as informacoes do curriculo.",
            },
        ]
    )

    logger.info("Plano de melhoria gerado com %s passos para atsScore=%s", len(steps), ats_score)
    return steps
