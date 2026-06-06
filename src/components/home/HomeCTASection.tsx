import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomeCTASection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 theme-text">
            Pronto para começar?
          </h2>
          <p className="theme-text-secondary text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Sua análise de currículo espera. Descubra exatamente o que você precisa para passar na próxima triagem ATS.
          </p>
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
            Começar análise agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
