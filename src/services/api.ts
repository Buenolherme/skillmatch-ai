import type { AnalysisRequest, AnalysisResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    console.error(`[API Error ${status}] ${message}`, detail);
  }
}

export async function analyzeResume(req: AnalysisRequest): Promise<AnalysisResult> {
  console.log('[Frontend] Iniciando análise:', {
    arquivo: req.file.name,
    tamanho: req.file.size,
    cargo: req.jobTitle,
    area: req.area,
  });

  const formData = new FormData();
  formData.append('file', req.file);
  formData.append('job_description', req.jobDescription);
  formData.append('job_title', req.jobTitle);
  formData.append('level', req.level);
  formData.append('area', req.area);
  if (req.linkedin) formData.append('linkedin', req.linkedin);
  if (req.github) formData.append('github', req.github);

  console.log('[Frontend] Enviando FormData para:', `${API_BASE}/analyze`);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    console.log('[Frontend] Resposta recebida:', {
      status: response.status,
      ok: response.ok,
      headers: {
        contentType: response.headers.get('content-type'),
      },
    });

    if (!response.ok) {
      let detail: string | undefined;
      const errorMessage = 'Erro inesperado ao analisar o currículo';

      try {
        const body = await response.json();
        detail = body.detail || body.message;
        console.error('[Frontend] Detalhes do erro:', body);
      } catch (e) {
        console.error('[Frontend] Erro ao parsear resposta de erro:', e);
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

    console.log('[Frontend] Parseando resposta JSON...');
    const result = (await response.json()) as AnalysisResult;
    console.log('[Frontend] Análise concluída com sucesso:', {
      atsScore: result.atsScore,
      jobMatch: result.jobMatch,
    });
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      console.error('[Frontend] Erro de conexão:', error.message);
      throw new ApiError(
        0,
        'Erro de conexão com o servidor. Verifique se o backend está rodando em ' + API_BASE,
        error.message
      );
    }

    console.error('[Frontend] Erro desconhecido:', error);
    throw new ApiError(500, 'Erro desconhecido ao analisar o currículo', String(error));
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    console.log('[Frontend] Verificando saúde do backend...');
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    const ok = response.ok;
    console.log('[Frontend] Backend status:', ok ? 'OK' : 'ERRO');
    return ok;
  } catch (error) {
    console.error('[Frontend] Erro ao verificar saúde:', error);
    return false;
  }
}
