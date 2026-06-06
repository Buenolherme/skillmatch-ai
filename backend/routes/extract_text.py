import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from ..utils.pdf_parser import extract_text_from_pdf
except ImportError:
    from utils.pdf_parser import extract_text_from_pdf

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_PDF_SIZE = 10 * 1024 * 1024


@router.post("/extract-text")
async def extract_pdf_text(file: UploadFile = File(...)):
    filename = file.filename or ""
    logger.info("Recebendo PDF para extracao: %s", filename)

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Apenas arquivos PDF sao permitidos")

    file_bytes = await file.read(MAX_PDF_SIZE + 1)

    if not file_bytes:
        raise HTTPException(status_code=400, detail="PDF invalido ou vazio")

    if len(file_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=422, detail="Arquivo muito grande. Maximo 10MB")

    try:
        text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        logger.warning("Falha ao extrair texto de %s: %s", filename, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    logger.info("Texto extraido de %s: %s caracteres", filename, len(text))
    return {
        "filename": filename,
        "text": text,
        "characterCount": len(text),
    }
