import React from 'react';
import type { TemplateConfig } from '../types';
import type { Award } from '../../../types/resume';
import SectionTitle from '../widgets/SectionTitle';

interface AwardsSectionProps {
  config: TemplateConfig;
  items: Award[];
}

const AwardsSection: React.FC<AwardsSectionProps> = ({ config, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title="荣誉奖项" config={config} sectionKey="awards" />
      {items.map((award, i) => (
        <div key={award.id || i} style={{ marginBottom: config.spacing.itemGap }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: config.typography.itemTitleSize,
                color: config.palette.text,
              }}
            >
              {award.title || `奖项 ${i + 1}`}
            </span>
            {award.date && (
              <span
                style={{
                  fontSize: config.typography.bodySize,
                  color: config.palette.textTertiary,
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                {award.date}
              </span>
            )}
          </div>
          {award.description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                marginTop: '2px',
                lineHeight: config.typography.lineHeight,
              }}
            >
              <span
                style={{
                  fontSize: config.typography.bodySize,
                  color: config.palette.textSecondary,
                  flexShrink: 0,
                  lineHeight: config.typography.lineHeight,
                }}
              >
                •
              </span>
              <span
                style={{
                  fontSize: config.typography.bodySize,
                  color: config.palette.textSecondary,
                  lineHeight: config.typography.lineHeight,
                }}
              >
                {award.description}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(AwardsSection);
