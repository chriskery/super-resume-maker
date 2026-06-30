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
    case 'personalInfo':
      return <HeaderSection key={key} personalInfo={resume.personalInfo} config={config} />;

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

const TwoColumnLayoutInner: React.FC<LayoutProps> = ({ resume, config }) => {
  const { palette, typography, spacing, layout } = config;
  const sidebarKeys = new Set(config.sidebarSections || []);

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        overflow: 'hidden',
        margin: '0 auto',
        backgroundColor: palette.background,
        display: 'flex',
        boxSizing: 'border-box',
        fontFamily: typography.fontFamily,
        color: palette.text,
        fontSize: typography.bodySize,
        lineHeight: String(typography.lineHeight),
      }}
    >
      {/* ===== Sidebar ===== */}
      <div
        style={{
          width: layout.sidebarWidth || '72mm',
          backgroundColor: layout.sidebarBg || '#1e293b',
          color: layout.sidebarTextColor || '#f1f5f9',
          padding: '24px',
          boxSizing: 'border-box',
          flexShrink: 0,
          textAlign: config.header.alignment,
        }}
      >
        {config.sidebarSections?.map((sectionKey) => (
          <div key={sectionKey} style={{ marginBottom: spacing.sectionGap }}>
            {renderSection(sectionKey, resume, config)}
          </div>
        ))}
      </div>

      {/* ===== Main Content ===== */}
      <div
        style={{
          flex: 1,
          padding: '28px 24px',
          boxSizing: 'border-box',
        }}
      >
        {config.sectionOrder
          .filter((key) => !sidebarKeys.has(key))
          .map((sectionKey) => (
            <React.Fragment key={sectionKey}>
              {renderSection(sectionKey, resume, config)}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export const TwoColumnLayout = React.memo(TwoColumnLayoutInner);
export default TwoColumnLayout;
