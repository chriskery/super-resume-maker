import React from 'react';
import type { TemplateConfig } from '../types';
import SectionTitle from '../widgets/SectionTitle';
import BulletList from '../widgets/BulletList';

export interface ExperienceItem {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

interface ExperienceSectionProps {
  config: TemplateConfig;
  items: ExperienceItem[];
  sectionTitle: string;
  sectionKey: string;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  config,
  items,
  sectionTitle,
  sectionKey,
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title={sectionTitle} config={config} sectionKey={sectionKey} />
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: config.spacing.itemGap }}>
          {/* Row 1: title + date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: config.typography.itemTitleSize,
                  color: config.palette.text,
                }}
              >
                {item.title}
              </span>
              {item.subtitle && (
                <span
                  style={{
                    fontSize: config.typography.bodySize,
                    color: config.palette.textTertiary,
                  }}
                >
                  · {item.subtitle}
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: config.typography.bodySize,
                color: config.palette.textTertiary,
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              {item.startDate} - {item.endDate}
            </span>
          </div>
          {/* Row 2: location only */}
          {item.location && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginTop: '2px',
              }}
            >
              <span
                style={{
                  fontSize: config.typography.bodySize,
                  color: config.palette.textSecondary,
                }}
              >
                {item.location}
              </span>
            </div>
          )}
          {/* Highlights */}
          <BulletList items={item.highlights} config={config} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(ExperienceSection);
