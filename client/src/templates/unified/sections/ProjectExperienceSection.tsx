import React from 'react';
import type { TemplateConfig } from '../types';
import type { ProjectExperience } from '../../../types/resume';
import ExperienceSection from './ExperienceSection';

interface ProjectExperienceSectionProps {
  config: TemplateConfig;
  items: ProjectExperience[];
}

const ProjectExperienceSection: React.FC<ProjectExperienceSectionProps> = ({ config, items }) => {
  const mapped = items.map(p => ({
    id: p.id,
    title: p.name,
    subtitle: p.role,
    location: p.location,
    startDate: p.startDate,
    endDate: p.endDate,
    highlights: p.highlights,
  }));
  return (
    <ExperienceSection
      config={config}
      items={mapped}
      sectionTitle="项目经历"
      sectionKey="projectExperience"
    />
  );
};

export default React.memo(ProjectExperienceSection);
