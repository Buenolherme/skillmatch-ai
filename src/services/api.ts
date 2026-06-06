import type { PdfExtractionResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
  }
}

export async function extractPdfText(file: File): Promise<PdfExtractionResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/extract-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail: string | undefined;
      const errorMessage = 'Erro inesperado ao ler o currículo';

      try {
        const body = await response.json();
        detail = body.detail || body.message;
      } catch {
        // Error responses are not guaranteed to contain JSON.
      }

      // Mensagens de erro específicas
      if (response.status === 422) {
        if (detail?.toLowerCase().includes('pdf')) {
          throw new ApiError(422, 'PDF inválido. Certifique-se que é um PDF válido.', detail);
        }
        if (detail?.toLowerCase().includes('vazio')) {
          throw new ApiError(422, 'PDF vazio ou sem conteúdo.', detail);
        }
        throw new ApiError(422, 'Arquivo inválido. Verifique o PDF e tente novamente.', detail);
      }

      if (response.status === 400) {
        if (detail?.toLowerCase().includes('extrair')) {
          throw new ApiError(400, 'Erro ao extrair texto do PDF. O arquivo pode estar corrompido ou protegido.', detail);
        }
        if (detail?.toLowerCase().includes('vazio')) {
          throw new ApiError(400, 'PDF vazio. Verifique o arquivo e tente novamente.', detail);
        }
        throw new ApiError(400, 'Não foi possível processar o PDF.', detail);
      }

      if (response.status === 500) {
        throw new ApiError(500, 'Erro interno do servidor. Contate o administrador.', detail);
      }

      throw new ApiError(response.status, errorMessage, detail);
    }

    return (await response.json()) as PdfExtractionResult;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        'Erro de conexão com o servidor. Verifique se o backend está rodando em ' + API_BASE,
        error.message
      );
    }

    throw new ApiError(500, 'Erro desconhecido ao ler o currículo', String(error));
  }
}
