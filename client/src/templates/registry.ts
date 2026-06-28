import React from 'react';
import { Resume } from '../types/resume';
import ProfessionalTemplate from './ProfessionalTemplate';
import MinimalTemplate from './MinimalTemplate';
import ModernTemplate from './ModernTemplate';
import ElegantTemplate from './ElegantTemplate';
import ClassicTemplate from './ClassicTemplate';
import RedLineTemplate from './RedLineTemplate';

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
  {
    id: 'elegant',
    name: '优雅模板',
    description: '居中头像配蓝色弧形背景，优雅大方',
    component: ElegantTemplate,
  },
  {
    id: 'classic',
    name: '经典模板',
    description: '头像右上角，橙色标题，经典大方',
    component: ClassicTemplate,
  },
  {
    id: 'redline',
    name: '经典红',
    description: '红色主题竖线装饰，紧凑高密度，无头像',
    component: RedLineTemplate,
  },
];

export function getTemplate(id: string): TemplateInfo | undefined {
  return templateRegistry.find((t) => t.id === id);
}

export default templateRegistry;
