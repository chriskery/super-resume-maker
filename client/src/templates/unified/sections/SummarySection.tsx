import React from 'react';
import type { TemplateConfig } from '../types';
import SectionTitle from '../widgets/SectionTitle';

interface SummarySectionProps {
  summary: string;
  config: TemplateConfig;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, config }) => {
  if (!summary) return null;
  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title="个人总结" config={config} sectionKey="summary" />
      <p
        style={{
          margin: 0,
          fontSize: config.typography.bodySize,
          color: config.palette.textSecondary,
          lineHeight: config.typography.lineHeight,
          textAlign: 'justify',
        }}
      >
        {summary}
      </p>
    </div>
  );
};

export default React.memo(SummarySection);
