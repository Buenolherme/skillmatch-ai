import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ResultActions } from '../components/results/ResultActions';
import { ScoreCard } from '../components/ScoreCard';
import { getScoreDescription } from '../utils/formatters';
import type { ResumeAnalysisResult } from '../types';

interface ResultLocationState {
  analysis?: ResumeAnalysisResult;
  filename?: string;
  jobTitle?: string;
}

function formatAnalysis(result: ResumeAnalysisResult): string {
  return [
    `Score ATS: ${result.ats_score}`,
    `Compatibilidade: ${result.compatibilidade}`,
    '',
    'Pontos fortes:',
    ...result.pontos_fortes.map((item) => `- ${item}`),
    '',
    'Pontos fracos:',
    ...result.pontos_fracos.map((item) => `- ${item}`),
    '',
    'Palavras-chave faltantes:',
    ...result.palavras_chave_faltantes.map((item) => `- ${item}`),
    '',
    'Plano de melhoria:',
    ...result.plano_de_melhoria.map((item, index) => `${index + 1}. ${item}`),
  ].join('\n');
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;
  const analysis = state?.analysis;

  if (!analysis) {
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
            Analisar currículo
          </button>
        </div>
      </div>
    );
  }

  const handleCopyAnalysis = () => {
    navigator.clipboard.writeText(formatAnalysis(analysis));
    alert('Análise copiada!');
  };

  const actions = [
    {
      label: 'Copiar Análise',
      icon: Copy,
      onClick: handleCopyAnalysis,
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
            Análise do Currículo
          </h1>
          <p className="theme-text-secondary text-lg">
            {[state?.filename, state?.jobTitle].filter(Boolean).join(' • ')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreCard
              score={analysis.ats_score}
              label="Score ATS"
              description={getScoreDescription(analysis.ats_score)}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ScoreCard
              score={analysis.compatibilidade}
              label="Compatibilidade"
              description={`${analysis.compatibilidade}% de compatibilidade com a vaga`}
            />
          </motion.div>
        </div>

        <ResultActions actions={actions} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-neon p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-blue">
                <CheckCircle className="w-5 h-5" />
                Pontos Fortes
              </h3>
              <ul className="space-y-3">
                {analysis.pontos_fortes.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-neon-blue mt-0.5 font-semibold">✓</span>
                    <span className="theme-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-neon-purple p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-purple">
                <AlertTriangle className="w-5 h-5" />
                Pontos a Melhorar
              </h3>
              <ul className="space-y-3">
                {analysis.pontos_fracos.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-neon-purple mt-0.5 font-semibold">!</span>
                    <span className="theme-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-neon-purple p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4 text-error flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Palavras-chave Faltantes
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.palavras_chave_faltantes.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full text-sm bg-error/10 border border-error/30 text-error font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl theme-text flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-blue" />
              Plano de Melhoria
            </h3>
            {analysis.plano_de_melhoria.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-neon flex items-center justify-center flex-shrink-0 font-bold text-white text-lg">
                    {index + 1}
                  </div>
                  <p className="theme-text">{item}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
