import React from 'react';
import { Resume } from '../types/resume';
import ProfessionalTemplate from './ProfessionalTemplate';
import MinimalTemplate from './MinimalTemplate';
import ModernTemplate from './ModernTemplate';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<{ resume: Resume }>;
}

export const templateRegistry: TemplateInfo[] = [
  {
    id: 'professional',
    name: '专业模板',
    description: '经典专业中文简历，蓝色主题，带头像和图标分区',
    component: ProfessionalTemplate,
  },
  {
    id: 'minimal',
    name: '简约模板',
    description: '简洁黑白灰风格，无头像，居中大号姓名',
    component: MinimalTemplate,
  },
  {
    id: 'modern',
    name: '现代模板',
    description: '双栏布局，深色侧边栏，现代感设计',
    component: ModernTemplate,
  },
];

export function getTemplate(id: string): TemplateInfo | undefined {
  return templateRegistry.find((t) => t.id === id);
}

export default templateRegistry;
