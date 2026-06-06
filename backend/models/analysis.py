from pydantic import BaseModel
from typing import List

class KeywordItem(BaseModel):
    keyword: str
    found: bool
    importance: str

class SectionSuggestion(BaseModel):
    section: str
    current: str
    suggestion: str
    priority: str

class ProofItem(BaseModel):
    skill: str
    status: str
    evidence: str = None
    message: str

class RecruiterView(BaseModel):
    summary30s: str
    strengths: List[str]
    risks: List[str]
    topSkills: List[str]
    interviewQuestions: List[str]

class ImprovementStep(BaseModel):
    step: int
    action: str
    impact: str
    detail: str

class AnalysisResult(BaseModel):
    atsScore: int
    jobMatch: int
    clarityScore: int
    strengths: List[str]
    weaknesses: List[str]
    foundKeywords: List[KeywordItem]
    missingKeywords: List[KeywordItem]
    sectionSuggestions: List[SectionSuggestion]
    optimizedResume: str
    recruiterMessage: str
    coverLetter: str
    recruiterView: RecruiterView
    proofCheck: List[ProofItem]
    improvementPlan: List[ImprovementStep]
    risks: List[str]
    jobTitle: str
    analyzedAt: str
