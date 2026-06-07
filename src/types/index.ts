export interface PdfExtractionResult {
  filename: string;
  text: string;
  characterCount: number;
}

export interface ResumeAnalysisRequest {
  file: File;
  jobTitle: string;
  jobDescription: string;
  level: 'estagio' | 'junior' | 'pleno';
  area: string;
}

export interface ProofDetectionItem {
  habilidade: string;
  status: 'comprovacao_parcial' | 'sem_comprovacao';
  risco: 'baixo' | 'medio' | 'alto';
  motivo: string;
  como_comprovar: string;
}

export interface RecruiterPerspective {
  resumo: string;
  pontos_de_atencao: string[];
  pontos_positivos: string[];
  perguntas_provaveis: string[];
  risco_de_rejeicao: 'baixo' | 'medio' | 'alto';
}

export interface EvolutionPlanItem {
  prioridade: 'alta' | 'media' | 'baixa';
  acao: string;
  impacto_estimado: string;
  prazo_sugerido: string;
}

export interface ResumeAnalysisResult {
  ats_score: number;
  compatibilidade: number;
  detector_prova_real: ProofDetectionItem[];
  visao_recrutador: RecruiterPerspective;
  plano_evolucao: EvolutionPlanItem[];
  pontos_fortes: string[];
  pontos_fracos: string[];
  palavras_chave_faltantes: string[];
  plano_de_melhoria: string[];
}

export interface KeywordItem {
  keyword: string;
  found: boolean;
  importance: 'high' | 'medium' | 'low';
}

export interface SectionSuggestion {
  section: string;
  current: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RecruiterView {
  summary30s: string;
  strengths: string[];
  risks: string[];
  topSkills: string[];
  interviewQuestions: string[];
}

export interface ImprovementStep {
  step: number;
  action: string;
  impact: 'high' | 'medium' | 'low';
  detail: string;
}

export interface AnalysisResult {
  atsScore: number;
  jobMatch: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  foundKeywords: KeywordItem[];
  missingKeywords: KeywordItem[];
  sectionSuggestions: SectionSuggestion[];
  optimizedResume: string;
  recruiterMessage: string;
  coverLetter: string;
  recruiterView: RecruiterView;
  detectorProvaReal: ProofDetectionItem[];
  improvementPlan: ImprovementStep[];
  risks: string[];
  jobTitle: string;
  analyzedAt: string;
}

export type Theme = 'dark' | 'light';

export type AnalysisTab =
  | 'overview'
  | 'keywords'
  | 'optimized'
  | 'recruiter-msg'
  | 'recruiter-view'
  | 'improvement';
