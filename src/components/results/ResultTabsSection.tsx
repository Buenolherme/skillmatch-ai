import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, AnalysisTab } from '../../types';
import { ResultTabs } from '../ResultTabs';

interface ResultTabsSectionProps {
  result: AnalysisResult;
}

export function ResultTabsSection({ result }: ResultTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <ResultTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        foundKeywords={result.foundKeywords}
        missingKeywords={result.missingKeywords}
        optimizedResume={result.optimizedResume}
        recruiterMessage={result.recruiterMessage}
        sectionSuggestions={result.sectionSuggestions}
        recruiterView={result.recruiterView}
        improvementPlan={result.improvementPlan}
        strengths={result.strengths}
        weaknesses={result.weaknesses}
        risks={result.risks}
      />
    </motion.div>
  );
}
