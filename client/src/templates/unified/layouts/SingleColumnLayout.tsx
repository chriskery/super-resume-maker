import React from 'react';
import type { Resume } from '../../../types/resume';
import type { TemplateConfig } from '../types';
import HeaderSection from '../sections/HeaderSection';
import SummarySection from '../sections/SummarySection';
import EducationSection from '../sections/EducationSection';
import WorkExperienceSection from '../sections/WorkExperienceSection';
import ProjectExperienceSection from '../sections/ProjectExperienceSection';
import OrganizationExperienceSection from '../sections/OrganizationExperienceSection';
import AwardsSection from '../sections/AwardsSection';
import SkillsSection from '../sections/SkillsSection';
import OthersSection from '../sections/OthersSection';

interface LayoutProps {
  resume: Resume;
  config: TemplateConfig;
}

/* ── Section registry: key → render function ── */

function renderSection(key: string, resume: Resume, config: TemplateConfig): React.ReactNode {
  switch (key) {
    case 'summary':
      return resume.summary
        ? <SummarySection key={key} summary={resume.summary} config={config} />
        : null;

    case 'education': {
      const items = resume.education;
      return items?.length ? <EducationSection key={key} config={config} items={items} /> : null;
    }

    case 'workExperience': {
      const items = resume.workExperience;
      return items?.length ? <WorkExperienceSection key={key} config={config} items={items} /> : null;
    }

    case 'projectExperience': {
      const items = resume.projectExperience;
      return items?.length ? <ProjectExperienceSection key={key} config={config} items={items} /> : null;
    }

    case 'organizationExperience': {
      const items = resume.organizationExperience;
      return items?.length ? <OrganizationExperienceSection key={key} config={config} items={items} /> : null;
    }

    case 'awards': {
      const items = resume.awards;
      return items?.length ? <AwardsSection key={key} config={config} items={items} /> : null;
    }

    case 'skills': {
      const items = resume.others?.skills || resume.skills || [];
      return items.length ? <SkillsSection key={key} config={config} items={items} /> : null;
    }

    case 'others': {
      const others = resume.others;
      if (!others) return null;
      const hasAny =
        (Array.isArray(others.certificates) && others.certificates.length > 0) ||
        (Array.isArray(others.languages) && others.languages.length > 0) ||
        (Array.isArray(others.hobbies) && others.hobbies.length > 0);
      return hasAny ? <OthersSection key={key} config={config} others={others} /> : null;
    }

    default:
      return null;
  }
}

const SingleColumnLayoutInner: React.FC<LayoutProps> = ({ resume, config }) => {
  const { palette, typography, layout } = config;

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        overflow: 'hidden',
        margin: '0 auto',
        backgroundColor: palette.background,
        padding: layout.containerPadding,
        boxSizing: 'border-box',
        fontFamily: typography.fontFamily,
        color: palette.text,
        fontSize: typography.bodySize,
        lineHeight: String(typography.lineHeight),
      }}
    >
      {/* Header (gradient handled inside CenterHeader when applicable) */}
      <HeaderSection personalInfo={resume.personalInfo} config={config} />

      {/* Sections rendered in sectionOrder */}
      {config.sectionOrder.map((sectionKey) => (
        <React.Fragment key={sectionKey}>
          {renderSection(sectionKey, resume, config)}
        </React.Fragment>
      ))}
    </div>
  );
};

export const SingleColumnLayout = React.memo(SingleColumnLayoutInner);
export default SingleColumnLayout;
