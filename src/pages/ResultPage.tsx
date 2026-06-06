import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Download, RotateCcw } from 'lucide-react';
import { Copyable } from '../components/Copyable';
import { ResultActions } from '../components/results/ResultActions';
import type { PdfExtractionResult } from '../types';

interface ResultLocationState {
  extraction?: PdfExtractionResult;
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const extraction = (location.state as ResultLocationState | null)?.extraction;

  if (!extraction) {
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
            Nenhum texto extraído disponível
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary"
          >
            Enviar PDF
          </button>
        </div>
      </div>
    );
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(extraction.text);
    alert('Texto copiado!');
  };

  const handleDownloadText = () => {
    const url = URL.createObjectURL(
      new Blob([extraction.text], { type: 'text/plain;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${extraction.filename.replace(/\.pdf$/i, '')}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const actions = [
    {
      label: 'Copiar Texto',
      icon: Copy,
      onClick: handleCopyText,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Baixar Texto',
      icon: Download,
      onClick: handleDownloadText,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Novo PDF',
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
            Texto extraído do PDF
          </h1>
          <p className="theme-text-secondary text-lg">
            {extraction.filename} • {extraction.characterCount} caracteres
          </p>
        </motion.div>

        <ResultActions actions={actions} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Copyable
            text={extraction.text}
            label="Conteúdo extraído"
            scrollable
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 glass-neon p-6 rounded-2xl text-center text-sm theme-text-secondary border border-neon-blue/30"
        >
          <p>O texto acima foi extraído diretamente do PDF enviado.</p>
        </motion.div>
      </div>
    </div>
  );
}
