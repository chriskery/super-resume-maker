import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const professionalPreset: TemplateConfig = createDefaultConfig({
  id: 'professional',
  name: 'Professional',
  layout: {
    type: 'single-column',
    containerPadding: '28px 32px',
  },
  palette: {
    primary: '#5281F5',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
  },
  typography: {
    fontFamily: 'SimSun, "宋体", serif',
    nameSize: '26px',
    sectionTitleSize: '15px',
    itemTitleSize: '13.5px',
    bodySize: '12px',
    lineHeight: 1.5,
  },
  spacing: {
    sectionGap: '12px',
    itemGap: '8px',
    bulletGap: '1px',
  },
  header: {
    alignment: 'center',
    showPhoto: true,
    photoPosition: 'top-right',
    photoSize: '88px',
    photoBorderRadius: '50%',
    separator: '|',
    showIcons: true,
    showJobTitle: true,
    jobTitleColor: '#5281F5',
  },
  sectionTitle: {
    style: 'icon-circle',
    fontSize: '15px',
    fontWeight: 700,
  },
  sectionOrder: [
    'summary',
    'education',
    'workExperience',
    'projectExperience',
    'organizationExperience',
    'awards',
    'skills',
    'others',
  ],
});
