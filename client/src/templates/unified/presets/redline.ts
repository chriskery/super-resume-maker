import { createDefaultConfig } from '../defaults';
import type { TemplateConfig } from '../types';

export const redlinePreset: TemplateConfig = createDefaultConfig({
  id: 'redline',
  name: 'RedLine',
  layout: {
    type: 'single-column',
    containerPadding: '19px',
  },
  palette: {
    primary: '#ca3832',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
  },
  typography: {
    fontFamily: 'SimSun, "宋体", serif',
    nameSize: '26px',
    sectionTitleSize: '12px',
    itemTitleSize: '13px',
    bodySize: '12px',
    lineHeight: 1.5,
  },
  spacing: {
    sectionGap: '10px',
    itemGap: '6px',
    bulletGap: '1px',
  },
  header: {
    alignment: 'center',
    showPhoto: false,
    photoPosition: 'none',
    photoSize: '0px',
    photoBorderRadius: '0',
    separator: '|',
    showIcons: true,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'underline',
    fontSize: '12px',
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
