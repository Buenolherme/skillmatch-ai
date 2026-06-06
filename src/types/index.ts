export interface PdfExtractionResult {
  filename: string;
  text: string;
  characterCount: number;
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

interface ProofItem {
  skill: string;
  status: 'proven' | 'unproven' | 'missing';
  evidence?: string;
  message: string;
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
  proofCheck: ProofItem[];
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
