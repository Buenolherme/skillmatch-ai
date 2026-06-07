from dataclasses import dataclass

from fastapi import UploadFile

try:
    from .pdf_parser import extract_text_from_pdf
except ImportError:
    from pdf_parser import extract_text_from_pdf

MAX_PDF_SIZE = 10 * 1024 * 1024


@dataclass
class PdfUploadError(ValueError):
    message: str
    status_code: int

    def __str__(self) -> str:
        return self.message


async def read_pdf_upload(file: UploadFile) -> tuple[str, str]:
    filename = file.filename or ""

    if not filename.lower().endswith(".pdf"):
        raise PdfUploadError("Apenas arquivos PDF sao permitidos", 422)

    file_bytes = await file.read(MAX_PDF_SIZE + 1)

    if not file_bytes:
        raise PdfUploadError("PDF invalido ou vazio", 400)

    if len(file_bytes) > MAX_PDF_SIZE:
        raise PdfUploadError("Arquivo muito grande. Maximo 10MB", 422)

    try:
        text = extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise PdfUploadError(str(exc), 400) from exc

    return filename, text
