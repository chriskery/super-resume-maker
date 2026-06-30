import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const classicPreset: TemplateConfig = createDefaultConfig({
  id: 'classic',
  name: 'Classic',
  layout: {
    type: 'single-column',
    containerPadding: '28px 32px',
  },
  palette: {
    primary: '#ea580c',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#374151',
    textTertiary: '#6b7280',
  },
  typography: {
    fontFamily: 'SimSun, "宋体", serif',
    nameSize: '26px',
    sectionTitleSize: '13px',
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
    showPhoto: true,
    photoPosition: 'top-right',
    photoSize: '80px',
    photoBorderRadius: '12px',
    separator: '|',
    showIcons: true,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'left-dot',
    fontSize: '13px',
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
