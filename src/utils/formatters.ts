export function getScoreColor(score: number): string {
  if (score >= 80) return '#27C9FF';
  if (score >= 60) return '#00B8FF';
  if (score >= 40) return '#8A4DFF';
  return '#B35CFF';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 55) return 'Regular';
  if (score >= 40) return 'Precisa melhorar';
  return 'Crítico';
}

export function getScoreDescription(score: number): string {
  if (score >= 85) return 'Seu currículo está muito bem otimizado para sistemas ATS. Excelentes chances de passar pela triagem automática.';
  if (score >= 70) return 'Seu currículo está bem estruturado. Com alguns ajustes, pode alcançar excelência na triagem ATS.';
  if (score >= 55) return 'Há espaço para melhorias significativas. Implemente as sugestões para aumentar suas chances.';
  if (score >= 40) return 'Seu currículo precisa de atenção. Siga o plano de melhoria para aumentar seu score.';
  return 'Seu currículo precisa de uma revisão completa para passar pelos sistemas ATS.';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateFileName(jobTitle: string): string {
  return `skillmatch-${jobTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  if (priority === 'high') return '#27C9FF';
  if (priority === 'medium') return '#8A4DFF';
  return '#B35CFF';
}

export function getImpactLabel(impact: 'high' | 'medium' | 'low'): string {
  if (impact === 'high') return 'Alto impacto';
  if (impact === 'medium') return 'Médio impacto';
  return 'Baixo impacto';
}
