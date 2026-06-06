import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ScoutSection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-neon-blue/[0.03] to-transparent overflow-visible">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 theme-text">
            Conheça o Scout
          </h2>
          <p className="theme-text-secondary text-lg">
            Seu especialista inteligente em análise de currículos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-10 lg:gap-16 items-center"
        >
          <div className="flex justify-center order-first lg:order-none overflow-visible">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex justify-center w-full py-2.5 overflow-visible"
            >
              <div
                className="absolute rounded-full blur-3xl -z-10 opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(39,201,255,0.24) 0%, rgba(138,77,255,0.20) 46%, transparent 74%)',
                  width: '620px',
                  height: '520px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              <img
                src="/ChatGPT_Image_5_de_jun._de_2026,_18_33_25.png"
                alt="Scout - Analisando currículo"
                className="block w-full h-auto max-w-[36rem] rounded-2xl object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 24px 70px rgba(39,201,255,0.24)) drop-shadow(0 14px 36px rgba(138,77,255,0.20))',
                }}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg theme-text-secondary leading-relaxed">
              Scout é seu especialista em ATS e recrutamento. Ele analisa seu currículo com inteligência artificial de ponta, identifica problemas que impedem você de passar em triagens automáticas e mostra exatamente o que melhorar.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold theme-text mb-1">Analisa palavras-chave</p>
                  <p className="text-sm theme-text-secondary">Detecta quais termos importantes estão faltando no seu currículo</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-purple mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold theme-text mb-1">Calcula score ATS</p>
                  <p className="text-sm theme-text-secondary">Mede como seu currículo é classificado por sistemas de triagem</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold theme-text mb-1">Gera plano de melhoria</p>
                  <p className="text-sm theme-text-secondary">Apresenta ações práticas e prioritárias para aumentar suas chances</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/analyze" className="inline-flex items-center gap-2 btn-primary">
                Conhecer Scout na prática
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
