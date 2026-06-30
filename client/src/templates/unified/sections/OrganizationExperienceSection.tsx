import React from 'react';
import type { TemplateConfig } from '../types';
import type { OrganizationExperience } from '../../../types/resume';
import ExperienceSection from './ExperienceSection';

interface OrganizationExperienceSectionProps {
  config: TemplateConfig;
  items: OrganizationExperience[];
}

const OrganizationExperienceSection: React.FC<OrganizationExperienceSectionProps> = ({ config, items }) => {
  const mapped = items.map(o => ({
    id: o.id,
    title: o.name,
    subtitle: [o.role, o.department].filter(Boolean).join(' · '),
    location: o.location,
    startDate: o.startDate,
    endDate: o.endDate,
    highlights: o.highlights,
  }));
  return (
    <ExperienceSection
      config={config}
      items={mapped}
      sectionTitle="社团和组织经历"
      sectionKey="organizationExperience"
    />
  );
};

export default React.memo(OrganizationExperienceSection);
