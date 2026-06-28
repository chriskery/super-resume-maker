import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Resume, WorkExperience, ProjectExperience, OrganizationExperience, Skill, Education, OtherInfo } from '../types/resume';
import { useResume } from '../hooks/useResume';
import { getTemplate, templateRegistry } from '../templates/registry';
import ExportButton from '../components/ExportButton';
import PersonalInfoForm from '../components/sections/PersonalInfoForm';
import WorkExperienceForm from '../components/sections/WorkExperienceForm';
import ProjectExperienceForm from '../components/sections/ProjectExperienceForm';
import OrganizationForm from '../components/sections/OrganizationForm';
import AwardsForm from '../components/sections/AwardsForm';
import SkillsForm from '../components/sections/SkillsForm';
import EducationForm from '../components/sections/EducationForm';
import FormTextArea from '../components/form/FormTextArea';
import AIPolishButton from '../components/form/AIPolishButton';
import { mockResume } from '../templates/mockData';
import AIImportPanel, { ParsedResumeData } from '../components/AIImportPanel';
import { aiApi } from '../services/api';

/* ─── Factories ─── */
const emptyOthers = (): OtherInfo => ({ skills: [], certificates: [], languages: [], hobbies: [], activities: [] });

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
  if (hidden.has('others')) result.others = { skills: [], certificates: [], languages: [], hobbies: [], activities: [] };
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
  graduation: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
}) {
  const isEditing = editingId === id;

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${isEditing ? 'border-blue-300 bg-gray-50' : 'border-gray-200 bg-white'}`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div
          className="flex items-center gap-2 min-w-0 cursor-pointer select-none"
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
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!isEditing && onAdd && (
            <button type="button" onClick={onAdd} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded" title={`添加${title}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          )}
          {!isEditing && onHide && (
            <button type="button" onClick={onHide} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded" title="隐藏此栏目">
              {Icon.trash}
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

function AwardsDisplay({ items, onDelete }: { items: string[]; onDelete: (i: number) => void }) {
  if (items.length === 0) return <div className="text-sm text-gray-400 py-1">暂无荣誉奖项</div>;
  return (
    <ul className="space-y-1 py-1">
      {items.map((a, i) => (
        <li key={i} className="flex items-center justify-between group text-sm text-gray-700">
          <span className="truncate mr-2">• {a || `奖项 ${i + 1}`}</span>
          <button type="button" onClick={() => onDelete(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" title="删除">
            {Icon.trash}
          </button>
        </li>
      ))}
    </ul>
  );
}

function SkillsDisplay({ items, onDelete }: { items: Skill[]; onDelete: (i: number) => void }) {
  if (items.length === 0) return <div className="text-sm text-gray-400 py-1">暂无技能</div>;
  return (
    <div className="space-y-1.5 py-1">
      {items.map((s, i) => (
        <div key={i} className="flex items-start justify-between group">
          <div className="flex-1 min-w-0 mr-2">
            <span className="text-sm font-medium text-gray-800">{s.category || '未分类'}</span>
            {s.items && <span className="text-xs text-gray-500 ml-1">— {s.items}</span>}
          </div>
          <button type="button" onClick={() => onDelete(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" title="删除">
            {Icon.trash}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Others Display ─── */
function OthersDisplay({ others, onUpdate }: { others: OtherInfo; onUpdate: (o: OtherInfo) => void }) {
  const sections: { key: keyof OtherInfo; label: string }[] = [
    { key: 'certificates', label: '证书/执照' },
    { key: 'languages', label: '语言' },
    { key: 'hobbies', label: '兴趣爱好' },
    { key: 'activities', label: '活动' },
  ];
  const hasAny = sections.some(s => others[s.key].length > 0);
  if (!hasAny) return <div className="text-sm text-gray-400 py-1">暂无其他信息</div>;
  return (
    <div className="space-y-2 py-1">
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
  const sections: { key: keyof OtherInfo; label: string; placeholder: string }[] = [
    { key: 'certificates', label: '证书/执照', placeholder: '如：CFA（二级）' },
    { key: 'languages', label: '语言', placeholder: '如：英语（CET-6）' },
    { key: 'hobbies', label: '兴趣爱好', placeholder: '如：篮球（校队队长）' },
    { key: 'activities', label: '活动', placeholder: '如：XX公众号（运营）' },
  ];

  return (
    <div className="space-y-4">
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
  result, loading, error, onRescore,
}: {
  result: AIScoreResult | null;
  loading: boolean;
  error: string | null;
  onRescore: () => void;
}) {
  const colors = result ? getScoreColor(result.score) : null;

  return (
    <div className="border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-purple-700">AI 智能检查</span>
        </div>
        {(result || error) && (
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <span className="text-xs text-gray-500">AI 正在评分中...</span>
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
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<SectionId | null>(null);
  const [showAIImport, setShowAIImport] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<SectionId>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(() => new Set(ALL_SECTION_IDS));
  const titleManualEdited = useRef(false);

  /* ─── AI Score ─── */
  const [scoreResult, setScoreResult] = useState<AIScoreResult | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const scoreAbortRef = useRef<AbortController | null>(null);

  const doScore = useCallback(async (resumeData: Resume) => {
    // Abort previous in-flight score request
    if (scoreAbortRef.current) {
      scoreAbortRef.current.abort();
    }
    const controller = new AbortController();
    scoreAbortRef.current = controller;

    setScoreLoading(true);
    setScoreError(null);
    try {
      const r = await aiApi.scoreResume(resumeData, controller.signal);
      setScoreResult(r);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'CanceledError' || (err as Error)?.name === 'AbortError') return;
      const msg = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'AI 评分失败，请稍后重试';
      setScoreError(msg);
      console.error('AI score error:', err);
    } finally {
      if (scoreAbortRef.current === controller) {
        setScoreLoading(false);
        scoreAbortRef.current = null;
      }
    }
  }, []);

  const initialTemplateId = searchParams.get('templateId') || 'professional';
  const [data, setData] = useState<Resume>(() => emptyResume(initialTemplateId));
  const [previewData, setPreviewData] = useState<Resume>(() => emptyResume(initialTemplateId));

  useEffect(() => {
    if (resume) {
      setData(resume);
      setPreviewData(resume);
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
    setSaving(true);
    try {
      const saved = await save(data);
      setPreviewData(data); // sync preview after successful save
      setToast('保存成功');
      if (isNew && saved?.id) navigate(`/editor/${saved.id}`, { replace: true });
    } catch { setToast('保存失败，请重试'); }
    finally { setSaving(false); }
  }, [data, save, isNew, navigate]);

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
  const templateInfo = getTemplate(previewData.templateId);
  const TemplateComponent = templateInfo?.component;

  /* ─── Preview scale ─── */
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1122;

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const update = () => setPreviewScale(Math.min(1, (el.clientWidth - 48) / A4_WIDTH));
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
  const doneEdit = () => {
    setEditingId(null);
    setPreviewData(data); // sync preview after section save
  };
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
            <button type="button" onClick={() => setShowAIImport(true)}
              className="px-4 py-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 导入
            </button>
            <select value={data.templateId} onChange={(e) => updateField('templateId', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {templateRegistry.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
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
            <ExportButton documentTitle={data.title || '我的简历'} getPrintRef={() => previewRef.current} />
          </div>
        </div>
      </header>

      {/* ─── Two Column Layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Dual-mode Editor */}
        <div className="w-[38%] flex-shrink-0 overflow-y-auto p-5 space-y-3 no-print flex flex-col">
          <div className="flex-1 space-y-3">
            {/* AI Score Card */}
            <AIScoreCard
              result={scoreResult}
              loading={scoreLoading}
              error={scoreError}
              onRescore={() => doScore(data)}
            />

            {/* 个人信息 */}
            {!isHidden('personalInfo') && (
            <EditorSection id="personalInfo" editingId={editingId} onStartEdit={() => startEdit('personalInfo')} onDoneEdit={doneEdit}
              title="个人信息" icon={Icon.user} color="#2563eb"
              onHide={() => hideSection('personalInfo')}
              expanded={expandedSections.has('personalInfo')} onToggleExpand={() => toggleExpand('personalInfo')}
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
              onAdd={() => { updateField('awards', [...data.awards, '']); startEdit('awards'); }}
              onHide={() => hideSection('awards')}
              expanded={expandedSections.has('awards')} onToggleExpand={() => toggleExpand('awards')}
              summary={<AwardsDisplay items={data.awards} onDelete={(i) => updateField('awards', data.awards.filter((_, idx) => idx !== i))} />}>
              <AwardsForm data={data.awards} onChange={(v) => updateField('awards', v)} />
            </EditorSection>
            )}

            {/* 技能 */}
            {!isHidden('skills') && (
            <EditorSection id="skills" editingId={editingId} onStartEdit={() => startEdit('skills')} onDoneEdit={doneEdit}
              title="技能" icon={Icon.code} color="#4f46e5"
              onAdd={() => { updateField('skills', [...data.skills, { category: '', items: '' }]); startEdit('skills'); }}
              onHide={() => hideSection('skills')}
              expanded={expandedSections.has('skills')} onToggleExpand={() => toggleExpand('skills')}
              summary={<SkillsDisplay items={data.skills} onDelete={(i) => updateField('skills', data.skills.filter((_, idx) => idx !== i))} />}>
              <SkillsForm data={data.skills} onChange={(v) => updateField('skills', v)} />
            </EditorSection>
            )}

            {/* 其他 */}
            {!isHidden('others') && (
            <EditorSection id="others" editingId={editingId} onStartEdit={() => startEdit('others')} onDoneEdit={doneEdit}
              title="其他" icon={Icon.star} color="#0d9488"
              onHide={() => hideSection('others')}
              expanded={expandedSections.has('others')} onToggleExpand={() => toggleExpand('others')}
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

        {/* Right: Live Preview */}
        <div
          ref={previewContainerRef}
          className="flex-1 bg-gray-200 overflow-auto relative"
          style={{ padding: '16px' }}
        >
          {/* Spacer reserves vertical space for the scaled content */}
          <div
            style={{
              width: `${A4_WIDTH * previewScale}px`,
              height: `${A4_HEIGHT * previewScale}px`,
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
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              {TemplateComponent ? (
                <TemplateComponent resume={filterByHidden(mergeWithMock(previewData), hiddenSections)} />
              ) : (
                <div className="flex items-center justify-center" style={{ width: '210mm', minHeight: '297mm' }}>
                  <p className="text-gray-400 text-sm">请选择模板</p>
                </div>
              )}
            </div>
          </div>
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
                  setData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, ...(parsed.personalInfo || {}) },
                    summary: parsed.summary || prev.summary,
                    workExperience: parsed.workExperience?.length ? parsed.workExperience : prev.workExperience,
                    projectExperience: parsed.projectExperience?.length ? parsed.projectExperience : prev.projectExperience,
                    organizationExperience: parsed.organizationExperience?.length ? parsed.organizationExperience : prev.organizationExperience,
                    awards: parsed.awards?.length ? parsed.awards : prev.awards,
                    skills: parsed.skills?.length ? parsed.skills : prev.skills,
                  }));
                  setToast('AI 导入成功，请检查并完善内容');
                  setShowAIImport(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
