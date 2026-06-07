import asyncio
import json
import logging
import os
import re
from importlib.metadata import version
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from pydantic import BaseModel, Field, ValidationError, field_validator

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
SKILL_SECTION_PATTERN = re.compile(
    r"^\s*(?:habilidades(?:\s+tecnicas)?|skills|tecnologias|"
    r"competencias(?:\s+tecnicas)?)\s*:?\s*(.*)$",
    re.IGNORECASE,
)
SECTION_HEADER_PATTERN = re.compile(
    r"^\s*(?:experiencia|experiencias|projetos?|formacao|educacao|"
    r"certificacoes?|cursos?|resumo|objetivo|idiomas?)\s*(?::|$)",
    re.IGNORECASE,
)
SKILL_SPLIT_PATTERN = re.compile(r"[,;|•·]+|\s+/\s+")
ATS_CRITERIA_WEIGHTS = {
    "compatibilidade_vaga": 30,
    "habilidades_tecnicas": 25,
    "experiencias": 20,
    "projetos": 10,
    "formacao": 10,
    "certificacoes": 5,
}
TEMPORARY_GEMINI_HTTP_STATUSES = {429, 503, 504}
TEMPORARY_GEMINI_PROVIDER_STATUSES = {
    "RESOURCE_EXHAUSTED",
    "UNAVAILABLE",
    "DEADLINE_EXCEEDED",
    "TIMEOUT",
}
ATS_SYSTEM_INSTRUCTION = """
Voce e um recrutador senior especializado em sistemas ATS e selecao tecnica.
Sua avaliacao deve ser conservadora, verificavel e baseada exclusivamente nas
evidencias do curriculo e nos requisitos informados. Nunca invente dados, nunca
presuma dominio de uma habilidade pelo titulo do cargo e nunca use elogios ou
criticas genericas.
""".strip()


class CriterionAssessment(BaseModel):
    pontuacao: int = Field(ge=0, le=100)
    aplicavel: bool
    justificativa: str
    evidencias: list[str] = Field(max_length=5)


class AtsCriteria(BaseModel):
    compatibilidade_vaga: CriterionAssessment
    habilidades_tecnicas: CriterionAssessment
    experiencias: CriterionAssessment
    projetos: CriterionAssessment
    formacao: CriterionAssessment
    certificacoes: CriterionAssessment


class RealProofDetection(BaseModel):
    habilidade: str
    status: str
    risco: str
    motivo: str
    como_comprovar: str

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: Any) -> str:
        normalized = str(value).strip().casefold().replace("ç", "c").replace("ã", "a")
        if normalized not in {"comprovacao_parcial", "sem_comprovacao"}:
            raise ValueError("status de comprovacao invalido")
        return normalized

    @field_validator("risco", mode="before")
    @classmethod
    def validate_risk(cls, value: Any) -> str:
        normalized = str(value).strip().casefold().replace("é", "e")
        if normalized not in {"baixo", "medio", "alto"}:
            raise ValueError("risco de comprovacao invalido")
        return normalized


class RecruiterPerspective(BaseModel):
    resumo: str
    pontos_de_atencao: list[str]
    pontos_positivos: list[str]
    perguntas_provaveis: list[str]
    risco_de_rejeicao: str

    @field_validator("risco_de_rejeicao", mode="before")
    @classmethod
    def validate_rejection_risk(cls, value: Any) -> str:
        normalized = str(value).strip().casefold().replace("é", "e")
        if normalized not in {"baixo", "medio", "alto"}:
            raise ValueError("risco de rejeicao invalido")
        return normalized


class EvolutionPlanItem(BaseModel):
    prioridade: str
    acao: str
    impacto_estimado: str
    prazo_sugerido: str

    @field_validator("prioridade", mode="before")
    @classmethod
    def validate_priority(cls, value: Any) -> str:
        normalized = (
            str(value)
            .strip()
            .casefold()
            .replace("é", "e")
            .replace("í", "i")
        )
        priority_map = {
            "alta": "alta",
            "high": "alta",
            "media": "media",
            "medium": "media",
            "baixa": "baixa",
            "low": "baixa",
        }
        if normalized not in priority_map:
            raise ValueError("prioridade do plano de evolucao invalida")
        return priority_map[normalized]

    @field_validator("impacto_estimado", mode="before")
    @classmethod
    def validate_estimated_impact(cls, value: Any) -> str:
        match = re.search(r"\d{1,2}", str(value))
        if not match:
            raise ValueError("impacto estimado deve informar pontos ATS")
        points = max(1, min(int(match.group()), 10))
        return f"+{points} pontos ATS"


class ResumeAnalysisPayload(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    compatibilidade: int = Field(ge=0, le=100)
    requisitos_obrigatorios_atendidos: list[str] = Field(max_length=15)
    requisitos_obrigatorios_ausentes: list[str] = Field(max_length=15)
    justificativa_ats: str
    justificativa_compatibilidade: str
    criterios: AtsCriteria
    detector_prova_real: list[RealProofDetection]
    visao_recrutador: RecruiterPerspective
    plano_evolucao: list[EvolutionPlanItem]
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
    temporary = (
        status_code in TEMPORARY_GEMINI_HTTP_STATUSES
        or str(provider_status).upper() in TEMPORARY_GEMINI_PROVIDER_STATUSES
    )
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
Realize uma triagem ATS completa em portugues do Brasil.

PROCESSO OBRIGATORIO:
1. Extraia da vaga os requisitos obrigatorios, desejaveis e palavras-chave.
2. Procure no curriculo evidencias explicitas para cada requisito. Considere
   sinonimos tecnicos apenas quando forem claramente equivalentes.
   Preencha requisitos_obrigatorios_atendidos e requisitos_obrigatorios_ausentes
   somente com requisitos declarados como obrigatorios na vaga.
3. Avalie separadamente os seis criterios abaixo. Para cada criterio, informe:
   - pontuacao inteira de 0 a 100;
   - se ele e aplicavel a esta vaga;
   - justificativa especifica;
   - ate cinco evidencias curtas encontradas no curriculo ou requisitos ausentes.
4. Calcule a compatibilidade a partir da aderencia real aos requisitos da vaga.
5. Calcule o ATS Score pela media ponderada dos criterios aplicaveis. Reajuste os
   pesos proporcionalmente quando um criterio realmente nao for aplicavel.
6. Execute o DETECTOR DE PROVA REAL para habilidades tecnicas explicitamente
   citadas no curriculo, mas sem comprovacao clara ou com comprovacao parcial.
7. Gere a VISAO DO RECRUTADOR como uma avaliacao de triagem humana inicial.
8. Crie o PLANO DE EVOLUCAO priorizando as mudancas de maior impacto.

PESOS DO ATS SCORE:
- compatibilidade_vaga: 30%
- habilidades_tecnicas: 25%
- experiencias: 20%
- projetos: 10%
- formacao: 10%
- certificacoes: 5%

CRITERIOS DE AVALIACAO:
- compatibilidade_vaga: requisitos obrigatorios e desejaveis atendidos.
- habilidades_tecnicas: tecnologias, ferramentas e metodos comprovados.
- experiencias: senioridade, responsabilidades, contexto e resultados.
- projetos: relevancia, complexidade, tecnologias e impacto demonstrado.
- formacao: aderencia da formacao e cursos ao cargo.
- certificacoes: certificacoes exigidas ou relevantes para a vaga.

CALIBRACAO DAS NOTAS:
- 90-100: evidencia forte para quase todos os requisitos relevantes.
- 75-89: boa aderencia, com lacunas pequenas e nao essenciais.
- 60-74: aderencia parcial, com lacunas relevantes.
- 40-59: aderencia fraca, com varios requisitos sem evidencia.
- 0-39: pouca ou nenhuma evidencia para a vaga.

REGRAS DE PRECISAO:
- Nao inferir habilidades, senioridade ou resultados que nao estejam escritos.
- Titulos de cargo, sozinhos, nao comprovam tecnologias ou competencias.
- Habilidades apenas listadas, sem contexto de uso, contam como evidencia parcial.
- Experiencias com resultados mensuraveis valem mais que descricoes vagas.
- Projetos podem reforcar experiencia, mas nao substituem automaticamente
  experiencia profissional exigida.
- Se faltar um requisito declarado como obrigatorio, compatibilidade nao pode
  superar 69.
- Se faltarem dois ou mais requisitos declarados como obrigatorios,
  compatibilidade nao pode superar 55.
- Certificacoes podem ser marcadas como nao aplicaveis quando a vaga nao as exige
  e elas nao forem relevantes para o cargo. Nao penalize nesse caso.
- Se a descricao da vaga estiver ausente ou insuficiente, limite compatibilidade
  a 50 e explique claramente a baixa confianca.
- Nao escolha primeiro uma nota para depois justifica-la. Pontue os criterios,
  aplique os pesos e somente entao produza o ATS Score.

DETECTOR DE PROVA REAL:
- Analise habilidades tecnicas citadas em listas, resumo, experiencias, projetos,
  cursos, certificacoes, GitHub ou portfolio.
- Considere prova clara quando a habilidade estiver ligada a pelo menos uma
  experiencia, projeto, curso, certificacao, repositorio ou trabalho pratico
  identificavel, com contexto suficiente para entender como ela foi usada.
- Uma lista isolada de habilidades, um titulo de cargo, "conhecimento em" ou um
  link generico de GitHub sem projeto associado nao constituem prova clara.
- Inclua em detector_prova_real somente habilidades citadas no curriculo que
  tenham status comprovacao_parcial ou sem_comprovacao.
- Audite todas as habilidades da secao "Habilidades", uma por uma. Se uma delas
  aparecer apenas nessa lista e nao tiver evidencia em outra secao, ela deve
  obrigatoriamente constar como sem_comprovacao.
- Nao inclua habilidades totalmente ausentes do curriculo. Elas pertencem a
  palavras_chave_faltantes, nao ao detector de prova.
- Use status sem_comprovacao quando nao houver nenhuma evidencia associada.
- Use status comprovacao_parcial quando houver contexto vago ou incompleto, sem
  entrega, atividade, curso, certificacao ou trabalho pratico identificavel.
- Use risco alto para habilidade obrigatoria ou central da vaga sem prova; medio
  para habilidade relevante ou desejavel sem prova suficiente; baixo para uma
  habilidade secundaria sem impacto direto na selecao.
- motivo deve citar onde a habilidade aparece e qual comprovacao esta faltando.
- como_comprovar deve sugerir uma evidencia concreta e etica: projeto real,
  responsabilidade exercida, curso concluido, certificacao obtida ou repositorio
  relevante. Nunca recomende inventar experiencia ou conhecimento.
- Nao duplique habilidades equivalentes. Consolide variacoes como "React.js" e
  "React" em um unico item.

VISAO DO RECRUTADOR:
- Simule a leitura inicial de um recrutador que precisa decidir rapidamente se
  o candidato deve avancar para entrevista.
- resumo deve ter duas ou tres frases curtas sobre aderencia, senioridade
  percebida e principal fator de decisao.
- pontos_positivos deve conter somente vantagens comprovadas por experiencia,
  projeto, formacao, certificacao ou resultado presente no curriculo.
- Habilidades marcadas em detector_prova_real nao podem ser tratadas como
  comprovadas, nem usadas para afirmar que todos os requisitos foram atendidos.
- pontos_de_atencao deve destacar riscos concretos: requisitos ausentes,
  habilidades sem prova, experiencia insuficiente, descricoes vagas, falta de
  resultados, lacunas ou inconsistencias.
- perguntas_provaveis deve conter perguntas especificas que um recrutador faria
  para validar experiencias, habilidades, projetos e lacunas identificadas.
- risco_de_rejeicao deve ser baixo, medio ou alto e refletir a chance de rejeicao
  na triagem inicial para esta vaga.
- Use risco alto quando faltarem requisitos obrigatorios centrais ou houver
  baixa compatibilidade. Use medio quando houver aderencia parcial ou evidencias
  insuficientes. Use baixo apenas quando a maior parte dos requisitos estiver
  comprovada e nao houver lacunas decisivas.
- Nao bajule, nao use linguagem promocional e nao suavize riscos reais.
- Nao repita frases genericas. Relacione cada conclusao a uma evidencia ou
  ausencia observavel no curriculo e na vaga.

PLANO DE EVOLUCAO:
- Gere entre tres e oito acoes praticas e ordenadas por prioridade: alta, media
  e baixa.
- Cada acao deve corrigir uma lacuna real encontrada na vaga, no ATS Score, no
  detector_prova_real ou na visao_recrutador.
- Comece por requisitos obrigatorios ausentes, habilidades centrais sem prova e
  problemas que impedem a triagem ATS.
- acao deve descrever uma entrega verificavel. Exemplo: criar um projeto,
  detalhar uma experiencia real, adicionar metricas verdadeiras, concluir um
  curso ou reorganizar uma secao especifica.
- impacto_estimado deve usar o formato "+N pontos ATS", com uma estimativa
  conservadora entre 1 e 10 pontos. As estimativas nao sao cumulativas nem
  garantidas.
- prazo_sugerido deve ser realista e usar dias ou semanas.
- Nao recomende adicionar habilidades que o candidato nao possui sem antes
  sugerir aprendizado ou pratica real.
- Nunca recomende inventar experiencia, resultados, projetos ou certificacoes.
- Evite acoes vagas como "melhorar o curriculo", "estudar mais" ou "adicionar
  palavras-chave" sem dizer exatamente quais mudancas devem ser feitas.
- plano_de_melhoria deve resumir as mesmas prioridades do plano_evolucao em
  frases curtas, mantendo consistencia entre os dois campos.

JUSTIFICATIVAS:
- justificativa_ats deve explicar os fatores que mais aumentaram e reduziram a
  nota, citando criterios, evidencias e lacunas concretas.
- justificativa_compatibilidade deve citar requisitos atendidos e requisitos
  obrigatorios ou desejaveis que nao possuem evidencia.
- Cada ponto forte e ponto fraco deve mencionar uma evidencia concreta ou uma
  ausencia verificavel. Evite frases como "bom curriculo", "perfil adequado",
  "melhorar habilidades" ou qualquer avaliacao generica.
- palavras_chave_faltantes deve conter somente termos presentes ou claramente
  exigidos pela vaga e ausentes do curriculo.
- plano_de_melhoria deve ser ordenado por impacto e conter acoes objetivas.

CONTEXTO ALVO:
{target_context}

CURRICULO:
{resume_text[:GEMINI_MAX_RESUME_CHARS]}
""".strip()


def _contains_term(text: str, term: str) -> bool:
    if not term.strip():
        return False
    pattern = rf"(?<!\w){re.escape(term.strip())}(?!\w)"
    return re.search(pattern, text, re.IGNORECASE) is not None


def _extract_listed_skills(resume_text: str) -> tuple[list[str], str]:
    lines = resume_text.splitlines()
    skill_line_indexes: set[int] = set()
    listed_skills: list[str] = []
    reading_skill_section = False

    for index, line in enumerate(lines):
        match = SKILL_SECTION_PATTERN.match(line)
        if match:
            reading_skill_section = True
            skill_line_indexes.add(index)
            content = match.group(1).strip()
            if content:
                listed_skills.extend(SKILL_SPLIT_PATTERN.split(content))
            continue

        if not reading_skill_section:
            continue

        stripped = line.strip()
        if not stripped or SECTION_HEADER_PATTERN.match(stripped):
            reading_skill_section = False
            continue

        skill_line_indexes.add(index)
        listed_skills.extend(SKILL_SPLIT_PATTERN.split(stripped))

    cleaned_skills: list[str] = []
    seen: set[str] = set()
    for skill in listed_skills:
        cleaned = re.sub(r"^[\s\-–—*]+", "", skill).strip()
        cleaned = re.sub(r"\s*\([^)]*\)\s*$", "", cleaned).strip()
        cleaned = cleaned.rstrip(".").strip()
        normalized = cleaned.casefold()
        if 1 < len(cleaned) <= 60 and normalized not in seen:
            seen.add(normalized)
            cleaned_skills.append(cleaned)

    evidence_text = "\n".join(
        line for index, line in enumerate(lines) if index not in skill_line_indexes
    )
    return cleaned_skills, evidence_text


def _proof_risk(skill: str, job_description: str) -> str:
    relevant_segments = re.split(r"[\n.!?]+", job_description)
    for segment in relevant_segments:
        if _contains_term(segment, skill) and re.search(
            r"\b(?:obrigatorio|obrigatório|requisito|required|must[- ]have)\b",
            segment,
            re.IGNORECASE,
        ):
            return "alto"
    return "medio" if _contains_term(job_description, skill) else "baixo"


def _normalize_proof_detector(
    payload: ResumeAnalysisPayload,
    resume_text: str,
    job_description: str,
) -> ResumeAnalysisPayload:
    detector: list[RealProofDetection] = []
    detected_skills: set[str] = set()

    for item in payload.detector_prova_real:
        normalized = item.habilidade.strip().casefold()
        if (
            not normalized
            or normalized in detected_skills
            or not _contains_term(resume_text, item.habilidade)
        ):
            continue
        detected_skills.add(normalized)
        detector.append(item)

    listed_skills, evidence_text = _extract_listed_skills(resume_text)
    for skill in listed_skills:
        normalized = skill.casefold()
        if (
            normalized in detected_skills
            or _contains_term(evidence_text, skill)
        ):
            continue

        detected_skills.add(normalized)
        detector.append(
            RealProofDetection(
                habilidade=skill,
                status="sem_comprovacao",
                risco=_proof_risk(skill, job_description),
                motivo=(
                    f"{skill} aparece na secao de habilidades, mas nao esta "
                    "associada a projeto, experiencia, curso, certificacao ou "
                    "trabalho pratico no curriculo."
                ),
                como_comprovar=(
                    f"Adicionar uma evidencia real de uso de {skill} em projeto, "
                    "experiencia, curso ou certificacao e descrever o contexto."
                ),
            )
        )

    normalized_detector = detector[:20]
    if normalized_detector != payload.detector_prova_real:
        logger.info(
            "Detector de prova real normalizado: itens_modelo=%s itens_finais=%s",
            len(payload.detector_prova_real),
            len(normalized_detector),
        )
    return payload.model_copy(
        update={"detector_prova_real": normalized_detector}
    )


def _calibrate_recruiter_risk(
    payload: ResumeAnalysisPayload,
) -> ResumeAnalysisPayload:
    missing_required_count = len(
        {
            requirement.strip().casefold()
            for requirement in payload.requisitos_obrigatorios_ausentes
            if requirement.strip()
        }
    )
    high_proof_risks = [
        item
        for item in payload.detector_prova_real
        if item.risco == "alto"
    ]

    if (
        missing_required_count >= 2
        or len(high_proof_risks) >= 2
        or payload.compatibilidade <= 55
    ):
        minimum_risk = "alto"
    elif (
        missing_required_count == 1
        or len(high_proof_risks) == 1
        or payload.compatibilidade < 75
    ):
        minimum_risk = "medio"
    else:
        minimum_risk = "baixo"

    risk_order = {"baixo": 0, "medio": 1, "alto": 2}
    recruiter_view = payload.visao_recrutador
    if high_proof_risks:
        unproven_skills = [item.habilidade for item in high_proof_risks]
        attention_points = list(recruiter_view.pontos_de_atencao)
        for skill in unproven_skills:
            if not any(_contains_term(point, skill) for point in attention_points):
                attention_points.append(
                    f"{skill} e relevante para a vaga, mas aparece sem "
                    "comprovacao clara no curriculo."
                )

        positive_points = [
            point
            for point in recruiter_view.pontos_positivos
            if not any(_contains_term(point, skill) for skill in unproven_skills)
            and not re.search(
                r"(?:todos|todas).{0,30}requisitos|"
                r"atende.{0,30}requisitos obrigatorios",
                point,
                re.IGNORECASE,
            )
        ]
        if len(unproven_skills) > 1:
            skills_text = (
                ", ".join(unproven_skills[:-1])
                + " e "
                + unproven_skills[-1]
            )
        else:
            skills_text = unproven_skills[0]
        skill_verb = "aparecem" if len(unproven_skills) > 1 else "aparece"
        validation_reference = (
            "dessas habilidades"
            if len(unproven_skills) > 1
            else "dessa habilidade"
        )
        recruiter_view = recruiter_view.model_copy(
            update={
                "resumo": (
                    "O perfil apresenta aderencia parcial, mas "
                    f"{skills_text} {skill_verb} sem comprovacao clara. "
                    "A decisao de avancar depende da validacao "
                    f"{validation_reference} e das experiencias descritas."
                ),
                "pontos_de_atencao": attention_points,
                "pontos_positivos": positive_points,
            }
        )

    if (
        risk_order[recruiter_view.risco_de_rejeicao]
        < risk_order[minimum_risk]
    ):
        logger.info(
            "Risco de rejeicao recalibrado: original=%s minimo=%s "
            "compatibilidade=%s requisitos_ausentes=%s",
            recruiter_view.risco_de_rejeicao,
            minimum_risk,
            payload.compatibilidade,
            payload.requisitos_obrigatorios_ausentes,
        )
        recruiter_view = recruiter_view.model_copy(
            update={"risco_de_rejeicao": minimum_risk}
        )

    return payload.model_copy(
        update={"visao_recrutador": recruiter_view}
    )


def _normalize_evolution_plan(
    payload: ResumeAnalysisPayload,
) -> ResumeAnalysisPayload:
    priority_order = {"alta": 0, "media": 1, "baixa": 2}
    unique_actions: list[EvolutionPlanItem] = []
    seen_actions: set[str] = set()

    for item in sorted(
        payload.plano_evolucao,
        key=lambda plan_item: priority_order[plan_item.prioridade],
    ):
        normalized_action = re.sub(r"\s+", " ", item.acao).strip().casefold()
        if not normalized_action or normalized_action in seen_actions:
            continue
        seen_actions.add(normalized_action)
        unique_actions.append(item)

    normalized_plan = unique_actions[:8]
    improvement_summary = [item.acao for item in normalized_plan]
    if (
        normalized_plan != payload.plano_evolucao
        or improvement_summary != payload.plano_de_melhoria
    ):
        logger.info(
            "Plano de evolucao normalizado: itens_modelo=%s itens_finais=%s",
            len(payload.plano_evolucao),
            len(normalized_plan),
        )

    return payload.model_copy(
        update={
            "plano_evolucao": normalized_plan,
            "plano_de_melhoria": improvement_summary,
        }
    )


def _calibrate_scores(payload: ResumeAnalysisPayload) -> ResumeAnalysisPayload:
    criteria = payload.criterios
    compatibility = criteria.compatibilidade_vaga
    missing_required_count = len(
        {
            requirement.strip().casefold()
            for requirement in payload.requisitos_obrigatorios_ausentes
            if requirement.strip()
        }
    )

    if missing_required_count >= 2:
        compatibility_cap = 55
    elif missing_required_count == 1:
        compatibility_cap = 69
    else:
        compatibility_cap = 100

    if compatibility.pontuacao > compatibility_cap:
        logger.info(
            "Compatibilidade limitada por requisitos obrigatorios ausentes: "
            "pontuacao_original=%s teto=%s requisitos_ausentes=%s",
            compatibility.pontuacao,
            compatibility_cap,
            payload.requisitos_obrigatorios_ausentes,
        )
        compatibility = compatibility.model_copy(
            update={"pontuacao": compatibility_cap}
        )
        criteria = criteria.model_copy(
            update={"compatibilidade_vaga": compatibility}
        )

    weighted_total = 0
    applicable_weight = 0

    for criterion_name, weight in ATS_CRITERIA_WEIGHTS.items():
        assessment = getattr(criteria, criterion_name)
        is_applicable = (
            criterion_name == "compatibilidade_vaga" or assessment.aplicavel
        )
        if is_applicable:
            weighted_total += assessment.pontuacao * weight
            applicable_weight += weight

    calculated_ats_score = round(weighted_total / applicable_weight)
    calculated_compatibility = criteria.compatibilidade_vaga.pontuacao

    if (
        payload.ats_score != calculated_ats_score
        or payload.compatibilidade != calculated_compatibility
    ):
        logger.info(
            "Pontuacoes Gemini recalibradas: ats_original=%s ats_calculado=%s "
            "compatibilidade_original=%s compatibilidade_calculada=%s",
            payload.ats_score,
            calculated_ats_score,
            payload.compatibilidade,
            calculated_compatibility,
        )

    return payload.model_copy(
        update={
            "ats_score": calculated_ats_score,
            "compatibilidade": calculated_compatibility,
            "criterios": criteria,
        }
    )


async def _generate_analysis_with_model(
    client: genai.Client,
    model: str,
    prompt: str,
    resume_text: str,
    job_description: str,
) -> ResumeAnalysis:
    try:
        logger.info(
            "Enviando curriculo ao Gemini: sdk=%s sdk_version=%s "
            "modelo=%s caracteres=%s",
            GEMINI_SDK_NAME,
            GEMINI_SDK_VERSION,
            model,
            min(len(resume_text), GEMINI_MAX_RESUME_CHARS),
        )
        async with asyncio.timeout(GEMINI_TIMEOUT_SECONDS):
            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    system_instruction=ATS_SYSTEM_INSTRUCTION,
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

        payload = _normalize_proof_detector(
            payload,
            resume_text,
            job_description,
        )
        payload = _calibrate_scores(payload)
        payload = _calibrate_recruiter_risk(payload)
        payload = _normalize_evolution_plan(payload)
        analysis = ResumeAnalysis(**payload.model_dump(), model=model)
        logger.info(
            "Modelo Gemini respondeu a analise: modelo_usado=%s ats_score=%s "
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
                    resume_text,
                    job_description,
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
