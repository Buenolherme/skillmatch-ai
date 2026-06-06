import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import type { AnalysisTab, KeywordItem, SectionSuggestion, ImprovementStep, RecruiterView } from '../types';
import { Copyable } from './Copyable';
import { getImpactLabel, getPriorityColor } from '../utils/formatters';

interface ResultTabsProps {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
  foundKeywords: KeywordItem[];
  missingKeywords: KeywordItem[];
  optimizedResume: string;
  recruiterMessage: string;
  sectionSuggestions: SectionSuggestion[];
  recruiterView: RecruiterView;
  improvementPlan: ImprovementStep[];
  strengths: string[];
  weaknesses: string[];
  risks: string[];
}

export function ResultTabs({
  activeTab,
  onTabChange,
  foundKeywords,
  missingKeywords,
  optimizedResume,
  recruiterMessage,
  sectionSuggestions,
  recruiterView,
  improvementPlan,
  strengths,
  weaknesses,
  risks,
}: ResultTabsProps) {
  const tabs: Array<{ id: AnalysisTab; label: string }> = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'keywords', label: 'Palavras-chave' },
    { id: 'optimized', label: 'Otimizado' },
    { id: 'recruiter-msg', label: 'Mensagem' },
    { id: 'recruiter-view', label: 'Recrutador' },
    { id: 'improvement', label: 'Evolução' },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1 theme-tabs-shell w-max min-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-blue/10 text-neon-blue shadow-sm'
                  : 'theme-text-secondary hover:text-neon-blue'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="glass-neon p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-blue">
                <CheckCircle className="w-5 h-5" />
                Pontos Fortes
              </h3>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-neon-blue mt-0.5 font-semibold">✓</span>
                    <span className="theme-text">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-neon-purple p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-purple">
                <AlertTriangle className="w-5 h-5" />
                Pontos a Melhorar
              </h3>
              <ul className="space-y-3">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-neon-purple mt-0.5 font-semibold">!</span>
                    <span className="theme-text">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {risks.length > 0 && (
              <div className="glass-neon p-6 rounded-2xl border border-error/30 bg-error/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-error">
                  <AlertCircle className="w-5 h-5" />
                  Atenção
                </h3>
                <ul className="space-y-3">
                  {risks.map((r, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-error mt-0.5 font-semibold">⚠</span>
                      <span className="theme-text">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionSuggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all"
                >
                  <h4 className="font-semibold mb-4 text-neon-blue">{s.section}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium theme-text-weak mb-2 uppercase tracking-wide">
                        Atual
                      </p>
                      <p className="text-sm italic line-clamp-2 theme-text-secondary">
                        {s.current}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium theme-text-weak mb-2 uppercase tracking-wide">
                        Sugerido
                      </p>
                      <p className="text-sm theme-text">{s.suggestion}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-neon p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-neon-blue flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Encontradas ({foundKeywords.filter(k => k.found).length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {foundKeywords.filter((k) => k.found).map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-medium"
                  >
                    {k.keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-neon-purple p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-error flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Faltando ({missingKeywords.filter(k => !k.found).length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.filter((k) => !k.found).map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm bg-error/10 border border-error/30 text-error font-medium"
                  >
                    {k.keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimized' && <Copyable text={optimizedResume} label="Currículo Otimizado" />}

        {activeTab === 'recruiter-msg' && (
          <div className="space-y-4">
            <Copyable text={recruiterMessage} label="Mensagem para Recrutador" />
          </div>
        )}

        {activeTab === 'recruiter-view' && (
          <div className="space-y-6">
            <div className="glass-neon p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-3 text-neon-blue">Resumo (30 segundos)</h3>
              <p className="theme-text-secondary leading-relaxed">{recruiterView.summary30s}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-neon p-6 rounded-xl">
                <h4 className="font-semibold mb-4 text-neon-blue flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-2 text-sm theme-text">
                  {recruiterView.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-neon-blue mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-neon-purple p-6 rounded-xl">
                <h4 className="font-semibold mb-4 text-neon-purple flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Possíveis Riscos
                </h4>
                <ul className="space-y-2 text-sm theme-text">
                  {recruiterView.risks.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-neon-purple mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-neon p-6 rounded-2xl">
              <h4 className="font-semibold mb-4 text-neon-blue">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {recruiterView.topSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-neon-purple p-6 rounded-2xl">
              <h4 className="font-semibold mb-4 text-neon-purple flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Perguntas Sugeridas
              </h4>
              <ol className="space-y-3">
                {recruiterView.interviewQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-semibold text-neon-purple flex-shrink-0 w-6">{i + 1}.</span>
                    <span className="theme-text">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'improvement' && (
          <div className="space-y-4">
            {improvementPlan.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all"
              >
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-neon flex items-center justify-center flex-shrink-0 font-bold text-white text-lg">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold theme-text mb-1">{step.action}</h4>
                    <p className="text-xs font-medium" style={{ color: getPriorityColor(step.impact) }}>
                      {getImpactLabel(step.impact)}
                    </p>
                  </div>
                </div>
                <p className="text-sm theme-text-secondary ml-16">{step.detail}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
