import type { TemplateConfig } from './types';

const defaultConfig: TemplateConfig = {
  id: '',
  name: '',
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
    sectionTitleSize: '14px',
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
    alignment: 'center',
    showPhoto: true,
    photoPosition: 'top-right',
    photoSize: '88px',
    photoBorderRadius: '50%',
    separator: '|',
    showIcons: true,
    showJobTitle: false,
  },
  sectionTitle: {
    style: 'icon-circle',
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
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as Record<string, unknown>;
  const src = source as Record<string, unknown>;
  for (const key of Object.keys(src)) {
    const sourceVal = src[key];
    const targetVal = (target as Record<string, unknown>)[key];
    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      result[key] = deepMerge(targetVal, sourceVal as DeepPartial<typeof targetVal>);
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }
  return result as T;
}

export function createDefaultConfig(overrides: DeepPartial<TemplateConfig> & { id: string; name: string }): TemplateConfig {
  return deepMerge(defaultConfig, overrides);
}
