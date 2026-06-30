import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const modernPreset: TemplateConfig = createDefaultConfig({
  id: 'modern',
  name: 'Modern',
  layout: {
    type: 'two-column',
    sidebarWidth: '72mm',
    sidebarPosition: 'left',
    sidebarBg: '#1e293b',
    sidebarTextColor: '#ffffff',
    containerPadding: '0',
  },
  palette: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
  },
  typography: {
    fontFamily: 'SimSun, "宋体", serif',
    nameSize: '26px',
    sectionTitleSize: '13px',
    itemTitleSize: '13px',
    bodySize: '12.5px',
    lineHeight: 1.6,
  },
  spacing: {
    sectionGap: '16px',
    itemGap: '12px',
    bulletGap: '2px',
  },
  header: {
    alignment: 'center',
    showPhoto: true,
    photoPosition: 'sidebar',
    photoSize: '90px',
    photoBorderRadius: '50%',
    separator: ' ',
    showIcons: false,
    showJobTitle: true,
    jobTitleColor: '#3b82f6',
  },
  sectionTitle: {
    style: 'plain',
    fontSize: '13px',
    fontWeight: 700,
  },
  sectionOrder: [
    'summary',
    'education',
    'workExperience',
    'projectExperience',
    'organizationExperience',
    'awards',
  ],
  sidebarSections: ['personalInfo', 'skills', 'others'],
});
