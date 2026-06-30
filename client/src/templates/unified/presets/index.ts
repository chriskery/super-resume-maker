import type { TemplateConfig } from '../types';
import { professionalPreset } from './professional';
import { minimalPreset } from './minimal';
import { modernPreset } from './modern';
import { elegantPreset } from './elegant';
import { classicPreset } from './classic';
import { redlinePreset } from './redline';
import { techPreset } from './tech';
import { bluelinePreset } from './blueline';

export const presetConfigs: Record<string, TemplateConfig> = {
  professional: professionalPreset,
  minimal: minimalPreset,
  modern: modernPreset,
  elegant: elegantPreset,
  classic: classicPreset,
  redline: redlinePreset,
  tech: techPreset,
  blueline: bluelinePreset,
};

export {
  professionalPreset,
  minimalPreset,
  modernPreset,
  elegantPreset,
  classicPreset,
  redlinePreset,
  techPreset,
  bluelinePreset,
};
