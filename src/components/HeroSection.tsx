import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BarChart3, Target, CheckCircle2, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-clip overflow-y-visible">
      {/* Glow effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-glow-neon-purple rounded-full mix-blend-multiply opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-glow-light rounded-full mix-blend-multiply opacity-20 blur-3xl pointer-events-none dark:hidden" />

      <div className="relative max-w-6xl mx-auto">
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="hero-scout-stack"
          >
            <div className="hero-scout-glow" />
            <div className="hero-scout-layers">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="hero-scout-peek"
              >
                <img
                  src="/Scout_home.png"
                  alt="Scout, especialista em ATS"
                  className="hero-scout-image"
                />
              </motion.div>
            </div>

            <div className="hero-scout-badge">
              <Sparkles className="w-4 h-4 text-neon-blue" />
              <span>Sou Scout, seu especialista em ATS</span>
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 lg:mb-8 leading-tight theme-text">
            <span className="block mb-2 hero-title-primary">Transforme seu currículo</span>
            <span className="bg-gradient-neon bg-clip-text text-transparent">em máquina de entrevistas</span>
          </h1>

          <p className="text-lg sm:text-xl theme-text-secondary mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
            Descubra exatamente por que você está sendo ignorado. Envie seu currículo, cole a vaga e receba análise completa: score ATS, compatibilidade, palavras-chave faltantes e plano de melhoria.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 lg:mb-16">
            <Link to="/analyze" className="btn-primary">
              <span className="flex items-center justify-center gap-2">
                Analisar meu currículo
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link to="/demo" className="btn-secondary">
              Ver análise demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm theme-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neon-blue" />
              <span>Sem cadastro</span>
            </div>
            <div className="hidden sm:block theme-divider">•</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neon-blue" />
              <span>Análise em segundos</span>
            </div>
            <div className="hidden sm:block theme-divider">•</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-neon-blue" />
              <span>Dados privados</span>
            </div>
          </div>
        </motion.div>

        {/* Result Mockup with Neon Glow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16"
        >
          {/* Main Score - Neon Blue Glow */}
          <div className="lg:col-span-1 glass-neon p-8 rounded-2xl hover:glow-neon-blue-lg transition-all">
            <div className="text-center">
              <p className="theme-text-weak text-sm font-medium mb-4 uppercase tracking-wide">
                Score ATS
              </p>
              <div className="relative w-28 h-28 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(39,201,255,0.15)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="6"
                    strokeDasharray="243"
                    strokeDashoffset={Math.max(0, 243 - (243 * 87) / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#27C9FF" />
                      <stop offset="100%" stopColor="#8A4DFF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent">87</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-neon-blue">Excelente</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Compatibility */}
            <div className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs theme-text-weak uppercase tracking-wide">
                    Compatibilidade
                  </p>
                  <p className="text-2xl font-bold mt-2 text-neon-blue">82%</p>
                </div>
              </div>
            </div>

            {/* Skills Found */}
            <div className="glass-neon-purple p-6 rounded-xl hover:shadow-glow-neon-purple transition-all">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs theme-text-weak uppercase tracking-wide">
                    Skills
                  </p>
                  <p className="text-2xl font-bold mt-2 text-neon-purple">14</p>
                </div>
              </div>
            </div>

            {/* Interview Probability */}
            <div className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs theme-text-weak uppercase tracking-wide">
                    Probabilidade
                  </p>
                  <p className="text-2xl font-bold mt-2 text-neon-blue">Alta</p>
                </div>
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="glass-neon-purple p-6 rounded-xl">
              <p className="text-xs theme-text-weak uppercase tracking-wide mb-3 font-semibold">
                Palavras-chave faltando
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Docker', 'REST API'].map((keyword) => (
                  <span key={keyword} className="px-2.5 py-1 rounded-full text-xs font-medium badge-error">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Improvement CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm theme-text-secondary mb-4">
            Acima está um exemplo de análise. Veja como aumentar sua nota:
          </p>
          <div className="badge inline-flex items-center gap-2 px-4 py-2 rounded-lg">
            <BarChart3 className="w-4 h-4 text-neon-blue" />
            <span className="text-sm font-medium">Plano de melhoria com 6 passos práticos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
