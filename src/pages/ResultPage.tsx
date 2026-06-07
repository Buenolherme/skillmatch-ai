import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { AnalysisDetails } from '../components/results/AnalysisDetails';
import { ResultActions } from '../components/results/ResultActions';
import { ScoreCard } from '../components/ScoreCard';
import type { ResumeAnalysisResult } from '../types';

interface ResultLocationState {
  analysis?: ResumeAnalysisResult;
  filename?: string;
  jobTitle?: string;
}

function formatAnalysis(result: ResumeAnalysisResult): string {
  const criteria = [
    ['Compatibilidade com a vaga', result.criterios.compatibilidade_vaga],
    ['Habilidades técnicas', result.criterios.habilidades_tecnicas],
    ['Experiências', result.criterios.experiencias],
    ['Projetos', result.criterios.projetos],
    ['Formação', result.criterios.formacao],
    ['Certificações', result.criterios.certificacoes],
  ] as const;

  return [
    `Score ATS: ${result.ats_score}`,
    result.justificativa_ats,
    `Compatibilidade: ${result.compatibilidade}`,
    result.justificativa_compatibilidade,
    '',
    'Critérios:',
    ...criteria.map(
      ([label, criterion]) =>
        `- ${label}: ${
          criterion.aplicavel ? `${criterion.pontuacao}/100` : 'não aplicável'
        } — ${criterion.justificativa}`
    ),
    '',
    'Pontos fortes:',
    ...result.pontos_fortes.map((item) => `- ${item}`),
    '',
    'Pontos fracos:',
    ...result.pontos_fracos.map((item) => `- ${item}`),
    '',
    'Palavras-chave faltantes:',
    ...result.palavras_chave_faltantes.map((item) => `- ${item}`),
    '',
    'Requisitos obrigatórios atendidos:',
    ...result.requisitos_obrigatorios_atendidos.map((item) => `- ${item}`),
    '',
    'Requisitos obrigatórios ausentes:',
    ...result.requisitos_obrigatorios_ausentes.map((item) => `- ${item}`),
    '',
    'Detector de prova real:',
    ...result.detector_prova_real.map(
      (item) =>
        `- ${item.habilidade}: ${item.status}, risco ${item.risco}. ` +
        `${item.motivo} Como comprovar: ${item.como_comprovar}`
    ),
    '',
    'Visão do recrutador:',
    result.visao_recrutador.resumo,
    `Risco de rejeição: ${result.visao_recrutador.risco_de_rejeicao}`,
    ...result.visao_recrutador.pontos_de_atencao.map(
      (item) => `- Atenção: ${item}`
    ),
    ...result.visao_recrutador.pontos_positivos.map(
      (item) => `- Positivo: ${item}`
    ),
    ...result.visao_recrutador.perguntas_provaveis.map(
      (item) => `- Pergunta provável: ${item}`
    ),
    '',
    'Plano de evolução:',
    ...result.plano_evolucao.map(
      (item, index) =>
        `${index + 1}. [${item.prioridade}] ${item.acao} ` +
        `(${item.impacto_estimado}, ${item.prazo_sugerido})`
    ),
  ].join('\n');
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;
  const analysis = state?.analysis;

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-brand-purple" />
            </div>
          </motion.div>
          <p className="theme-text-secondary mb-6">
            Nenhuma análise disponível
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary"
          >
            Analisar currículo
          </button>
        </div>
      </div>
    );
  }

  const handleCopyAnalysis = () => {
    navigator.clipboard.writeText(formatAnalysis(analysis));
    alert('Análise copiada!');
  };

  const actions = [
    {
      label: 'Copiar Análise',
      icon: Copy,
      onClick: handleCopyAnalysis,
      className: 'btn-secondary flex items-center gap-2',
    },
    {
      label: 'Nova Análise',
      icon: RotateCcw,
      onClick: () => navigate('/analyze'),
      className: 'btn-secondary flex items-center gap-2',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 theme-text">
            Análise do Currículo
          </h1>
          <p className="theme-text-secondary text-lg">
            {[state?.filename, state?.jobTitle].filter(Boolean).join(' • ')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreCard
              score={analysis.ats_score}
              label="Score ATS"
              description={analysis.justificativa_ats}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ScoreCard
              score={analysis.compatibilidade}
              label="Compatibilidade"
              description={analysis.justificativa_compatibilidade}
            />
          </motion.div>
        </div>

        <ResultActions actions={actions} />

        <AnalysisDetails analysis={analysis} />
      </div>
    </div>
  );
}
