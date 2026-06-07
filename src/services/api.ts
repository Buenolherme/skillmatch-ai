import type {
  PdfExtractionResult,
  ResumeAnalysisRequest,
  ResumeAnalysisResult,
} from '../types';

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

async function getErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const body = await response.json();
    return body.detail || body.message;
  } catch {
    return undefined;
  }
}

function connectionError(error: unknown, action: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new ApiError(
      0,
      `Erro de conexão com o servidor ao ${action}. Tente novamente em alguns instantes.`,
      error.message
    );
  }

  return new ApiError(500, `Erro inesperado ao ${action}.`, String(error));
}

function isProofDetectionItem(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.habilidade === 'string' &&
    (item.status === 'comprovacao_parcial' ||
      item.status === 'sem_comprovacao') &&
    (item.risco === 'baixo' ||
      item.risco === 'medio' ||
      item.risco === 'alto') &&
    typeof item.motivo === 'string' &&
    typeof item.como_comprovar === 'string'
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRecruiterPerspective(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const perspective = value as Record<string, unknown>;
  return (
    typeof perspective.resumo === 'string' &&
    isStringArray(perspective.pontos_de_atencao) &&
    isStringArray(perspective.pontos_positivos) &&
    isStringArray(perspective.perguntas_provaveis) &&
    (perspective.risco_de_rejeicao === 'baixo' ||
      perspective.risco_de_rejeicao === 'medio' ||
      perspective.risco_de_rejeicao === 'alto')
  );
}

function isEvolutionPlanItem(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    (item.prioridade === 'alta' ||
      item.prioridade === 'media' ||
      item.prioridade === 'baixa') &&
    typeof item.acao === 'string' &&
    typeof item.impacto_estimado === 'string' &&
    typeof item.prazo_sugerido === 'string'
  );
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

function isCriterionAssessment(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const criterion = value as Record<string, unknown>;
  return (
    isScore(criterion.pontuacao) &&
    typeof criterion.aplicavel === 'boolean' &&
    typeof criterion.justificativa === 'string' &&
    isStringArray(criterion.evidencias)
  );
}

function isAtsCriteria(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const criteria = value as Record<string, unknown>;
  return (
    isCriterionAssessment(criteria.compatibilidade_vaga) &&
    isCriterionAssessment(criteria.habilidades_tecnicas) &&
    isCriterionAssessment(criteria.experiencias) &&
    isCriterionAssessment(criteria.projetos) &&
    isCriterionAssessment(criteria.formacao) &&
    isCriterionAssessment(criteria.certificacoes)
  );
}

function isResumeAnalysisResult(value: unknown): value is ResumeAnalysisResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Record<string, unknown>;
  return (
    isScore(result.ats_score) &&
    isScore(result.compatibilidade) &&
    isStringArray(result.requisitos_obrigatorios_atendidos) &&
    isStringArray(result.requisitos_obrigatorios_ausentes) &&
    typeof result.justificativa_ats === 'string' &&
    typeof result.justificativa_compatibilidade === 'string' &&
    isAtsCriteria(result.criterios) &&
    Array.isArray(result.detector_prova_real) &&
    result.detector_prova_real.every(isProofDetectionItem) &&
    isRecruiterPerspective(result.visao_recrutador) &&
    Array.isArray(result.plano_evolucao) &&
    result.plano_evolucao.every(isEvolutionPlanItem) &&
    isStringArray(result.pontos_fortes) &&
    isStringArray(result.pontos_fracos) &&
    isStringArray(result.palavras_chave_faltantes) &&
    isStringArray(result.plano_de_melhoria) &&
    typeof result.model === 'string'
  );
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
      const detail = await getErrorDetail(response);
      const errorMessage = 'Erro inesperado ao ler o currículo';

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
    throw connectionError(error, 'ler o currículo');
  }
}

export async function analyzeResume(
  input: ResumeAnalysisRequest
): Promise<ResumeAnalysisResult> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('job_title', input.jobTitle.trim());
  formData.append('job_description', input.jobDescription.trim());
  formData.append('level', input.level);
  formData.append('area', input.area);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const detail = await getErrorDetail(response);

      if (response.status === 400 || response.status === 422) {
        throw new ApiError(
          response.status,
          'Não foi possível processar o PDF. Verifique o arquivo e tente novamente.',
          detail
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          429,
          'O serviço de análise está muito ocupado agora. Aguarde um momento e tente novamente.',
          detail
        );
      }

      if (response.status === 504) {
        throw new ApiError(
          504,
          'A análise demorou mais que o esperado. Tente novamente em alguns instantes.',
          detail
        );
      }

      if (response.status === 502 || response.status === 503) {
        throw new ApiError(
          response.status,
          'O serviço de análise está temporariamente indisponível. Tente novamente em alguns instantes.',
          detail
        );
      }

      throw new ApiError(
        response.status,
        'Não foi possível analisar o currículo agora. Tente novamente.',
        detail
      );
    }

    const result: unknown = await response.json();
    if (!isResumeAnalysisResult(result)) {
      throw new ApiError(
        502,
        'A análise retornou dados incompletos. Tente novamente.',
      );
    }

    return result;
  } catch (error) {
    throw connectionError(error, 'analisar o currículo');
  }
}
