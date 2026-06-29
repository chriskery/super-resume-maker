import React from 'react';
import { Resume } from '../types/resume';
import ProfessionalTemplate from './ProfessionalTemplate';
import MinimalTemplate from './MinimalTemplate';
import ModernTemplate from './ModernTemplate';
import ElegantTemplate from './ElegantTemplate';
import ClassicTemplate from './ClassicTemplate';
import RedLineTemplate from './RedLineTemplate';
import TechTemplate from './TechTemplate';
import BlueLineTemplate from './BlueLineTemplate';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: '经典' | '现代' | '技术';
  tags: string[];
  component: React.ComponentType<{ resume: Resume }>;
}

export const templateRegistry: TemplateInfo[] = [
  {
    id: 'professional',
    name: '专业模板',
    description: '经典专业中文简历，蓝色主题，带头像和图标分区',
    category: '经典',
    tags: ['正式', '传统', '金融', '通用'],
    component: ProfessionalTemplate,
  },
  {
    id: 'minimal',
    name: '简约模板',
    description: '简洁黑白灰风格，无头像，居中大号姓名',
    category: '经典',
    tags: ['简约', '清爽', '通用', '学术'],
    component: MinimalTemplate,
  },
  {
    id: 'modern',
    name: '现代模板',
    description: '双栏布局，深色侧边栏，现代感设计',
    category: '现代',
    tags: ['双栏', '现代', '互联网', '设计'],
    component: ModernTemplate,
  },
  {
    id: 'elegant',
    name: '优雅模板',
    description: '居中头像配蓝色弧形背景，优雅大方',
    category: '现代',
    tags: ['优雅', '创意', '设计'],
    component: ElegantTemplate,
  },
  {
    id: 'classic',
    name: '经典模板',
    description: '头像右上角，橙色标题，经典大方',
    category: '经典',
    tags: ['经典', '稳重', '通用', '学术'],
    component: ClassicTemplate,
  },
  {
    id: 'redline',
    name: '经典红',
    description: '红色主题竖线装饰，紧凑高密度，无头像',
    category: '经典',
    tags: ['红色', '庄重', '金融'],
    component: RedLineTemplate,
  },
  {
    id: 'tech',
    name: '技术模板',
    description: '简洁技术风，蓝色主题，无头像，经历紧凑排列',
    category: '技术',
    tags: ['技术', '极客', '互联网'],
    component: TechTemplate,
  },
  {
    id: 'blueline',
    name: '蓝线简约',
    description: '淡蓝竖线标题，姓名居中，经历左粗右日期，清爽专业',
    category: '经典',
    tags: ['蓝色', '简约', '通用', '互联网'],
    component: BlueLineTemplate,
  },
];

export function getTemplate(id: string): TemplateInfo | undefined {
  return templateRegistry.find((t) => t.id === id);
}

export default templateRegistry;
