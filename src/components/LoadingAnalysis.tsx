import { motion } from 'framer-motion';
import scoutAnalystImage from '../assets/scout-analyst.png';

const steps = [
  { text: 'Recebendo arquivo PDF', message: 'Deixe comigo...' },
  { text: 'Validando o documento', message: 'Tudo certo!' },
  { text: 'Lendo páginas', message: 'Processando...' },
  { text: 'Extraindo texto do PDF', message: 'Quase lá!' },
  { text: 'Organizando conteúdo', message: 'Finalizando...' },
  { text: 'Preparando resultado', message: 'Pronto!' },
];

export function LoadingAnalysis() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="glass-neon p-8 md:p-12 rounded-2xl">
          {/* Mascote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-36 h-36"
              style={{
                filter:
                  'drop-shadow(0 0 12px rgba(39, 201, 255, 0.4)) drop-shadow(0 0 24px rgba(138, 77, 255, 0.35))',
              }}
            >
              <img
                src={scoutAnalystImage}
                alt="Scout Analyst analisando o currículo"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-neon bg-clip-text text-transparent"
          >
            Lendo seu currículo
          </motion.h2>

          {/* Subtitle with personality */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center theme-text-secondary mb-8"
          >
            Estou extraindo o texto do seu PDF.
          </motion.p>

          {/* Steps Timeline */}
          <div className="space-y-3 mb-8 theme-muted-panel rounded-xl p-6 backdrop-blur-sm">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3"
              >
                {/* Animated spinner */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-5 h-5 rounded-full border-2 border-neon-blue border-t-neon-purple flex-shrink-0"
                />

                {/* Step info */}
                <div className="flex-1">
                  <span className="text-sm font-medium theme-text block">
                    {step.text}
                  </span>
                  <span className="text-xs theme-text-weak">
                    {step.message}
                  </span>
                </div>

                {/* Checkmark after completion */}
                {idx < steps.length - 1 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.08 + 0.4 }}
                    className="text-success text-lg"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2.5 h-2.5 rounded-full bg-gradient-neon"
              />
            ))}
          </div>

          {/* Progress info */}
          <p className="text-center text-xs theme-text-secondary">
            Isso geralmente leva menos de 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
}
