import { useState, useCallback } from 'react';
import type { TemplateConfig, LayoutType, SectionTitleStyle, HeaderAlignment, PhotoPosition } from './unified/types';
import type { Resume } from '../types/resume';
import { presetConfigs } from './unified/presets';
import { templateRegistry } from './registry';

export interface TemplateBuilderProps {
  currentConfig: TemplateConfig;
  onChange: (config: TemplateConfig) => void;
  resume: Resume;
}

/* ─── Disclosure 折叠面板 ─── */
function Disclosure({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span>{title}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

/* ─── Slider 控件 ─── */
function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
}

/* ─── Section title style preview ─── */
const TITLE_STYLES: { value: SectionTitleStyle; label: string; preview: React.ReactNode }[] = [
  { value: 'icon-circle', label: '圆形图标', preview: <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-current" /><div className="h-[2px] w-5 bg-current opacity-40" /></div> },
  { value: 'underline', label: '下划线', preview: <div className="w-full"><div className="h-[2px] w-full bg-current" /></div> },
  { value: 'center-line', label: '居中线', preview: <div className="w-full flex items-center gap-1"><div className="h-[1px] flex-1 bg-current" /><div className="text-[6px]">标题</div><div className="h-[1px] flex-1 bg-current" /></div> },
  { value: 'left-dot', label: '左圆点', preview: <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-current" /><div className="text-[7px]">标题</div></div> },
  { value: 'left-bar', label: '左竖线', preview: <div className="flex items-center gap-1"><div className="w-[2px] h-3 bg-current" /><div className="text-[7px]">标题</div></div> },
  { value: 'plain', label: '纯文本', preview: <div className="text-[7px] font-bold">标题</div> },
];

const FONT_OPTIONS = [
  { value: 'SimSun, "宋体", serif', label: '宋体' },
  { value: '"Microsoft YaHei", "微软雅黑", sans-serif', label: '微软雅黑' },
  { value: '"PingFang SC", "苹方", sans-serif', label: '苹方' },
];

const SEPARATOR_OPTIONS = ['|', '·', '/', '—', ' '];

const SECTION_NAME_MAP: Record<string, string> = {
  summary: '个人总结',
  education: '教育经历',
  workExperience: '工作经历',
  projectExperience: '项目经历',
  organizationExperience: '社团经历',
  awards: '荣誉奖项',
  skills: '技能',
  others: '其他',
};

/* ─── 解析 padding 字符串 ─── */
function parsePaddingValue(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 28;
}

export default function TemplateBuilder({ currentConfig, onChange, resume: _resume }: TemplateBuilderProps) {
  const cfg = currentConfig;

  const patch = useCallback(<K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    onChange({ ...cfg, [key]: value });
  }, [cfg, onChange]);

  /* ─── 1. 预设选择 ─── */
  const handlePresetSelect = (presetId: string) => {
    const preset = presetConfigs[presetId];
    if (preset) onChange({ ...preset });
  };

  /* ─── 2. 布局切换 ─── */
  const handleLayoutChange = (type: LayoutType) => {
    if (type === 'two-column') {
      onChange({
        ...cfg,
        layout: { ...cfg.layout, type, sidebarWidth: cfg.layout.sidebarWidth || '72mm', sidebarPosition: cfg.layout.sidebarPosition || 'left', sidebarBg: cfg.layout.sidebarBg || '#1e293b', sidebarTextColor: cfg.layout.sidebarTextColor || '#ffffff' },
      });
    } else {
      onChange({ ...cfg, layout: { ...cfg.layout, type } });
    }
  };

  /* ─── 3. 颜色 ─── */
  const patchPalette = (key: keyof TemplateConfig['palette'], value: string) => {
    onChange({ ...cfg, palette: { ...cfg.palette, [key]: value } });
  };

  /* ─── 4. 字体 ─── */
  const patchTypography = (key: keyof TemplateConfig['typography'], value: string | number) => {
    onChange({ ...cfg, typography: { ...cfg.typography, [key]: value } });
  };

  /* ─── 5. 间距 ─── */
  const patchSpacing = (key: keyof TemplateConfig['spacing'], value: string) => {
    onChange({ ...cfg, spacing: { ...cfg.spacing, [key]: value } });
  };

  /* ─── 6. 标题风格 ─── */
  const handleTitleStyleChange = (style: SectionTitleStyle) => {
    onChange({ ...cfg, sectionTitle: { ...cfg.sectionTitle, style } });
  };

  /* ─── 7. 头部配置 ─── */
  const patchHeader = (key: keyof TemplateConfig['header'], value: boolean | string) => {
    onChange({ ...cfg, header: { ...cfg.header, [key]: value } });
  };

  /* ─── 8. Section 排序 ─── */
  const moveSection = (idx: number, dir: -1 | 1) => {
    const arr = [...cfg.sectionOrder];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    patch('sectionOrder', arr);
  };

  return (
    <div className="space-y-0">
      {/* 1. 预设选择器 */}
      <Disclosure title="选择预设" defaultOpen={true}>
        <div className="grid grid-cols-4 gap-1.5">
          {templateRegistry.map((t) => {
            const isActive = t.id === cfg.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePresetSelect(t.id)}
                className={`text-[10px] px-1.5 py-1.5 rounded border transition-colors ${
                  isActive ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={t.description}
              >
                {t.name.replace('模板', '')}
              </button>
            );
          })}
        </div>
      </Disclosure>

      {/* 2. 布局选择 */}
      <Disclosure title="布局" defaultOpen={true}>
        <div className="flex gap-2">
          {([
            { value: 'single-column' as LayoutType, label: '单栏', icon: <div className="w-6 h-8 border border-current rounded-sm" /> },
            { value: 'two-column' as LayoutType, label: '双栏', icon: <div className="flex gap-0.5 w-6 h-8"><div className="w-2 h-full border border-current rounded-sm" /><div className="flex-1 h-full border border-current rounded-sm" /></div> },
          ]).map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleLayoutChange(value)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                cfg.layout.type === value ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {icon}
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </Disclosure>

      {/* 3. 颜色配置 */}
      <Disclosure title="颜色" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-gray-500 mb-0.5">主题色</div>
            <div className="flex items-center gap-1.5">
              <input type="color" value={cfg.palette.primary} onChange={(e) => patchPalette('primary', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0" />
              <span className="text-[10px] font-mono text-gray-500">{cfg.palette.primary}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 mb-0.5">背景色</div>
            <div className="flex items-center gap-1.5">
              <input type="color" value={cfg.palette.background} onChange={(e) => patchPalette('background', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0" />
              <span className="text-[10px] font-mono text-gray-500">{cfg.palette.background}</span>
            </div>
          </div>
        </div>
      </Disclosure>

      {/* 4. 字体配置 */}
      <Disclosure title="字体" defaultOpen={false}>
        <div>
          <div className="text-[11px] text-gray-500 mb-0.5">字体族</div>
          <select
            value={cfg.typography.fontFamily}
            onChange={(e) => patchTypography('fontFamily', e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <Slider label="基础字号" value={parseInt(cfg.typography.bodySize, 10) || 12} min={11} max={14} step={0.5} unit="px"
          onChange={(v) => patchTypography('bodySize', `${v}px`)} />
        <Slider label="行高" value={cfg.typography.lineHeight} min={1.3} max={2.0} step={0.05} unit=""
          onChange={(v) => patchTypography('lineHeight', v)} />
      </Disclosure>

      {/* 5. 间距配置 */}
      <Disclosure title="间距" defaultOpen={false}>
        <Slider label="Section 间距" value={parseInt(cfg.spacing.sectionGap, 10) || 12} min={8} max={24} step={1} unit="px"
          onChange={(v) => patchSpacing('sectionGap', `${v}px`)} />
        <Slider label="条目间距" value={parseInt(cfg.spacing.itemGap, 10) || 8} min={4} max={16} step={1} unit="px"
          onChange={(v) => patchSpacing('itemGap', `${v}px`)} />
        <Slider label="页面内边距" value={parsePaddingValue(cfg.layout.containerPadding)} min={16} max={48} step={2} unit="px"
          onChange={(v) => onChange({ ...cfg, layout: { ...cfg.layout, containerPadding: `${v}px ${v}px` } })} />
      </Disclosure>

      {/* 6. 标题风格 */}
      <Disclosure title="标题风格" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-1.5">
          {TITLE_STYLES.map(({ value, label, preview }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleTitleStyleChange(value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                cfg.sectionTitle.style === value ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="h-5 flex items-center">{preview}</div>
              <span className="text-[9px]">{label}</span>
            </button>
          ))}
        </div>
      </Disclosure>

      {/* 7. 头部配置 */}
      <Disclosure title="头部配置" defaultOpen={false}>
        <div>
          <div className="text-[11px] text-gray-500 mb-1">对齐方式</div>
          <div className="flex gap-1.5">
            {([
              { value: 'left' as HeaderAlignment, label: '左' },
              { value: 'center' as HeaderAlignment, label: '中' },
              { value: 'right' as HeaderAlignment, label: '右' },
            ]).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => patchHeader('alignment', value)}
                className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                  cfg.header.alignment === value ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">显示头像</span>
          <button
            type="button"
            onClick={() => patchHeader('showPhoto', !cfg.header.showPhoto)}
            className={`w-9 h-5 rounded-full transition-colors relative ${cfg.header.showPhoto ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${cfg.header.showPhoto ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>
        {cfg.header.showPhoto && (
          <div>
            <div className="text-[11px] text-gray-500 mb-1">头像位置</div>
            <select
              value={cfg.header.photoPosition}
              onChange={(e) => patchHeader('photoPosition', e.target.value as PhotoPosition)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="top-right">右上角</option>
              <option value="sidebar">侧边栏</option>
              <option value="header-center">头部居中</option>
              <option value="none">不显示</option>
            </select>
          </div>
        )}
        <div>
          <div className="text-[11px] text-gray-500 mb-1">联系信息分隔符</div>
          <div className="flex gap-1.5">
            {SEPARATOR_OPTIONS.map((sep) => (
              <button
                key={sep}
                type="button"
                onClick={() => patchHeader('separator', sep)}
                className={`w-7 h-7 text-xs rounded border flex items-center justify-center transition-colors ${
                  cfg.header.separator === sep ? 'border-blue-400 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >{sep === ' ' ? '空格' : sep}</button>
            ))}
          </div>
        </div>
      </Disclosure>

      {/* 8. Section 顺序 */}
      <Disclosure title="栏目排序" defaultOpen={false}>
        <div className="space-y-0.5">
          {cfg.sectionOrder.map((sectionId, idx) => (
            <div key={sectionId} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5">
              <span className="text-[11px] text-gray-700">{SECTION_NAME_MAP[sectionId] || sectionId}</span>
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => moveSection(idx, -1)}
                  disabled={idx === 0}
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === cfg.sectionOrder.length - 1}
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </Disclosure>
    </div>
  );
}
