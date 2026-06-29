import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Resume, WorkExperience, ProjectExperience, OrganizationExperience, Skill, Education, OtherInfo, Award } from '../types/resume';
import { useResume } from '../hooks/useResume';
import { getTemplate, templateRegistry } from '../templates/registry';
import ExportButton from '../components/ExportButton';
import TemplatePicker from '../components/TemplatePicker';
import PersonalInfoForm from '../components/sections/PersonalInfoForm';
import WorkExperienceForm from '../components/sections/WorkExperienceForm';
import ProjectExperienceForm from '../components/sections/ProjectExperienceForm';
import OrganizationForm from '../components/sections/OrganizationForm';
import AwardsForm from '../components/sections/AwardsForm';
import EducationForm from '../components/sections/EducationForm';
import FormTextArea from '../components/form/FormTextArea';
import AIPolishButton from '../components/form/AIPolishButton';
import { mockResume } from '../templates/mockData';
import AIImportPanel, { ParsedResumeData } from '../components/AIImportPanel';
import OnboardingTooltip from '../components/OnboardingTooltip';

/* ─── Factories ─── */
const emptyOthers = (): OtherInfo => ({ skills: [], certificates: [], languages: [], hobbies: [] });

const emptyResume = (templateId: string): Resume => ({
  id: '', title: '', templateId,
  personalInfo: { name: '', phone: '', email: '', title: '' },
  summary: '', education: [], workExperience: [], projectExperience: [],
  organizationExperience: [], awards: [], others: emptyOthers(), tags: [],
  createdAt: '', updatedAt: '',
});

const newWork = (): WorkExperience => ({ id: crypto.randomUUID(), company: '', position: '', department: '', location: '', startDate: '', endDate: '', highlights: [] });
const newProject = (): ProjectExperience => ({ id: crypto.randomUUID(), name: '', role: '', location: '', startDate: '', endDate: '', highlights: [] });
const newEducation = (): Education => ({ id: crypto.randomUUID(), school: '', degree: '', major: '', startDate: '', endDate: '', highlights: [], tags: [] });
const newOrg = (): OrganizationExperience => ({ id: crypto.randomUUID(), name: '', role: '', department: '', location: '', startDate: '', endDate: '', highlights: [] });
const newAward = (): Award => ({ id: crypto.randomUUID(), title: '', date: '', description: '' });

/* ─── Merge with mock: 用户未填写的字段用 mock 数据填充预览 ─── */
function mergeWithMock(data: Resume): Resume {
  const hasPersonalInfo = data.personalInfo.name || data.personalInfo.phone || data.personalInfo.email;
  const hasSummary = data.summary.trim().length > 0;
  const hasWork = data.workExperience.length > 0;
  const hasProject = data.projectExperience.length > 0;
  const hasSkills = (data.others?.skills || []).length > 0;

  // 如果用户已经填了任何信息，就完全用用户数据
  if (hasPersonalInfo || hasSummary || hasWork || hasProject || hasSkills) {
    return data;
  }

  // 否则用 mock 数据展示
  return { ...mockResume, id: data.id, title: data.title, templateId: data.templateId, tags: data.tags, createdAt: data.createdAt, updatedAt: data.updatedAt };
}

type SectionId = 'personalInfo' | 'summary' | 'education' | 'workExperience' | 'projectExperience' | 'organizationExperience' | 'awards' | 'others';

/* ─── Filter preview data by hidden sections ─── */
function filterByHidden(data: Resume, hidden: Set<SectionId>): Resume {
  const result = { ...data };
  if (hidden.has('summary')) result.summary = '';
  if (hidden.has('education')) result.education = [];
  if (hidden.has('workExperience')) result.workExperience = [];
  if (hidden.has('projectExperience')) result.projectExperience = [];
  if (hidden.has('organizationExperience')) result.organizationExperience = [];
  if (hidden.has('awards')) result.awards = [];
  if (hidden.has('others')) result.others = { skills: [], certificates: [], languages: [], hobbies: [] };
  return result;
}

const ALL_SECTION_IDS: SectionId[] = ['personalInfo', 'summary', 'education', 'workExperience', 'projectExperience', 'organizationExperience', 'awards', 'others'];

const SECTION_LABELS: Record<SectionId, string> = {
  personalInfo: '个人信息', summary: '个人总结', education: '教育经历',
  workExperience: '工作经历', projectExperience: '项目经历', organizationExperience: '社团经历',
  awards: '荣誉奖项', others: '其他',
};

/* ─── SVG Icons ─── */
const Icon = {
  edit: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  trash: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  chevron: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  doc: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  briefcase: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  people: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  award: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  code: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  eyeOff: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  drag: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  graduation: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  sparkles: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path d="M5 16l.6 1.4 1.4.6-1.4.6L5 20l-.6-1.4L3 18l1.4-.6z"/></svg>,
  undo: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>,
};

function CompletionBar({ data, inline }: { data: Resume; inline?: boolean }) {
  const checks = [
    { label: '姓名', done: !!data.personalInfo.name?.trim() },
    { label: '联系方式', done: !!(data.personalInfo.phone?.trim() || data.personalInfo.email?.trim()) },
    { label: '个人总结', done: data.summary?.trim().length > 20 },
    { label: '教育经历', done: data.education.length > 0 },
    { label: '工作经历', done: data.workExperience.length > 0 },
    { label: '项目经历', done: data.projectExperience.length > 0 },
    { label: '专业技能', done: (data.others?.skills?.length ?? 0) > 0 },
    { label: '荣誉奖项', done: data.awards.length > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#6b7280';
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  if (inline) return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-purple-700">简历完整度</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      {missing.length > 0 && pct < 100 && (
        <p className="mt-1 text-[10px] text-gray-400 leading-tight">未填：{missing.slice(0, 4).join('、')}{missing.length > 4 ? '...' : ''}</p>
      )}
    </div>
  );
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">简历完整度</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {missing.length > 0 && pct < 100 && (
        <p className="mt-1.5 text-[10px] text-gray-400 leading-tight">
          未填：{missing.slice(0, 4).join('、')}{missing.length > 4 ? '...' : ''}
        </p>
      )}
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => { const t = setTimeout(() => onCloseRef.current(), 2500); return () => clearTimeout(t); }, []);
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const icon = type === 'error'
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
  return (
    <div className={`fixed top-20 right-6 z-50 ${bgColor} text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]`}>
      {icon}
      {message}
    </div>
  );
}

/* ─── Dual-mode Section Card (no click-outside, supports expand/collapse) ─── */
function EditorSection({
  id, editingId, onStartEdit, onDoneEdit,
  title, icon, color, children,
  summary, onAdd, onHide,
  expanded, onToggleExpand,
  onDragStart, onDragOver, onDragEnd,
}: {
  id: SectionId;
  editingId: SectionId | null;
  onStartEdit: () => void;
  onDoneEdit: () => void;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  summary: React.ReactNode;
  onAdd?: () => void;
  onHide?: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const isEditing = editingId === id;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => onDragOver?.(e)}
      onDragEnd={onDragEnd}
      className={`border rounded-lg overflow-hidden transition-colors ${isEditing ? 'border-blue-300 bg-gray-50' : 'border-gray-200 bg-white'}`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="p-1 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 flex-shrink-0" title="拖拽排序">
            {Icon.drag}
          </span>
          <div
            className="flex items-center gap-1.5 min-w-0 cursor-pointer select-none"
            onClick={onToggleExpand}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: `${color}18`, color }}>
              {icon}
            </span>
            <span className="text-sm font-semibold text-gray-800">{title}</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!isEditing && onAdd && (
            <button type="button" onClick={onAdd} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded" title={`添加${title}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          )}
          {!isEditing && onHide && (
            <button type="button" onClick={onHide} className="p-1.5 text-gray-300 hover:text-orange-400 transition-colors rounded" title="隐藏此栏目">
              {Icon.eyeOff}
            </button>
          )}
        </div>
      </div>
      {/* Content - only shown when expanded */}
      {expanded && (
        <div
          className={`px-4 pb-4 ${isEditing ? 'border-t border-gray-200 pt-4 bg-white' : ''}`}
          onClick={!isEditing ? onStartEdit : undefined}
          style={!isEditing ? { cursor: 'pointer' } : undefined}
        >
          {isEditing ? (
            <div>
              {children}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={onDoneEdit}
                  className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="保存此栏目"
                >
                  保存
                </button>
              </div>
            </div>
          ) : summary}
        </div>
      )}
    </div>
  );
}

/* ─── Display Components ─── */
function PersonalInfoDisplay({ name, phone, email, title: job, city }: { name: string; phone: string; email: string; title: string; city?: string }) {
  const hasContent = name || phone || email;
  if (!hasContent) return <div className="text-sm text-gray-400 py-1">点击编辑填写个人信息</div>;
  return (
    <div className="py-1">
      {name && <div className="text-sm font-semibold text-gray-900">{name}{job && <span className="ml-2 text-blue-600 font-normal">· {job}</span>}</div>}
      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
        {phone && <span>{phone}</span>}
        {phone && email && <span className="text-gray-300">|</span>}
        {email && <span>{email}</span>}
        {city && <span className="text-gray-300">|</span>}
        {city && <span>{city}</span>}
      </div>
    </div>
  );
}

function SummaryDisplay({ text }: { text: string }) {
  if (!text) return <div className="text-sm text-gray-400 py-1">暂无个人总结</div>;
  return <p className="text-sm text-gray-700 leading-relaxed py-1 line-clamp-3">{text}</p>;
}

function ExperienceListDisplay<T extends { id: string }>({
  items, getKey, getLabel, getSub, getDate, onDelete,
}: {
  items: T[]; getKey: (item: T) => string; getLabel: (item: T) => string;
  getSub: (item: T) => string; getDate: (item: T) => string;
  onDelete: (index: number) => void;
}) {
  if (items.length === 0) return <div className="text-sm text-gray-400 py-1">暂无记录</div>;
  return (
    <div className="space-y-2 py-1">
      {items.map((item, i) => {
        const label = getLabel(item); const sub = getSub(item); const date = getDate(item);
        if (!label && !sub) return null;
        return (
          <div key={getKey(item)} className="flex items-start justify-between group">
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-sm text-gray-800 font-medium truncate">{label || '未命名'}</div>
              {(sub || date) && (
                <div className="text-xs text-gray-500 truncate">
                  {sub}{sub && date && ' · '}{date}
                </div>
              )}
            </div>
            <button type="button" onClick={() => onDelete(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" title="删除">
              {Icon.trash}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function EducationDisplay({ items, onDelete }: { items: { id: string; school: string; degree: string; major: string; startDate: string; endDate: string; tags?: string[] }[]; onDelete: (i: number) => void }) {
  if (items.length === 0) return <div className="text-sm text-gray-400 py-1">暂无教育经历</div>;
  return (
    <div className="space-y-2 py-1">
      {items.map((edu, i) => (
        <div key={edu.id} className="flex items-start justify-between group">
          <div className="flex-1 min-w-0 mr-2">
            <div className="text-sm text-gray-800 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{edu.school || '未填写学校'}</span>
              {edu.tags && edu.tags.map((tag, ti) => (
                <span key={ti} className="inline-block text-[10px] text-orange-600 border border-orange-400 rounded px-1 leading-4 flex-shrink-0">{tag}</span>
              ))}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {[edu.degree, edu.major].filter(Boolean).join(' · ')}
              {edu.startDate && edu.endDate && ` · ${edu.startDate} - ${edu.endDate}`}
            </div>
          </div>
          <button type="button" onClick={() => onDelete(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" title="删除">
            {Icon.trash}
          </button>
        </div>
      ))}
    </div>
  );
}

function AwardsDisplay({ items, onDelete }: { items: Award[]; onDelete: (i: number) => void }) {
  if (items.length === 0) return <div className="text-sm text-gray-400 py-1">暂无荣誉奖项</div>;
  return (
    <ul className="space-y-2 py-1">
      {items.map((a, i) => (
        <li key={a.id} className="flex items-start justify-between group">
          <div className="flex-1 min-w-0 mr-2">
            <div className="text-sm text-gray-800 font-medium truncate">
              • {a.title || `奖项 ${i + 1}`}
              {a.date && <span className="ml-2 text-xs text-gray-500 font-normal">{a.date}</span>}
            </div>
            {a.description && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.description}</div>
            )}
          </div>
          <button type="button" onClick={() => onDelete(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" title="删除">
            {Icon.trash}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ─── Others Display ─── */
function OthersDisplay({ others, onUpdate }: { others: OtherInfo; onUpdate: (o: OtherInfo) => void }) {
  const skills = others.skills || [];
  const sections: { key: keyof Omit<OtherInfo, 'skills'>; label: string }[] = [
    { key: 'certificates', label: '证书/执照' },
    { key: 'languages', label: '语言' },
    { key: 'hobbies', label: '兴趣爱好' },
  ];
  const hasAny = skills.length > 0 || sections.some(s => others[s.key].length > 0);
  if (!hasAny) return <div className="text-sm text-gray-400 py-1">暂无其他信息</div>;
  return (
    <div className="space-y-2 py-1">
      {skills.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">专业技能</div>
          <div className="space-y-1">
            {skills.map((s, i) => (
              <div key={i} className="flex items-start justify-between group text-sm text-gray-700">
                <div className="flex-1 min-w-0 mr-2 truncate">
                  <span className="font-medium">• {s.category || '未分类'}</span>
                  {s.items && <span className="text-gray-500 ml-1">— {s.items}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...others, skills: skills.filter((_, idx) => idx !== i) })}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="删除"
                >
                  {Icon.trash}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {sections.map(({ key, label }) => {
        const items = others[key];
        if (items.length === 0) return null;
        return (
          <div key={key}>
            <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between group text-sm text-gray-700">
                  <span className="truncate mr-2">• {item}</span>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...others, [key]: items.filter((_, idx) => idx !== i) })}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="删除"
                  >
                    {Icon.trash}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Others Form (edit mode) ─── */
function OthersForm({ others, onChange }: { others: OtherInfo; onChange: (o: OtherInfo) => void }) {
  const skills = others.skills || [];
  const sections: { key: keyof Omit<OtherInfo, 'skills'>; label: string; placeholder: string }[] = [
    { key: 'certificates', label: '证书/执照', placeholder: '如：CFA（二级）' },
    { key: 'languages', label: '语言', placeholder: '如：英语（CET-6）' },
    { key: 'hobbies', label: '兴趣爱好', placeholder: '如：篮球（校队队长）' },
  ];

  return (
    <div className="space-y-4">
      {/* 专业技能 (placed first as it's most important) */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1.5">专业技能</div>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="relative border border-gray-200 rounded-lg p-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => onChange({ ...others, skills: skills.filter((_, i) => i !== index) })}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                title="删除"
              >
                {Icon.trash}
              </button>
              <div className="pr-6 space-y-2">
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => {
                    const arr = [...skills];
                    arr[index] = { ...skill, category: e.target.value };
                    onChange({ ...others, skills: arr });
                  }}
                  placeholder="技能类别，如：编程语言、框架工具"
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <input
                  type="text"
                  value={skill.items}
                  onChange={(e) => {
                    const arr = [...skills];
                    arr[index] = { ...skill, items: e.target.value };
                    onChange({ ...others, skills: arr });
                  }}
                  placeholder="具体技能，逗号分隔，如：JavaScript, TypeScript, React"
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...others, skills: [...skills, { category: '', items: '' }] })}
          className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          添加技能分类
        </button>
      </div>
      {sections.map(({ key, label, placeholder }) => (
        <div key={key}>
          <div className="text-sm font-medium text-gray-700 mb-1.5">{label}</div>
          <div className="space-y-1.5">
            {others[key].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const arr = [...others[key]];
                    arr[i] = e.target.value;
                    onChange({ ...others, [key]: arr });
                  }}
                  placeholder={placeholder}
                  className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...others, [key]: others[key].filter((_, idx) => idx !== i) })}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="删除"
                >
                  {Icon.trash}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...others, [key]: [...others[key], ''] })}
            className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            添加{label}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── AI Score Types & Card ─── */
interface AIScoreResult {
  score: number;
  summary: string;
  suggestions: string[];
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: '#16a34a', bg: '#dcfce7', bar: '#22c55e' };
  if (score >= 60) return { text: '#d97706', bg: '#fef3c7', bar: '#f59e0b' };
  return { text: '#dc2626', bg: '#fee2e2', bar: '#ef4444' };
}

function AIScoreCard({
  result, loading, error, onRescore, scoringText,
}: {
  result: AIScoreResult | null;
  loading: boolean;
  error: string | null;
  onRescore: () => void;
  scoringText?: string;
}) {
  const colors = result ? getScoreColor(result.score) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-purple-700">AI 智能检查</span>
        </div>
        {(result || error) && !loading && (
          <button
            type="button"
            onClick={onRescore}
            disabled={loading}
            className="p-1 text-purple-400 hover:text-purple-600 transition-colors rounded disabled:opacity-40"
            title="重新评分"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading with streaming text */}
      {loading && (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-xs text-gray-500">
              {scoringText ? 'AI 正在分析...' : 'AI 正在评分中...'}
            </span>
          </div>
          {scoringText && (
            <div className="text-xs text-gray-600 bg-white/60 rounded-lg p-2.5 border border-purple-100 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {scoringText}
              <span className="inline-block w-0.5 h-3 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          {/* Score + Summary row */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: colors!.bg, color: colors!.text }}
            >
              {result.score}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1 truncate">{result.summary || '评分完成'}</div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${result.score}%`, backgroundColor: colors!.bar }}
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <ul className="space-y-1 mt-2">
              {result.suggestions.slice(0, 5).map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!result && !loading && !error && (
        <p className="text-xs text-gray-500">编辑简历内容后将自动获取 AI 评分和改进建议</p>
      )}
    </div>
  );
}

/* ─── JD Match Types & Panel ─── */
interface JDMatchResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
  matchedSkills: string[];
}

function JDMatchPanel({ resume }: { resume: Resume }) {
  const [expanded, setExpanded] = useState(false);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JDMatchResult | null>(null);

  const handleAnalyze = async () => {
    if (!jd.trim() || jd.trim().length < 10) {
      setError('请输入至少10个字符的职位描述');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { aiApi } = await import('../services/api');
      const res = await aiApi.jdMatch(resume, jd.trim());
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '分析失败，请稍后重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 70 ? 'text-green-600' : result.score >= 40 ? 'text-yellow-500' : 'text-red-500'
    : '';

  return (
    <div className="border border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-cyan-50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-100/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-semibold text-indigo-700">JD 匹配度分析</span>
        </div>
        <svg
          className={`w-4 h-4 text-indigo-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* textarea */}
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="粘贴目标职位的岗位描述..."
            rows={4}
            className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none bg-white"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !jd.trim()}
            className="w-full py-1.5 text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                分析中...
              </>
            ) : '开始分析'}
          </button>

          {/* Error */}
          {error && !loading && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-3">
              {/* Score */}
              <div className="flex items-center gap-3">
                <div className={`text-4xl font-bold ${scoreColor}`}>{result.score}%</div>
                <div className="text-xs text-gray-500">
                  {result.score >= 70 ? '匹配度较高' : result.score >= 40 ? '匹配度中等，可针对性优化' : '匹配度较低，建议重点补充'}
                </div>
              </div>

              {/* Matched skills */}
              {result.matchedSkills.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">匹配技能</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.map((s, i) => (
                      <span key={i} className="inline-block text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">缺失关键词</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((k, i) => (
                      <span key={i} className="inline-block text-xs bg-red-100 text-red-600 border border-red-200 rounded-full px-2.5 py-0.5">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">优化建议</div>
                  <ol className="space-y-1 list-decimal list-inside">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600">{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible Tag Editor (subtle entrance) ─── */
function CollapsibleTagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 pt-3 mt-1">
      {/* 折叠开关：低调的文字链接 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>标签{tags.length > 0 ? ` (${tags.length})` : ''}</span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="输入标签名称，回车添加"
              className="flex-1 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputVal.trim()}
              className="px-2.5 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Main Editor ═══════════════════════════ */
export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { resume, loading, error, save, isNew } = useResume(id);
  const previewRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const autoSaveResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingId, setEditingId] = useState<SectionId | null>(null);
  const [showAIImport, setShowAIImport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [leftTab, setLeftTab] = useState<'edit' | 'template'>('edit');
  const [hiddenSections, setHiddenSections] = useState<Set<SectionId>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(() => new Set(ALL_SECTION_IDS));
  const [compactMode, setCompactMode] = useState(false);
  const [compactScale, setCompactScale] = useState(1);
  const [compactHidden, setCompactHidden] = useState<Set<SectionId>>(new Set());
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>([...ALL_SECTION_IDS]);
  const dragSectionRef = useRef<SectionId | null>(null);
  const titleManualEdited = useRef(false);

  /* ─── Onboarding ─── */
  const onboardingSteps = useMemo(() => [
    { target: 'ai-import', title: 'AI智能导入', description: '粘贴文本，AI自动解析为结构化简历' },
    { target: 'template', title: '模板切换', description: '点击切换不同风格的简历模板' },
    { target: 'ai-score', title: 'AI评分', description: '实时评估简历质量，获取优化建议' },
    { target: 'export', title: '导出PDF', description: '一键导出为PDF格式简历' },
  ], []);

  useEffect(() => {
    if (!localStorage.getItem('resume-onboarding-done')) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('resume-onboarding-done', '1');
    setShowOnboarding(false);
  }, []);

  /* ─── AI Score ─── */
  const [scoreResult, setScoreResult] = useState<AIScoreResult | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoringText, setScoringText] = useState('');
  const initialLoadDoneRef = useRef(false);
  const scoreAbortRef = useRef<AbortController | null>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkingStartRef = useRef<number>(0);

  const doScore = useCallback(async (resumeData: Resume) => {
    // Abort previous in-flight score request
    if (scoreAbortRef.current) {
      scoreAbortRef.current.abort();
    }
    const controller = new AbortController();
    scoreAbortRef.current = controller;

    setScoreLoading(true);
    setScoreError(null);
    setScoringText('');
    setScoreResult(null);
    // Clear any existing thinking timer
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    thinkingStartRef.current = 0;

    try {
      const resp = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeData }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        // Try to parse JSON error from non-streaming response
        let msg = `请求失败（${resp.status}）`;
        try {
          const j = await resp.json();
          if (j.error) msg = j.error;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);

          if (payload === '[DONE]') {
            // Stream finished — parse accumulated text as JSON
            try {
              const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
              if (!jsonMatch) throw new Error('AI 返回格式异常');
              const parsed = JSON.parse(jsonMatch[0]);
              const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
              const summary = String(parsed.summary || '');
              const suggestions = Array.isArray(parsed.suggestions)
                ? parsed.suggestions.map(String).slice(0, 5) : [];
              setScoreResult({ score, summary, suggestions });
            } catch (parseErr) {
              console.error('AI score parse error:', parseErr, 'raw:', accumulated);
              setScoreError('AI 返回格式异常，请稍后重试');
            }
            continue;
          }

          try {
            const json = JSON.parse(payload);
            if (json.error) {
              setScoreError(json.error);
              continue;
            }
            if (json.content) {
              // Clear thinking timer when actual content starts arriving
              if (thinkingTimerRef.current) {
                clearInterval(thinkingTimerRef.current);
                thinkingTimerRef.current = null;
                thinkingStartRef.current = 0;
              }
              accumulated += json.content;
              setScoringText(accumulated);
            }
            // Show thinking status with elapsed time when heartbeat received
            if (json.thinking === true && !thinkingTimerRef.current) {
              thinkingStartRef.current = Date.now();
              setScoringText('🤔 AI 正在深度分析您的简历... (已思考 0s)');
              thinkingTimerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - thinkingStartRef.current) / 1000);
                setScoringText(`🤔 AI 正在深度分析您的简历... (已思考 ${elapsed}s)`);
              }, 1000);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'AI 评分失败，请稍后重试';
      setScoreError(msg);
      console.error('AI score error:', err);
    } finally {
      // Always clear thinking timer
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      if (scoreAbortRef.current === controller) {
        setScoreLoading(false);
        scoreAbortRef.current = null;
      }
    }
  }, []);

  const initialTemplateId = searchParams.get('templateId') || 'professional';
  const [data, setData] = useState<Resume>(() => emptyResume(initialTemplateId));
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (resume && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      const normalized: Resume = {
        ...resume,
        others: { ...emptyOthers(), ...(resume.others ?? {}) },
        personalInfo: resume.personalInfo ?? { name: '', phone: '', email: '', title: '' },
        workExperience: resume.workExperience ?? [],
        projectExperience: resume.projectExperience ?? [],
        organizationExperience: resume.organizationExperience ?? [],
        education: resume.education ?? [],
        awards: resume.awards ?? [],
        skills: resume.skills ?? [],
        tags: resume.tags ?? [],
      };
      setData(normalized);
    }
  }, [resume]);

  // Debounced auto-score: trigger 3s after data stops changing, skip if empty
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      return;
    }
    // Skip scoring for empty resumes (nothing meaningful to score)
    const hasContent = data.personalInfo.name?.trim() || data.summary?.trim() || data.workExperience.length > 0 || data.education.length > 0 || data.projectExperience.length > 0;
    if (!hasContent) return;
    const timer = setTimeout(() => {
      doScore(data);
    }, 3000);
    return () => clearTimeout(timer);
  }, [data, doScore]);

  // Auto-generate title when name changes (only if not manually edited)
  useEffect(() => {
    const name = data.personalInfo.name?.trim();
    if (name && !titleManualEdited.current) {
      setData((prev) => ({ ...prev, title: `${name}的简历` }));
    }
  }, [data.personalInfo.name]);
  useEffect(() => {
    if (isNew && searchParams.get('templateId')) {
      setData((prev) => ({ ...prev, templateId: searchParams.get('templateId') || 'professional' }));
    }
  }, [isNew, searchParams]);

  const handleSave = useCallback(async () => {
    // 手动保存时取消待执行的自动保存定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    // 保存前验证必填字段
    const errors: string[] = [];
    if (!data.personalInfo.name?.trim()) errors.push('姓名');
    if (errors.length > 0) {
      setToast({ message: `请先填写：${errors.join('、')}`, type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const saved = await save(data);
      lastSavedDataRef.current = JSON.stringify(data);
      if (isNew && saved?.id) {
        // Navigate first — the new page will show its own state; no toast needed here
        navigate(`/editor/${saved.id}`, { replace: true });
      } else {
        setToast({ message: '保存成功', type: 'success' });
      }
    } catch (err) { console.error('Save failed:', err); setToast({ message: '保存失败，请重试', type: 'error' }); }
    finally { setSaving(false); }
  }, [data, save, isNew, navigate]);

  // 防抖自动保存：数据变化后3秒无操作自动保存
  useEffect(() => {
    if (isNew) return; // 新建简历不触发自动保存

    const serialized = JSON.stringify(data);
    if (serialized === lastSavedDataRef.current) return; // 数据未变化

    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await save(data);
        lastSavedDataRef.current = JSON.stringify(data);
        setAutoSaveStatus('saved');
        // 2秒后回到idle
        if (autoSaveResetTimerRef.current) clearTimeout(autoSaveResetTimerRef.current);
        autoSaveResetTimerRef.current = setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('idle');
      }
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [data, isNew, save]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveResetTimerRef.current) clearTimeout(autoSaveResetTimerRef.current);
    };
  }, []);

  const updateField = <K extends keyof Resume>(field: K, value: Resume[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleExpand = (sid: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  /* ─── Template ─── */
  const templateInfo = getTemplate(data.templateId);
  const TemplateComponent = templateInfo?.component;

  /* ─── Preview scale ─── */
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const obsRef = useRef<ResizeObserver | null>(null);
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1122;
  const [pageCount, setPageCount] = useState(1);

  const previewContainerCallback = useCallback((el: HTMLDivElement | null) => {
    previewContainerRef.current = el;
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null; }
    if (!el) return;
    const update = () => {
      const scale = (el.clientWidth - 48) / A4_WIDTH;
      if (scale > 0) setPreviewScale(Math.min(1, scale));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    obsRef.current = obs;
  }, []);

  /* ─── Sync page count with preview content height (考虑智能压缩后的视觉高度) ─── */
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => {
      const effectiveScale = compactMode ? compactScale : 1;
      const effectiveHeight = el.scrollHeight * effectiveScale;
      const pages = Math.max(1, Math.ceil(effectiveHeight / A4_HEIGHT));
      setPageCount(pages);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [data, previewScale, compactMode, compactScale]);

  /* ─── Smart one-page: 智能压缩为一页 ─── */
  const applySmartOnePage = useCallback(() => {
    if (compactMode) return;
    if (pageCount <= 1) {
      setToast({ message: '当前已是一页，无需调整', type: 'success' });
      return;
    }

    const MIN_SCALE = 0.88;
    const requiredScale = 1 / pageCount;

    let scale = 1;
    const hidden = new Set<SectionId>();

    if (requiredScale >= MIN_SCALE) {
      // 仅缩放即可压到一页
      scale = requiredScale;
    } else {
      // 需要缩放 + 隐藏次要栏目
      scale = MIN_SCALE;
      const remainingPages = pageCount * MIN_SCALE;
      if (remainingPages > 1) {
        // 按优先级隐藏（社团 > 奖项 > 其他），每隐藏一个估计减少 25% 高度
        const HIDE_PRIORITY: SectionId[] = ['organizationExperience', 'awards', 'others'];
        let estPages = remainingPages;
        for (const sid of HIDE_PRIORITY) {
          if (estPages <= 1) break;
          hidden.add(sid);
          estPages *= 0.75;
        }
      }
    }

    setCompactMode(true);
    setCompactScale(scale);
    setCompactHidden(hidden);

    const pct = Math.round(scale * 100);
    if (hidden.size === 0) {
      setToast({ message: `已智能压缩到 1 页（缩放 ${pct}%）`, type: 'success' });
    } else {
      const labels = Array.from(hidden).map((s) => SECTION_LABELS[s]).join('、');
      setToast({ message: `已智能压缩到 1 页（缩放 ${pct}%，隐藏 ${labels}）`, type: 'success' });
    }
  }, [compactMode, pageCount]);

  const restoreCompact = useCallback(() => {
    setCompactMode(false);
    setCompactScale(1);
    setCompactHidden(new Set());
    setToast({ message: '已还原原始布局', type: 'success' });
  }, []);

  /* ─── Drag-to-reorder helpers ─── */
  const handleDragStart = (sid: SectionId) => { dragSectionRef.current = sid; };
  const handleDragOver = (e: React.DragEvent, sid: SectionId) => {
    e.preventDefault();
    const dragging = dragSectionRef.current;
    if (!dragging || dragging === sid) return;
    setSectionOrder((prev) => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(dragging);
      const toIdx = arr.indexOf(sid);
      if (fromIdx < 0 || toIdx < 0) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, dragging);
      return arr;
    });
  };
  const handleDragEnd = () => { dragSectionRef.current = null; };

  const effectiveHidden = useMemo(() =>
    compactMode
      ? new Set([...hiddenSections, ...compactHidden])
      : hiddenSections,
    [compactMode, hiddenSections, compactHidden]
  );

  const previewData = useMemo(
    () => filterByHidden(mergeWithMock(data), effectiveHidden),
    [data, effectiveHidden]
  );

  if (loading && !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm max-w-md">{error}</div>
      </div>
    );
  }

  const startEdit = (sid: SectionId) => {
    setEditingId(sid);
    // ensure the section is expanded when editing
    setExpandedSections((prev) => new Set(prev).add(sid));
  };
  const doneEdit = () => setEditingId(null);
  const hideSection = (sid: SectionId) => setHiddenSections((prev) => new Set(prev).add(sid));
  const showSection = (sid: SectionId) => setHiddenSections((prev) => { const n = new Set(prev); n.delete(sid); return n; });
  const isHidden = (sid: SectionId) => hiddenSections.has(sid);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 transition-colors" title="返回首页">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <input
              type="text" value={data.title} onChange={(e) => { titleManualEdited.current = true; updateField('title', e.target.value); }}
              placeholder="请输入简历标题"
              className="text-sm font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-0 w-60 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowAIImport(true)} data-onboarding="ai-import"
              className="px-4 py-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 导入
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={saving ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' : 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'}
                />
              </svg>
              <span>{saving ? '保存中...' : '保存'}</span>
            </button>
            {autoSaveStatus !== 'idle' && (
              <span className="text-xs text-gray-400">
                {autoSaveStatus === 'saving' ? '保存中...' : '已自动保存'}
              </span>
            )}
            {pageCount > 1 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {pageCount} 页
                </span>
                {compactMode ? (
                  <button
                    type="button"
                    onClick={restoreCompact}
                    className="text-xs px-2.5 py-1 rounded border text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-1"
                    title="还原原始布局"
                  >
                    {Icon.undo}
                    还原（{Math.round(compactScale * 100)}%）
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applySmartOnePage}
                    className="text-xs px-2.5 py-1 rounded border text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
                    title="自动调整为一页"
                  >
                    {Icon.sparkles}
                    智能一页
                  </button>
                )}
              </div>
            ) : compactMode ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                  {Icon.sparkles}
                  已智能压缩（{Math.round(compactScale * 100)}%）
                </span>
                <button
                  type="button"
                  onClick={restoreCompact}
                  className="text-xs px-2.5 py-1 rounded border text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  title="还原原始布局"
                >
                  {Icon.undo}
                  还原
                </button>
              </div>
            ) : (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                单页
              </span>
            )}
            <div data-onboarding="export"><ExportButton documentTitle={data.title || '我的简历'} getPrintRef={() => previewRef.current} compactScale={compactMode ? compactScale : undefined} /></div>
          </div>
        </div>
      </header>

      {/* ─── Two Column Layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* 最左侧竖向图标导航 */}
        <div className="w-14 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 no-print">
          {([
            { tab: 'edit', label: '编辑', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
            { tab: 'template', label: '模板', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg> },
          ] as { tab: 'edit' | 'template'; label: string; icon: React.ReactNode }[]).map(({ tab, label, icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLeftTab(tab)}
              className={`flex flex-col items-center gap-1 w-12 py-2.5 rounded-lg transition-colors ${leftTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              {icon}
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>

        {/* Left: Dual-mode Editor */}
        <div className="w-[36%] flex-shrink-0 overflow-hidden no-print flex flex-col">

          {leftTab === 'template' ? (
            /* Template picker panel */
            <div className="flex-1 overflow-y-auto p-4">
              {/* 主题色选择 */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-2">主题色</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { c: '#000000', label: '黑色' },
                    { c: '#dc2626', label: '红色' },
                    { c: '#ea580c', label: '橙色' },
                    { c: '#5281F5', label: '蓝色' },
                    { c: '#7c3aed', label: '紫色' },
                    { c: '#16a34a', label: '绿色' },
                  ].map(({ c, label }) => {
                    const isActive = (data.themeColor || '#5281F5') === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateField('themeColor', c)}
                        className={`w-8 h-8 rounded cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${isActive ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                        title={label}
                      >
                        {isActive && (
                          <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    );
                  })}
                  <label
                    className="w-8 h-8 rounded cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)' }}
                    title="自定义颜色"
                  >
                    <input type="color" className="sr-only" value={data.themeColor || '#5281F5'} onChange={e => updateField('themeColor', e.target.value)} />
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </label>
                </div>
              </div>
              {/* 头部对齐 */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">头部对齐</div>
                <div className="flex gap-2">
                  {([
                    { value: 'left' as const, label: '左对齐', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h12M3 12h8M3 18h14" /></svg> },
                    { value: 'center' as const, label: '居中', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" /></svg> },
                    { value: 'right' as const, label: '右对齐', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h12M13 12h8M7 18h14" /></svg> },
                  ]).map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      onClick={() => updateField('headerAlignment', value)}
                      className={`w-9 h-9 flex items-center justify-center border rounded transition-colors ${
                        (data.headerAlignment || 'center') === value
                          ? 'bg-blue-50 text-blue-600 border-blue-300'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {templateRegistry.map((t) => {
                  const Comp = t.component;
                  const isActive = t.id === data.templateId;
                  const A4_W = 794; const A4_H = 1123; const THUMB_W = 140;
                  const thumbScale = THUMB_W / A4_W;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { updateField('templateId', t.id); }}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none text-left ${isActive ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                      style={{ height: Math.round(A4_H * thumbScale) }}
                    >
                      <div style={{ width: A4_W, height: A4_H, transform: `scale(${thumbScale})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                        <Comp resume={{ ...previewData, templateId: t.id }} />
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                        <span className="text-white text-[10px] font-medium drop-shadow">{t.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-3">
            {/* 简历完整度 + AI 智能检查（合并卡片）*/}
            <div data-onboarding="ai-score" className="border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3.5 space-y-2.5">
              {/* 完整度 */}
              <CompletionBar data={data} inline />
              {/* 分隔线 */}
              <div className="border-t border-purple-100" />
              {/* AI 评分 */}
              <AIScoreCard
                result={scoreResult}
                loading={scoreLoading}
                error={scoreError}
                onRescore={() => doScore(data)}
                scoringText={scoringText}
              />
            </div>

            {/* 个人信息 */}
            {!isHidden('personalInfo') && (
            <EditorSection id="personalInfo" editingId={editingId} onStartEdit={() => startEdit('personalInfo')} onDoneEdit={doneEdit}
              title="个人信息" icon={Icon.user} color="#5281F5"
              onHide={() => hideSection('personalInfo')}
              expanded={expandedSections.has('personalInfo')} onToggleExpand={() => toggleExpand('personalInfo')}
              onDragStart={() => handleDragStart('personalInfo')}
              onDragOver={(e) => handleDragOver(e, 'personalInfo')}
              onDragEnd={handleDragEnd}
              summary={<PersonalInfoDisplay {...data.personalInfo} />}>
              <PersonalInfoForm data={data.personalInfo} onChange={(v) => updateField('personalInfo', v)} />
            </EditorSection>
            )}

            {/* 个人总结 */}
            {!isHidden('summary') && (
            <EditorSection id="summary" editingId={editingId} onStartEdit={() => startEdit('summary')} onDoneEdit={doneEdit}
              title="个人总结" icon={Icon.doc} color="#059669"
              onHide={() => hideSection('summary')}
              expanded={expandedSections.has('summary')} onToggleExpand={() => toggleExpand('summary')}
              onDragStart={() => handleDragStart('summary')}
              onDragOver={(e) => handleDragOver(e, 'summary')}
              onDragEnd={handleDragEnd}
              summary={<SummaryDisplay text={data.summary} />}>
              <FormTextArea label="个人总结" value={data.summary} onChange={(v) => updateField('summary', v)}
                placeholder="简要描述自己的核心优势和职业目标" rows={4} />
              <div className="mt-1.5">
                <AIPolishButton text={data.summary} type="summary" onAccept={(t) => updateField('summary', t)} />
              </div>
            </EditorSection>
            )}

            {/* 教育经历 */}
            {!isHidden('education') && (
            <EditorSection id="education" editingId={editingId} onStartEdit={() => startEdit('education')} onDoneEdit={doneEdit}
              title="教育经历" icon={Icon.graduation} color="#0891b2"
              onAdd={() => { updateField('education', [...(data.education || []), newEducation()]); startEdit('education'); }}
              onHide={() => hideSection('education')}
              expanded={expandedSections.has('education')} onToggleExpand={() => toggleExpand('education')}
              onDragStart={() => handleDragStart('education')}
              onDragOver={(e) => handleDragOver(e, 'education')}
              onDragEnd={handleDragEnd}
              summary={
                <EducationDisplay
                  items={data.education || []}
                  onDelete={(i) => updateField('education', (data.education || []).filter((_, idx) => idx !== i))}
                />
              }>
              <EducationForm data={data.education || []} onChange={(v) => updateField('education', v)} />
            </EditorSection>
            )}

            {/* 工作经历 */}
            {!isHidden('workExperience') && (
            <EditorSection id="workExperience" editingId={editingId} onStartEdit={() => startEdit('workExperience')} onDoneEdit={doneEdit}
              title="工作经历" icon={Icon.briefcase} color="#d97706"
              onAdd={() => { updateField('workExperience', [...data.workExperience, newWork()]); startEdit('workExperience'); }}
              onHide={() => hideSection('workExperience')}
              expanded={expandedSections.has('workExperience')} onToggleExpand={() => toggleExpand('workExperience')}
              onDragStart={() => handleDragStart('workExperience')}
              onDragOver={(e) => handleDragOver(e, 'workExperience')}
              onDragEnd={handleDragEnd}
              summary={
                <ExperienceListDisplay<WorkExperience>
                  items={data.workExperience} getKey={(x) => x.id}
                  getLabel={(x) => x.company} getSub={(x) => [x.position, x.department].filter(Boolean).join(' · ')}
                  getDate={(x) => x.startDate && x.endDate ? `${x.startDate} - ${x.endDate}` : ''}
                  onDelete={(i) => updateField('workExperience', data.workExperience.filter((_, idx) => idx !== i))}
                />
              }>
              <WorkExperienceForm data={data.workExperience} onChange={(v) => updateField('workExperience', v)} />
            </EditorSection>
            )}

            {/* 项目经历 */}
            {!isHidden('projectExperience') && (
            <EditorSection id="projectExperience" editingId={editingId} onStartEdit={() => startEdit('projectExperience')} onDoneEdit={doneEdit}
              title="项目经历" icon={Icon.folder} color="#7c3aed"
              onAdd={() => { updateField('projectExperience', [...data.projectExperience, newProject()]); startEdit('projectExperience'); }}
              onHide={() => hideSection('projectExperience')}
              expanded={expandedSections.has('projectExperience')} onToggleExpand={() => toggleExpand('projectExperience')}
              onDragStart={() => handleDragStart('projectExperience')}
              onDragOver={(e) => handleDragOver(e, 'projectExperience')}
              onDragEnd={handleDragEnd}
              summary={
                <ExperienceListDisplay<ProjectExperience>
                  items={data.projectExperience} getKey={(x) => x.id}
                  getLabel={(x) => x.name} getSub={(x) => x.role}
                  getDate={(x) => x.startDate && x.endDate ? `${x.startDate} - ${x.endDate}` : ''}
                  onDelete={(i) => updateField('projectExperience', data.projectExperience.filter((_, idx) => idx !== i))}
                />
              }>
              <ProjectExperienceForm data={data.projectExperience} onChange={(v) => updateField('projectExperience', v)} />
            </EditorSection>
            )}

            {/* 社团经历 */}
            {!isHidden('organizationExperience') && (
            <EditorSection id="organizationExperience" editingId={editingId} onStartEdit={() => startEdit('organizationExperience')} onDoneEdit={doneEdit}
              title="社团经历" icon={Icon.people} color="#0891b2"
              onAdd={() => { updateField('organizationExperience', [...data.organizationExperience, newOrg()]); startEdit('organizationExperience'); }}
              onHide={() => hideSection('organizationExperience')}
              expanded={expandedSections.has('organizationExperience')} onToggleExpand={() => toggleExpand('organizationExperience')}
              onDragStart={() => handleDragStart('organizationExperience')}
              onDragOver={(e) => handleDragOver(e, 'organizationExperience')}
              onDragEnd={handleDragEnd}
              summary={
                <ExperienceListDisplay<OrganizationExperience>
                  items={data.organizationExperience} getKey={(x) => x.id}
                  getLabel={(x) => x.name} getSub={(x) => [x.role, x.department].filter(Boolean).join(' · ')}
                  getDate={(x) => x.startDate && x.endDate ? `${x.startDate} - ${x.endDate}` : ''}
                  onDelete={(i) => updateField('organizationExperience', data.organizationExperience.filter((_, idx) => idx !== i))}
                />
              }>
              <OrganizationForm data={data.organizationExperience} onChange={(v) => updateField('organizationExperience', v)} />
            </EditorSection>
            )}

            {/* 荣誉奖项 */}
            {!isHidden('awards') && (
            <EditorSection id="awards" editingId={editingId} onStartEdit={() => startEdit('awards')} onDoneEdit={doneEdit}
              title="荣誉奖项" icon={Icon.award} color="#e11d48"
              onAdd={() => { updateField('awards', [...data.awards, newAward()]); startEdit('awards'); }}
              onHide={() => hideSection('awards')}
              expanded={expandedSections.has('awards')} onToggleExpand={() => toggleExpand('awards')}
              onDragStart={() => handleDragStart('awards')}
              onDragOver={(e) => handleDragOver(e, 'awards')}
              onDragEnd={handleDragEnd}
              summary={<AwardsDisplay items={data.awards} onDelete={(i) => updateField('awards', data.awards.filter((_, idx) => idx !== i))} />}>
              <AwardsForm data={data.awards} onChange={(v) => updateField('awards', v)} />
            </EditorSection>
            )}

            {/* 其他 */}
            {!isHidden('others') && (
            <EditorSection id="others" editingId={editingId} onStartEdit={() => startEdit('others')} onDoneEdit={doneEdit}
              title="其他" icon={Icon.star} color="#0d9488"
              onHide={() => hideSection('others')}
              expanded={expandedSections.has('others')} onToggleExpand={() => toggleExpand('others')}
              onDragStart={() => handleDragStart('others')}
              onDragOver={(e) => handleDragOver(e, 'others')}
              onDragEnd={handleDragEnd}
              summary={<OthersDisplay others={data.others} onUpdate={(o) => updateField('others', o)} />}>
              <OthersForm others={data.others} onChange={(o) => updateField('others', o)} />
            </EditorSection>
            )}

            {/* 添加栏目 - 恢复已删除的栏目 */}
            {hiddenSections.size > 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">已隐藏的栏目（点击恢复）</div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(hiddenSections).map((sid) => (
                    <button key={sid} type="button" onClick={() => showSection(sid)}
                      className="px-3 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-full transition-colors">
                      + {SECTION_LABELS[sid]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 标签管理 - 折叠式，低调入口 */}
            <CollapsibleTagEditor tags={data.tags} onChange={(tags) => updateField('tags', tags)} />
          </div>
          </div>
          )}

        </div>

        {/* Right: Live Preview */}
        <div
          ref={previewContainerCallback}
          className="flex-1 bg-gray-200 overflow-auto relative"
          style={{ padding: '16px' }}
        >
          {/* Spacer reserves vertical space for the scaled content */}
          {(() => {
            const totalScale = previewScale * (compactMode && compactScale < 1 ? compactScale : 1);
            return (
              <div
                style={{
                  width: `${A4_WIDTH * totalScale}px`,
                  height: `${A4_HEIGHT * totalScale}px`,
                  margin: '0 auto',
                  position: 'relative',
                }}
              >
                {/* Print area: 794px layout box, scaled visually */}
                <div
                  className="print-area shadow-lg bg-white"
                  ref={previewRef}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${A4_WIDTH}px`,
                    minHeight: `${A4_HEIGHT}px`,
                    transform: `scale(${totalScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {TemplateComponent ? (
                    <TemplateComponent resume={previewData} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ width: '794px', minHeight: '1123px' }}>
                      <p className="text-gray-400 text-sm">请选择模板</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* AI 智能导入弹窗 */}
      {showAIImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAIImport(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[560px] max-w-[90vw] max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <AIImportPanel
                defaultExpanded
                onClose={() => setShowAIImport(false)}
                onSuccess={(parsed: ParsedResumeData) => {
                  const importedSkills = parsed.others?.skills?.length ? parsed.others.skills
                    : parsed.skills?.length ? parsed.skills
                    : undefined;
                  setData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, ...(parsed.personalInfo || {}) },
                    summary: parsed.summary || prev.summary,
                    workExperience: parsed.workExperience?.length ? parsed.workExperience : prev.workExperience,
                    projectExperience: parsed.projectExperience?.length ? parsed.projectExperience : prev.projectExperience,
                    organizationExperience: parsed.organizationExperience?.length ? parsed.organizationExperience : prev.organizationExperience,
                    awards: parsed.awards?.length ? parsed.awards : prev.awards,
                    skills: importedSkills || prev.skills,
                    others: {
                      ...prev.others,
                      skills: importedSkills || prev.others?.skills || [],
                    },
                  }));
                  setToast({ message: 'AI 导入成功，请检查并完善内容', type: 'success' });
                  setShowAIImport(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 新手引导 */}
      {showOnboarding && (
        <OnboardingTooltip steps={onboardingSteps} onComplete={handleOnboardingComplete} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
