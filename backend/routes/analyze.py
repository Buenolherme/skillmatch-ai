from datetime import datetime
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

try:
    from ..utils.pdf_parser import extract_text_from_pdf
    from ..services.ai_analyzer import (
        OpenAIAnalysisError,
        generate_analysis,
        generate_improvement_plan,
        generate_optimized_resume,
        generate_recruiter_view,
    )
except ImportError:
    from utils.pdf_parser import extract_text_from_pdf
    from services.ai_analyzer import (
        OpenAIAnalysisError,
        generate_analysis,
        generate_improvement_plan,
        generate_optimized_resume,
        generate_recruiter_view,
    )

logger = logging.getLogger(__name__)

router = APIRouter()


def _keyword_names(found_keywords: list) -> list[str]:
    names = []
    for item in found_keywords[:3]:
        keyword = item.get("keyword") if isinstance(item, dict) else item
        if keyword:
            names.append(str(keyword))
    return names or ["tecnologias relevantes"]


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    job_title: str = Form(...),
    level: str = Form(...),
    area: str = Form(...),
    linkedin: str = Form(default=""),
    github: str = Form(default=""),
):
    """
    Analyze a PDF resume against a job description using OpenAI.
    """
    try:
        filename = file.filename or ""
        logger.info("Iniciando analise: arquivo=%s, cargo=%s", filename, job_title)

        if not filename.lower().endswith(".pdf"):
            logger.warning("Arquivo rejeitado: nao e PDF - %s", filename)
            raise HTTPException(status_code=422, detail="Apenas arquivos PDF sao permitidos")

        if not job_description.strip():
            logger.warning("Descricao da vaga vazia")
            raise HTTPException(status_code=422, detail="Descricao da vaga e obrigatoria")

        if not job_title.strip():
            logger.warning("Cargo desejado vazio")
            raise HTTPException(status_code=422, detail="Cargo desejado e obrigatorio")

        logger.info("Lendo arquivo PDF...")
        file_bytes = await file.read()
        logger.info("Arquivo lido: %s bytes", len(file_bytes))

        if len(file_bytes) > 10 * 1024 * 1024:
            logger.warning("Arquivo muito grande: %s bytes", len(file_bytes))
            raise HTTPException(status_code=422, detail="Arquivo muito grande. Maximo 10MB")

        if len(file_bytes) == 0:
            logger.warning("PDF vazio recebido")
            raise HTTPException(status_code=400, detail="PDF invalido ou vazio")

        logger.info("Extraindo texto do PDF...")
        try:
            resume_text = extract_text_from_pdf(file_bytes)
            logger.info("Texto extraido: %s caracteres", len(resume_text))
            if not resume_text.strip():
                logger.warning("PDF nao contem texto extraivel")
                raise ValueError("PDF esta vazio ou protegido")
        except ValueError as exc:
            logger.error("Erro ao extrair PDF: %s", exc)
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            logger.error("Erro inesperado na extracao: %s", exc)
            raise HTTPException(status_code=400, detail="Erro ao extrair texto do PDF") from exc

        logger.info("Chamando OpenAI API para analise...")
        try:
            analysis_data = generate_analysis(
                resume_text,
                job_description,
                job_title,
                level,
                area,
            )
            logger.info("Analise concluida: atsScore=%s", analysis_data.get("atsScore", "N/A"))
        except OpenAIAnalysisError as exc:
            logger.error("Erro na analise OpenAI: %s", exc)
            if exc.configuration_error:
                raise HTTPException(status_code=503, detail="API key da OpenAI nao configurada no backend.") from exc
            if "timeout" in str(exc).lower():
                raise HTTPException(status_code=503, detail="Timeout da IA. Tente novamente em alguns momentos.") from exc
            raise HTTPException(
                status_code=503,
                detail="Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.",
            ) from exc
        except Exception as exc:
            logger.error("Erro inesperado na IA: %s", exc)
            raise HTTPException(
                status_code=503,
                detail="Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.",
            ) from exc

        logger.info("Gerando curriculo otimizado...")
        optimized_resume = generate_optimized_resume(resume_text, analysis_data, job_description)

        logger.info("Gerando visao do recrutador...")
        recruiter_view = generate_recruiter_view(resume_text, job_title, analysis_data)

        logger.info("Gerando plano de melhoria...")
        improvement_plan = generate_improvement_plan(analysis_data, analysis_data.get("atsScore", 50))

        recruiter_message = f"""Ola [Nome do Recrutador], tudo bem?

Vi a vaga de {job_title} na [Empresa] e acredito que meu perfil se encaixa bem com o que voces buscam.

Tenho experiencia com as tecnologias e habilidades listadas na descricao. Meu portfolio e projetos estao disponiveis em GitHub (se informado: {github or 'Disponivel sob solicitacao'}).

Adoraria conversar sobre como posso contribuir com o time de voces.

Atenciosamente,
[Seu Nome]
{f'LinkedIn: {linkedin}' if linkedin else ''}"""

        cover_letter = f"""Prezado(a) time de recrutamento da [Empresa],

Me candidato a vaga de {job_title} que vi divulgada na plataforma [LinkedIn/Site].

Com experiencia em {area} e expertise em {', '.join(_keyword_names(analysis_data.get("foundKeywords", [])))}, acredito que posso agregar valor significativo ao seu time.

Destaco como principais contribuicoes que posso oferecer:
- Dominio de tecnologias chave para a posicao
- Comprometimento com codigo limpo e boas praticas
- Capacidade de aprendizado rapido e adaptacao

Agradeco a oportunidade de consideracao e fico a disposicao para conversa.

Atenciosamente"""

        result = {
            "atsScore": analysis_data.get("atsScore", 50),
            "jobMatch": analysis_data.get("jobMatch", 50),
            "clarityScore": analysis_data.get("clarityScore", 50),
            "strengths": analysis_data.get("strengths", []),
            "weaknesses": analysis_data.get("weaknesses", []),
            "risks": analysis_data.get("risks", []),
            "foundKeywords": analysis_data.get("foundKeywords", []),
            "missingKeywords": analysis_data.get("missingKeywords", []),
            "sectionSuggestions": analysis_data.get("sectionSuggestions", []),
            "proofCheck": analysis_data.get("proofCheck", []),
            "optimizedResume": optimized_resume,
            "recruiterMessage": recruiter_message,
            "coverLetter": cover_letter,
            "recruiterView": recruiter_view,
            "improvementPlan": improvement_plan,
            "jobTitle": job_title,
            "analyzedAt": datetime.now().isoformat(),
        }

        logger.info("Analise completada com sucesso")
        return result

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Erro nao tratado: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Erro no servidor ao processar analise.") from exc
