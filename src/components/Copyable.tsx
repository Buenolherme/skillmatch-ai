import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CopyableProps {
  text: string;
  label: string;
}

export function Copyable({ text, label }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold theme-text">{label}</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="p-2.5 rounded-lg hover:bg-brand-purple/10 transition-colors"
        >
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="block"
          >
            {copied
              ? <Check className="w-4 h-4 text-success" />
              : <Copy className="w-4 h-4 theme-text-secondary" />
            }
          </motion.span>
        </motion.button>
      </div>
      <pre className="text-sm theme-text-secondary whitespace-pre-wrap break-words overflow-hidden max-h-96 theme-code-surface p-4 rounded-lg leading-relaxed font-mono">
        {text}
      </pre>
    </div>
  );
}
