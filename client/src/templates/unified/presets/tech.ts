import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const techPreset: TemplateConfig = createDefaultConfig({
  id: 'tech',
  name: 'Tech',
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
    itemTitleSize: '13px',
    bodySize: '12px',
    lineHeight: 1.5,
  },
  spacing: {
    sectionGap: '12px',
    itemGap: '8px',
    bulletGap: '1px',
  },
  header: {
    alignment: 'left',
    showPhoto: false,
    photoPosition: 'none',
    photoSize: '0px',
    photoBorderRadius: '0',
    separator: '|',
    showIcons: false,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'underline',
    fontSize: '15px',
    fontWeight: 700,
    borderWidth: '1.5px',
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
