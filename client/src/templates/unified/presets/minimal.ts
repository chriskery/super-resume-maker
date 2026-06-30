import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const minimalPreset: TemplateConfig = createDefaultConfig({
  id: 'minimal',
  name: 'Minimal',
  layout: {
    type: 'single-column',
    containerPadding: '40px 40px',
  },
  palette: {
    primary: '#374151',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
  },
  typography: {
    fontFamily: 'SimSun, "宋体", serif',
    nameSize: '28px',
    sectionTitleSize: '12px',
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
    photoPosition: 'top-right',
    photoSize: '88px',
    photoBorderRadius: '50%',
    separator: '·',
    showIcons: false,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'underline',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
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
