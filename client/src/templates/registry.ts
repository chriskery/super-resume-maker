import React from 'react';
import { Resume } from '../types/resume';
import { UnifiedRenderer } from './unified/UnifiedRenderer';
import { TemplateConfig } from './unified/types';
import {
  professionalPreset,
  minimalPreset,
  modernPreset,
  elegantPreset,
  classicPreset,
  redlinePreset,
  techPreset,
  bluelinePreset,
} from './unified/presets';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: '经典' | '现代' | '技术';
  tags: string[];
  component: React.ComponentType<{ resume: Resume }>;
  config: TemplateConfig;
}

// 创建模板组件的工厂函数
function createTemplateComponent(config: TemplateConfig): React.ComponentType<{ resume: Resume }> {
  const TemplateComponent: React.FC<{ resume: Resume }> = ({ resume }) =>
    React.createElement(UnifiedRenderer, { resume, config });
  TemplateComponent.displayName = `Template_${config.id}`;
  return React.memo(TemplateComponent);
}

export const templateRegistry: TemplateInfo[] = [
  {
    id: 'professional',
    name: '专业模板',
    description: '经典专业中文简历，蓝色主题，带头像和图标分区',
    category: '经典',
    tags: ['正式', '传统', '金融', '通用'],
    component: createTemplateComponent(professionalPreset),
    config: professionalPreset,
  },
  {
    id: 'minimal',
    name: '简约模板',
    description: '简洁黑白灰风格，无头像，居中大号姓名',
    category: '经典',
    tags: ['简约', '清爽', '通用', '学术'],
    component: createTemplateComponent(minimalPreset),
    config: minimalPreset,
  },
  {
    id: 'modern',
    name: '现代模板',
    description: '双栏布局，深色侧边栏，现代感设计',
    category: '现代',
    tags: ['双栏', '现代', '互联网', '设计'],
    component: createTemplateComponent(modernPreset),
    config: modernPreset,
  },
  {
    id: 'elegant',
    name: '优雅模板',
    description: '居中头像配蓝色弧形背景，优雅大方',
    category: '现代',
    tags: ['优雅', '创意', '设计'],
    component: createTemplateComponent(elegantPreset),
    config: elegantPreset,
  },
  {
    id: 'classic',
    name: '经典模板',
    description: '头像右上角，橙色标题，经典大方',
    category: '经典',
    tags: ['经典', '稳重', '通用', '学术'],
    component: createTemplateComponent(classicPreset),
    config: classicPreset,
  },
  {
    id: 'redline',
    name: '经典红',
    description: '红色主题竖线装饰，紧凑高密度，无头像',
    category: '经典',
    tags: ['红色', '庄重', '金融'],
    component: createTemplateComponent(redlinePreset),
    config: redlinePreset,
  },
  {
    id: 'tech',
    name: '技术模板',
    description: '简洁技术风，蓝色主题，无头像，经历紧凑排列',
    category: '技术',
    tags: ['技术', '极客', '互联网'],
    component: createTemplateComponent(techPreset),
    config: techPreset,
  },
  {
    id: 'blueline',
    name: '蓝线简约',
    description: '淡蓝竖线标题，姓名居中，经历左粗右日期，清爽专业',
    category: '经典',
    tags: ['蓝色', '简约', '通用', '互联网'],
    component: createTemplateComponent(bluelinePreset),
    config: bluelinePreset,
  },
];

export function getTemplate(id: string): TemplateInfo | undefined {
  return templateRegistry.find((t) => t.id === id);
}

export default templateRegistry;
