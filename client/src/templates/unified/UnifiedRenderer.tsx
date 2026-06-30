import React, { useMemo } from 'react';
import type { Resume } from '../../types/resume';
import type { TemplateConfig } from './types';
import { SingleColumnLayout } from './layouts/SingleColumnLayout';
import { TwoColumnLayout } from './layouts/TwoColumnLayout';

interface UnifiedRendererProps {
  resume: Resume;
  config: TemplateConfig;
}

const UnifiedRendererInner: React.FC<UnifiedRendererProps> = ({ resume, config }) => {
  // Merge resume.themeColor into config.palette.primary
  const effectiveConfig = useMemo(() => {
    if (!resume.themeColor || resume.themeColor === config.palette.primary) return config;
    return {
      ...config,
      palette: { ...config.palette, primary: resume.themeColor },
    };
  }, [config, resume.themeColor]);

  // Merge resume.headerAlignment into config.header.alignment
  const finalConfig = useMemo(() => {
    if (!resume.headerAlignment || resume.headerAlignment === effectiveConfig.header.alignment) {
      return effectiveConfig;
    }
    return {
      ...effectiveConfig,
      header: { ...effectiveConfig.header, alignment: resume.headerAlignment },
    };
  }, [effectiveConfig, resume.headerAlignment]);

  // Select layout renderer based on layout type
  if (finalConfig.layout.type === 'two-column') {
    return <TwoColumnLayout resume={resume} config={finalConfig} />;
  }
  return <SingleColumnLayout resume={resume} config={finalConfig} />;
};

export const UnifiedRenderer = React.memo(UnifiedRendererInner);
export default UnifiedRenderer;
