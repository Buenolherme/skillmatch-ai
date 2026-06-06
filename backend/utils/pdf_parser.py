import logging
from io import BytesIO

import PyPDF2

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        logger.info("Iniciando extração de PDF: %s bytes", len(file_bytes))

        # Check if PDF has minimum valid size
        if len(file_bytes) < 100:
            logger.error("PDF muito pequeno para ser válido")
            raise ValueError("PDF inválido ou corrompido (arquivo muito pequeno)")

        pdf_file = BytesIO(file_bytes)
        logger.info("Abrindo arquivo PDF...")

        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
        except Exception as e:
            logger.error("Erro ao ler PDF: %s", e)
            raise ValueError(f"Erro ao ler PDF: {str(e)}")

        num_pages = len(pdf_reader.pages)
        logger.info("PDF carregado com sucesso: %s página(s)", num_pages)

        if num_pages == 0:
            logger.warning("PDF está vazio (0 páginas)")
            raise ValueError("PDF está vazio")

        text = ""
        for page_num, page in enumerate(pdf_reader.pages, 1):
            try:
                page_text = page.extract_text()
                logger.info("Página %s: %s caracteres extraídos", page_num, len(page_text))
                text += page_text
            except Exception as e:
                logger.warning("Erro ao extrair página %s: %s", page_num, e)
                continue

        text = text.strip()
        logger.info("Total extraído: %s caracteres", len(text))

        if not text:
            logger.error("Nenhum texto foi extraído do PDF")
            raise ValueError("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou vazio.")

        logger.info("Extração concluída com sucesso")
        return text

    except ValueError as e:
        logger.error("ValueError na extração: %s", e)
        raise
    except Exception as e:
        logger.error("Erro inesperado na extração: %s", e, exc_info=True)
        raise ValueError(f"Erro ao extrair PDF: {str(e)}")
