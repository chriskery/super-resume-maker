import React from 'react';
import type { TemplateConfig } from '../types';
import type { Skill } from '../../../types/resume';
import SectionTitle from '../widgets/SectionTitle';

interface SkillsSectionProps {
  config: TemplateConfig;
  items: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ config, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: config.spacing.sectionGap }}>
      <SectionTitle title="技能" config={config} sectionKey="skills" />
      <div
        style={{
          fontSize: config.typography.bodySize,
          color: config.palette.textSecondary,
          lineHeight: config.typography.lineHeight,
        }}
      >
        {items.map((skill, i) => (
          <div key={i} style={{ marginBottom: config.spacing.bulletGap }}>
            <span style={{ fontWeight: 600, color: config.palette.text }}>
              {skill.category}：
            </span>
            <span>{skill.items}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SkillsSection);
