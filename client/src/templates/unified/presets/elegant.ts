import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const elegantPreset: TemplateConfig = createDefaultConfig({
  id: 'elegant',
  name: 'Elegant',
  layout: {
    type: 'single-column',
    containerPadding: '24px 40px',
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
    nameSize: '28px',
    sectionTitleSize: '14px',
    itemTitleSize: '13px',
    bodySize: '12.5px',
    lineHeight: 1.55,
  },
  spacing: {
    sectionGap: '14px',
    itemGap: '10px',
    bulletGap: '2px',
  },
  header: {
    alignment: 'center',
    showPhoto: true,
    photoPosition: 'header-center',
    photoSize: '88px',
    photoBorderRadius: '50%',
    separator: '·',
    showIcons: false,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'center-line',
    fontSize: '14px',
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
  gradient: {
    from: '#1e3a5f',
    to: '#3b82f6',
  },
});
