import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ResultAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className: string;
}

interface ResultActionsProps {
  actions: ResultAction[];
}

export function ResultActions({ actions }: ResultActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="flex flex-wrap gap-3 mb-12 justify-center"
    >
      {actions.map(({ label, icon: Icon, onClick, className }) => (
        <button
          key={label}
          onClick={onClick}
          className={className}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </motion.div>
  );
}
