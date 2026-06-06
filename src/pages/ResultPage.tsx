import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ResultActions } from '../components/results/ResultActions';
import { ResultScoreGrid } from '../components/results/ResultScoreGrid';
import { ResultTabsSection } from '../components/results/ResultTabsSection';
import type { AnalysisResult } from '../types';
import { formatDate } from '../utils/formatters';

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result: AnalysisResult | null = location.state?.result;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-brand-purple" />
            </div>
          </motion.div>
          <p className="theme-text-secondary mb-6">
            Nenhuma análise disponível
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary"
          >
            Fazer Análise
          </button>
        </div>
      </div>
    );
  }

  const handleCopyResume = () => {
    navigator.clipboard.writeText(result.optimizedResume);
    alert('Currículo copiado!');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(result.recruiterMessage);
    alert('Mensagem copiada!');
  };

  const handleDownloadPDF = () => {
    const content = `
SkillMatch AI - Análise de Currículo
${formatDate(result.analyzedAt)}

RESULTADO GERAL
Score ATS: ${result.atsScore}
Compatibilidade com Vaga: ${result.jobMatch}%
Clareza do Currículo: ${result.clarityScore}

PONTOS FORTES
${result.strengths.map((s) => `• ${s}`).join('\n')}

PONTOS A MELHORAR
${result.weaknesses.map((w) => `• ${w}`).join('\n')}

RISCOS
${result.risks.map((r) => `• ${r}`).join('\n')}

PALAVRAS-CHAVE ENCONTRADAS
${result.foundKeywords.filter((k) => k.found).map((k) => k.keyword).join(', ')}

PALAVRAS-CHAVE FALTANDO
${result.foundKeywords.filter((k) => !k.found).map((k) => k.keyword).join(', ')}

PLANO DE MELHORIA
${result.improvementPlan.map((p) => `${p.step}. ${p.action}\n${p.detail}`).join('\n\n')}
    `;

    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillmatch-analise-${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const actions = [
    {
      label: 'Copiar Currículo',
      icon: Copy,
      onClick: handleCopyResume,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Copiar Mensagem',
      icon: Copy,
      onClick: handleCopyMessage,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Baixar Análise',
      icon: Download,
      onClick: handleDownloadPDF,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Nova Análise',
      icon: RotateCcw,
      onClick: () => navigate('/analyze'),
      className: 'btn-secondary flex items-center gap-2',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 theme-text">
            Sua Análise Completa
          </h1>
          <p className="theme-text-secondary text-lg">
            {result.jobTitle} • {formatDate(result.analyzedAt)}
          </p>
        </motion.div>

        <ResultScoreGrid
          result={result}
          compatibilityDescription={`${result.jobMatch}% de alinhamento com a vaga`}
          clarityDescription="Estrutura e organização do seu currículo"
        />

        <ResultActions actions={actions} />

        <ResultTabsSection result={result} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 glass-neon p-6 rounded-2xl text-center text-sm theme-text-secondary border border-neon-blue/30"
        >
          <p className="mb-2 font-medium">Análise gerada por IA. Valide as sugestões antes de usar.</p>
          <p>Seu currículo não é publicado. Análise serve apenas para gerar este resultado.</p>
        </motion.div>
      </div>
    </div>
  );
}
