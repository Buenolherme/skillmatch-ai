import PyPDF2
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        logger.info(f"Iniciando extração de PDF: {len(file_bytes)} bytes")

        # Check if PDF has minimum valid size
        if len(file_bytes) < 100:
            logger.error("PDF muito pequeno para ser válido")
            raise ValueError("PDF inválido ou corrompido (arquivo muito pequeno)")

        pdf_file = BytesIO(file_bytes)
        logger.info("Abrindo arquivo PDF...")

        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
        except Exception as e:
            logger.error(f"Erro ao ler PDF: {str(e)}")
            raise ValueError(f"Erro ao ler PDF: {str(e)}")

        num_pages = len(pdf_reader.pages)
        logger.info(f"PDF carregado com sucesso: {num_pages} página(s)")

        if num_pages == 0:
            logger.warning("PDF está vazio (0 páginas)")
            raise ValueError("PDF está vazio")

        text = ""
        for page_num, page in enumerate(pdf_reader.pages, 1):
            try:
                page_text = page.extract_text()
                logger.info(f"Página {page_num}: {len(page_text)} caracteres extraídos")
                text += page_text
            except Exception as e:
                logger.warning(f"Erro ao extrair página {page_num}: {str(e)}")
                continue

        text = text.strip()
        logger.info(f"Total extraído: {len(text)} caracteres")

        if not text:
            logger.error("Nenhum texto foi extraído do PDF")
            raise ValueError("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou vazio.")

        logger.info("Extração concluída com sucesso")
        return text

    except ValueError as e:
        logger.error(f"ValueError na extração: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado na extração: {str(e)}", exc_info=True)
        raise ValueError(f"Erro ao extrair PDF: {str(e)}")

def extract_keywords(text: str, keywords_to_find: list) -> dict:
    text_lower = text.lower()
    found = []
    missing = []

    for keyword in keywords_to_find:
        keyword_lower = keyword.lower()
        if keyword_lower in text_lower:
            found.append(keyword)
        else:
            missing.append(keyword)

    return {"found": found, "missing": missing}

def calculate_ats_score(resume_text: str, job_description: str, keywords_found: list) -> int:
    score = 50

    # Keywords
    score += min(len(keywords_found) * 3, 30)

    # Formatting bonus
    if any(word in resume_text.lower() for word in ['skills', 'experience', 'education', 'projects']):
        score += 10

    # Contact info
    if any(word in resume_text.lower() for word in ['email', '@', 'linkedin', 'github']):
        score += 5

    # Length check
    if len(resume_text) > 300:
        score += 5

    return min(100, max(0, score))
