import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { demoResult } from '../data/demoData';
import { Copy, RotateCcw, Sparkles } from 'lucide-react';
import { ResultActions } from '../components/results/ResultActions';
import { ResultScoreGrid } from '../components/results/ResultScoreGrid';
import { ResultTabsSection } from '../components/results/ResultTabsSection';

export function DemoPage() {
  const navigate = useNavigate();
  const result = demoResult;

  const handleCopyResume = () => {
    navigator.clipboard.writeText(result.optimizedResume);
    alert('Currículo copiado!');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(result.recruiterMessage);
    alert('Mensagem copiada!');
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
      label: 'Fazer Análise Real',
      icon: RotateCcw,
      onClick: () => navigate('/analyze'),
      className: 'btn-primary flex items-center gap-2',
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Análise Demo</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 theme-text">
            Exemplo de Análise Completa
          </h1>
          <p className="text-lg theme-text-secondary max-w-2xl mx-auto">
            Veja como SkillMatch AI funciona analisando um currículo real. Explore todos os detalhes da análise.
          </p>
        </motion.div>

        <ResultScoreGrid
          result={result}
          compatibilityDescription={`${result.jobMatch}% de compatibilidade com a vaga`}
          clarityDescription="Quão claro e bem estruturado é seu currículo"
        />

        <ResultActions actions={actions} />

        <ResultTabsSection result={result} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 btn-primary"
          >
            <Sparkles className="w-4 h-4" />
            Enviar meu currículo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
