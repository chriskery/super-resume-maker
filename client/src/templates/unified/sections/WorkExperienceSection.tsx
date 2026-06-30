import React from 'react';
import type { TemplateConfig } from '../types';
import type { WorkExperience } from '../../../types/resume';
import ExperienceSection from './ExperienceSection';

interface WorkExperienceSectionProps {
  config: TemplateConfig;
  items: WorkExperience[];
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ config, items }) => {
  const mapped = items.map(w => ({
    id: w.id,
    title: w.company,
    subtitle: [w.position, w.department].filter(Boolean).join(' · '),
    location: w.location,
    startDate: w.startDate,
    endDate: w.endDate,
    highlights: w.highlights,
  }));
  return (
    <ExperienceSection
      config={config}
      items={mapped}
      sectionTitle="工作经历"
      sectionKey="workExperience"
    />
  );
};

export default React.memo(WorkExperienceSection);
