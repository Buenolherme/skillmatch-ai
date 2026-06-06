import { motion } from 'framer-motion';
import type { AnalysisResult } from '../../types';
import { getScoreDescription } from '../../utils/formatters';
import { ScoreCard } from '../ScoreCard';

interface ResultScoreGridProps {
  result: AnalysisResult;
  compatibilityDescription: string;
  clarityDescription: string;
}

export function ResultScoreGrid({
  result,
  compatibilityDescription,
  clarityDescription,
}: ResultScoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ScoreCard
          score={result.atsScore}
          label="Score ATS"
          description={getScoreDescription(result.atsScore)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ScoreCard
          score={result.jobMatch}
          label="Compatibilidade"
          description={compatibilityDescription}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ScoreCard
          score={result.clarityScore}
          label="Clareza"
          description={clarityDescription}
        />
      </motion.div>
    </div>
  );
}
