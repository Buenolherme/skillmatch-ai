import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getScoreColor, getScoreLabel } from '../utils/formatters';

interface ScoreCardProps {
  score: number;
  label: string;
  description?: string;
}

export function ScoreCard({ score, label, description }: ScoreCardProps) {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-neon p-8 rounded-2xl text-center hover:glow-neon-blue-lg transition-all"
    >
      <h3 className="text-sm font-medium theme-text-weak mb-6 uppercase tracking-wide">
        {label}
      </h3>
      <div className="w-32 h-32 mx-auto mb-6">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            rotation: 0,
            strokeLinecap: 'round',
            textSize: '32px',
            pathTransitionDuration: 1.5,
            pathColor: color,
            textColor: color,
            trailColor: 'rgba(39,201,255,0.1)',
            backgroundColor: 'transparent',
          })}
        />
      </div>
      <p className="text-2xl font-bold mb-2 text-neon-blue">{scoreLabel}</p>
      {description && (
        <p className="text-sm theme-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
