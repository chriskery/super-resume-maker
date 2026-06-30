import React from 'react';
import type { TemplateConfig } from '../types';
import type { Education } from '../../../types/resume';
import SectionTitle from '../widgets/SectionTitle';
import BulletList from '../widgets/BulletList';

interface EducationSectionProps {
  config: TemplateConfig;
  items: Education[];
}

const EducationSection: React.FC<EducationSectionProps> = ({ config, items }) => {
  if (!items || items.length === 0) return null;
  const primary = config.palette.primary;
  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title="教育经历" config={config} sectionKey="education" />
      {items.map((edu) => (
        <div key={edu.id} style={{ marginBottom: config.spacing.itemGap }}>
          {/* Row 1: school + tags | date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: config.typography.itemTitleSize,
                  color: config.palette.text,
                }}
              >
                {edu.school}
              </span>
              {edu.tags &&
                edu.tags.map((tag, ti) => (
                  <span
                    key={ti}
                    style={{
                      fontSize: '10px',
                      color: primary,
                      backgroundColor: `${primary}18`,
                      borderRadius: '3px',
                      padding: '0 5px',
                      lineHeight: '16px',
                      display: 'inline-block',
                      marginLeft: '4px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
            <span
              style={{
                fontSize: config.typography.bodySize,
                color: config.palette.textTertiary,
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              {edu.startDate} - {edu.endDate}
            </span>
          </div>
          {/* Row 2: degree + major */}
          <div
            style={{
              fontSize: config.typography.bodySize,
              color: config.palette.textSecondary,
              marginTop: '2px',
            }}
          >
            {[edu.degree, edu.major].filter(Boolean).join(' · ')}
          </div>
          {/* Highlights */}
          <BulletList items={edu.highlights} config={config} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(EducationSection);
