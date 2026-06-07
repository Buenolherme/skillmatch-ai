import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from ..utils.pdf_upload import PdfUploadError, read_pdf_upload
except ImportError:
    from utils.pdf_upload import PdfUploadError, read_pdf_upload

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/extract-text")
async def extract_pdf_text(file: UploadFile = File(...)):
    filename = file.filename or ""
    logger.info("Recebendo PDF para extracao: %s", filename)

    try:
        filename, text = await read_pdf_upload(file)
    except PdfUploadError as exc:
        logger.warning("Falha ao extrair texto de %s: %s", filename, exc)
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    logger.info("Texto extraido de %s: %s caracteres", filename, len(text))
    return {
        "filename": filename,
        "text": text,
        "characterCount": len(text),
    }
