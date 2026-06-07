import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  SearchCheck,
  UserRoundSearch,
  Zap,
} from 'lucide-react';
import type {
  AtsCriteria,
  CriterionAssessment,
  ResumeAnalysisResult,
} from '../../types';

interface AnalysisDetailsProps {
  analysis: ResumeAnalysisResult;
}

const CRITERIA_LABELS: Array<{
  key: keyof AtsCriteria;
  label: string;
}> = [
  { key: 'compatibilidade_vaga', label: 'Compatibilidade com a vaga' },
  { key: 'habilidades_tecnicas', label: 'Habilidades técnicas' },
  { key: 'experiencias', label: 'Experiências' },
  { key: 'projetos', label: 'Projetos' },
  { key: 'formacao', label: 'Formação' },
  { key: 'certificacoes', label: 'Certificações' },
];

const RISK_LABELS = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
} as const;

const STATUS_LABELS = {
  comprovacao_parcial: 'Comprovação parcial',
  sem_comprovacao: 'Sem comprovação',
} as const;

function EmptyState({ children }: { children: string }) {
  return <p className="text-sm theme-text-secondary">{children}</p>;
}

function CriteriaCard({
  label,
  criterion,
}: {
  label: string;
  criterion: CriterionAssessment;
}) {
  return (
    <div className="glass-neon p-6 rounded-xl">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h4 className="font-semibold text-neon-blue">{label}</h4>
        <span className="text-sm font-bold text-neon-blue whitespace-nowrap">
          {criterion.aplicavel ? `${criterion.pontuacao}/100` : 'Não aplicável'}
        </span>
      </div>
      <p className="text-sm theme-text-secondary leading-relaxed">
        {criterion.justificativa}
      </p>
      {criterion.evidencias.length > 0 && (
        <ul className="space-y-2 mt-4 text-sm theme-text">
          {criterion.evidencias.map((evidence, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-neon-blue mt-0.5">•</span>
              <span>{evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  const recruiter = analysis.visao_recrutador;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-neon p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-blue">
            <CheckCircle className="w-5 h-5" />
            Pontos Fortes
          </h3>
          {analysis.pontos_fortes.length > 0 ? (
            <ul className="space-y-3">
              {analysis.pontos_fortes.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-neon-blue mt-0.5 font-semibold">✓</span>
                  <span className="theme-text">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>
              Nenhum ponto forte específico foi identificado pela análise.
            </EmptyState>
          )}
        </div>

        <div className="glass-neon-purple p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-purple">
            <AlertTriangle className="w-5 h-5" />
            Pontos a Melhorar
          </h3>
          {analysis.pontos_fracos.length > 0 ? (
            <ul className="space-y-3">
              {analysis.pontos_fracos.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-neon-purple mt-0.5 font-semibold">!</span>
                  <span className="theme-text">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>
              Nenhum ponto fraco específico foi identificado pela análise.
            </EmptyState>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-neon p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-blue">
            <CheckCircle className="w-5 h-5" />
            Requisitos Atendidos
          </h3>
          {analysis.requisitos_obrigatorios_atendidos.length > 0 ? (
            <ul className="space-y-3">
              {analysis.requisitos_obrigatorios_atendidos.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-neon-blue mt-0.5 font-semibold">✓</span>
                  <span className="theme-text">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>
              Nenhum requisito obrigatório foi confirmado no currículo.
            </EmptyState>
          )}
        </div>

        <div className="glass-neon-purple p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-error">
            <AlertCircle className="w-5 h-5" />
            Requisitos Ausentes
          </h3>
          {analysis.requisitos_obrigatorios_ausentes.length > 0 ? (
            <ul className="space-y-3">
              {analysis.requisitos_obrigatorios_ausentes.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-error mt-0.5 font-semibold">!</span>
                  <span className="theme-text">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>
              Nenhum requisito obrigatório ausente foi identificado.
            </EmptyState>
          )}
        </div>
      </div>

      <div className="glass-neon-purple p-6 rounded-2xl">
        <h3 className="font-bold text-lg mb-4 text-error flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Palavras-chave Faltantes
        </h3>
        {analysis.palavras_chave_faltantes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analysis.palavras_chave_faltantes.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm bg-error/10 border border-error/30 text-error font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState>
            Nenhuma palavra-chave relevante está faltando.
          </EmptyState>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xl theme-text flex items-center gap-2">
          <SearchCheck className="w-5 h-5 text-neon-blue" />
          Critérios da Análise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CRITERIA_LABELS.map(({ key, label }) => (
            <CriteriaCard
              key={key}
              label={label}
              criterion={analysis.criterios[key]}
            />
          ))}
        </div>
      </div>

      <div className="glass-neon-purple p-6 rounded-2xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neon-purple">
          <SearchCheck className="w-5 h-5" />
          Detector de Prova Real
        </h3>
        {analysis.detector_prova_real.length > 0 ? (
          <div className="space-y-4">
            {analysis.detector_prova_real.map((item, index) => (
              <div
                key={`${item.habilidade}-${index}`}
                className="border border-neon-purple/20 rounded-xl p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="font-semibold theme-text">{item.habilidade}</h4>
                  <span className="text-sm font-medium text-neon-purple">
                    {STATUS_LABELS[item.status]} • Risco {RISK_LABELS[item.risco]}
                  </span>
                </div>
                <p className="text-sm theme-text-secondary leading-relaxed">
                  {item.motivo}
                </p>
                <p className="text-sm theme-text mt-3">
                  <span className="font-semibold text-neon-blue">
                    Como comprovar:
                  </span>{' '}
                  {item.como_comprovar}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>
            Nenhuma habilidade sem comprovação foi identificada.
          </EmptyState>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-xl theme-text flex items-center gap-2">
          <UserRoundSearch className="w-5 h-5 text-neon-blue" />
          Visão do Recrutador
        </h3>

        <div className="glass-neon p-6 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h4 className="font-semibold text-neon-blue">Resumo</h4>
            <span className="text-sm font-medium text-neon-purple">
              Risco de rejeição: {RISK_LABELS[recruiter.risco_de_rejeicao]}
            </span>
          </div>
          <p className="theme-text-secondary leading-relaxed">
            {recruiter.resumo}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-neon p-6 rounded-xl">
            <h4 className="font-semibold mb-4 text-neon-blue flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Pontos Positivos
            </h4>
            {recruiter.pontos_positivos.length > 0 ? (
              <ul className="space-y-2 text-sm theme-text">
                {recruiter.pontos_positivos.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-neon-blue mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>
                Nenhum ponto positivo adicional foi identificado.
              </EmptyState>
            )}
          </div>

          <div className="glass-neon-purple p-6 rounded-xl">
            <h4 className="font-semibold mb-4 text-neon-purple flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pontos de Atenção
            </h4>
            {recruiter.pontos_de_atencao.length > 0 ? (
              <ul className="space-y-2 text-sm theme-text">
                {recruiter.pontos_de_atencao.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-neon-purple mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>
                Nenhum ponto de atenção adicional foi identificado.
              </EmptyState>
            )}
          </div>
        </div>

        <div className="glass-neon-purple p-6 rounded-2xl">
          <h4 className="font-semibold mb-4 text-neon-purple flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Perguntas Prováveis
          </h4>
          {recruiter.perguntas_provaveis.length > 0 ? (
            <ol className="space-y-3">
              {recruiter.perguntas_provaveis.map((question, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-neon-purple flex-shrink-0 w-6">
                    {index + 1}.
                  </span>
                  <span className="theme-text">{question}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState>
              Nenhuma pergunta provável foi sugerida.
            </EmptyState>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xl theme-text flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-blue" />
          Plano de Evolução
        </h3>
        {analysis.plano_evolucao.length > 0 ? (
          analysis.plano_evolucao.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="glass-neon p-6 rounded-xl hover:shadow-glow-neon-blue transition-all"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-neon flex items-center justify-center flex-shrink-0 font-bold text-white text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="theme-text">{item.acao}</p>
                  <p className="text-sm theme-text-secondary mt-1">
                    Prioridade {item.prioridade} • {item.impacto_estimado} •{' '}
                    {item.prazo_sugerido}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-neon p-6 rounded-xl">
            <EmptyState>
              Nenhuma ação de evolução foi sugerida.
            </EmptyState>
          </div>
        )}
      </div>
    </motion.div>
  );
}
