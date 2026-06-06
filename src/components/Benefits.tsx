import { motion } from 'framer-motion';
import { Zap, Lock, Brain } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Análise Instantânea',
    description: 'Resultado em segundos. Sem fila, sem demora. IA processando em tempo real.'
  },
  {
    icon: Lock,
    title: 'Totalmente Privado',
    description: 'Seu currículo não é publicado. Dados usados apenas para gerar análise.'
  },
  {
    icon: Brain,
    title: 'Inteligência Prática',
    description: 'Sugestões acionáveis. Você sabe exatamente o que fazer para melhorar.'
  },
];

export function Benefits() {
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 theme-text">Por que SkillMatch?</h2>
          <p className="theme-text-secondary text-lg max-w-2xl mx-auto">
            Tudo que você precisa para passar na próxima triagem ATS
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="card p-8 text-center hover:glow-subtle transition-all"
            >
              <div className="mb-6 inline-flex p-4 rounded-lg theme-brand-soft">
                <feature.icon className="w-7 h-7 theme-brand-text" />
              </div>
              <h3 className="text-xl font-bold mb-3 theme-text">{feature.title}</h3>
              <p className="theme-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
