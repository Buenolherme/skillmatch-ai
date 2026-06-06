import { motion } from 'framer-motion';
import { Upload, FileText, Zap, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Envie seu currículo',
    description: 'PDF. Arquivo seguro, sem armazenamento.'
  },
  {
    icon: FileText,
    title: 'Cole a descrição da vaga',
    description: 'Copie e cole qualquer vaga. Qualquer empresa.'
  },
  {
    icon: Zap,
    title: 'IA analisa tudo',
    description: 'Score ATS, compatibilidade, palavras-chave faltantes'
  },
  {
    icon: CheckCircle2,
    title: 'Receba o plano',
    description: '6 passos práticos para aumentar sua nota'
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 theme-text">Como funciona</h2>
          <p className="theme-text-secondary text-lg max-w-2xl mx-auto">
            4 passos simples para transformar seu currículo em uma máquina de entrevistas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 lg:p-8 relative group"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-premium flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {idx + 1}
              </div>

              {/* Icon */}
              <div className="mb-6 p-3 rounded-lg w-fit theme-brand-soft transition-colors">
                <step.icon className="w-6 h-6 theme-brand-text" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2 theme-text">{step.title}</h3>
              <p className="text-sm theme-text-secondary">
                {step.description}
              </p>

              {/* Arrow to next step */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 theme-divider">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
