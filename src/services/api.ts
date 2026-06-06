import type { AnalysisRequest, AnalysisResult } from '../types';

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

export async function analyzeResume(req: AnalysisRequest): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', req.file);
  formData.append('job_description', req.jobDescription);
  formData.append('job_title', req.jobTitle);
  formData.append('level', req.level);
  formData.append('area', req.area);
  if (req.linkedin) formData.append('linkedin', req.linkedin);
  if (req.github) formData.append('github', req.github);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail: string | undefined;
      const errorMessage = 'Erro inesperado ao analisar o currículo';

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
        throw new ApiError(422, 'Dados inválidos. Verifique o formulário e tente novamente.', detail);
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

      if (response.status === 503) {
        if (detail?.toLowerCase().includes('api key')) {
          throw new ApiError(503, 'Chave da API não configurada. Contate o administrador.', detail);
        }
        if (detail?.toLowerCase().includes('timeout')) {
          throw new ApiError(503, 'Timeout da IA. Tente novamente em alguns momentos.', detail);
        }
        if (detail?.toLowerCase().includes('indisponível')) {
          throw new ApiError(503, 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.', detail);
        }
        throw new ApiError(503, 'Falha ao processar com IA. Tente novamente.', detail);
      }

      if (response.status === 500) {
        throw new ApiError(500, 'Erro interno do servidor. Contate o administrador.', detail);
      }

      throw new ApiError(response.status, errorMessage, detail);
    }

    return (await response.json()) as AnalysisResult;
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

    throw new ApiError(500, 'Erro desconhecido ao analisar o currículo', String(error));
  }
}
