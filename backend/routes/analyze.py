import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

try:
    from ..services.gemini_analyzer import (
        GeminiAnalysisError,
        ResumeAnalysis,
        generate_resume_analysis,
    )
    from ..utils.pdf_upload import PdfUploadError, read_pdf_upload
except ImportError:
    from services.gemini_analyzer import (
        GeminiAnalysisError,
        ResumeAnalysis,
        generate_resume_analysis,
    )
    from utils.pdf_upload import PdfUploadError, read_pdf_upload

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(default=""),
    job_title: str = Form(default=""),
    level: str = Form(default=""),
    area: str = Form(default=""),
) -> ResumeAnalysis:
    filename = file.filename or ""
    logger.info("Recebendo PDF para analise: %s", filename)

    try:
        filename, resume_text = await read_pdf_upload(file)
    except PdfUploadError as exc:
        logger.warning("Falha ao ler PDF %s: %s", filename, exc)
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    try:
        analysis = await generate_resume_analysis(
            resume_text,
            job_description=job_description,
            job_title=job_title,
            level=level,
            area=area,
        )
        logger.info(
            "Analise concluida: arquivo=%s modelo_usado=%s",
            filename,
            analysis.model,
        )
        return analysis
    except GeminiAnalysisError as exc:
        logger.error(
            "Falha na analise Gemini: arquivo=%s modelo=%s http_status=%s "
            "provider_status=%s mensagem_original=%s resposta_http=%s",
            filename,
            exc.model,
            exc.status_code,
            exc.provider_status,
            exc,
            exc.response_body,
        )
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
