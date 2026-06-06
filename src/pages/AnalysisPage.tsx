import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadForm } from '../components/UploadForm';
import { LoadingAnalysis } from '../components/LoadingAnalysis';
import { SkillMascote } from '../components/SkillMascote';
import { extractPdfText, ApiError } from '../services/api';

export function AnalysisPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const extraction = await extractPdfText(file);
      navigate('/result', { state: { extraction } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao ler o currículo');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <SkillMascote size="md" animate={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 theme-text">
            Analisar Currículo
          </h1>
          <p className="text-lg theme-text-secondary max-w-2xl mx-auto">
            Envie seu PDF para extrair e visualizar o texto do currículo
          </p>
        </motion.div>

        <UploadForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}
