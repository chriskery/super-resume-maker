import React from 'react';
import type { TemplateConfig } from '../types';
import type { OtherInfo } from '../../../types/resume';
import SectionTitle from '../widgets/SectionTitle';

interface OthersSectionProps {
  config: TemplateConfig;
  others: OtherInfo;
}

const SUB_SECTIONS: { key: keyof OtherInfo; label: string }[] = [
  { key: 'certificates', label: '证书/执照' },
  { key: 'languages', label: '语言' },
  { key: 'hobbies', label: '兴趣爱好' },
];

const OthersSection: React.FC<OthersSectionProps> = ({ config, others }) => {
  if (!others) return null;
  const visible = SUB_SECTIONS.filter(
    s => Array.isArray(others[s.key]) && (others[s.key] as string[]).length > 0,
  );
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title="其他" config={config} sectionKey="others" />
      {visible.map(({ key, label }) => {
        const items = others[key] as string[];
        return (
          <div
            key={key}
            style={{
              marginBottom: config.spacing.bulletGap,
              fontSize: config.typography.bodySize,
              color: config.palette.textSecondary,
              lineHeight: config.typography.lineHeight,
            }}
          >
            <span style={{ fontWeight: 600, color: config.palette.text }}>
              {label}：
            </span>
            <span>{items.join('、')}</span>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(OthersSection);
