import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Resume } from '../types/resume';
import { useResume } from '../hooks/useResume';
import { getTemplate, templateRegistry } from '../templates/registry';
import ExportButton from '../components/ExportButton';
import PersonalInfoForm from '../components/sections/PersonalInfoForm';
import WorkExperienceForm from '../components/sections/WorkExperienceForm';
import ProjectExperienceForm from '../components/sections/ProjectExperienceForm';
import OrganizationForm from '../components/sections/OrganizationForm';
import AwardsForm from '../components/sections/AwardsForm';
import SkillsForm from '../components/sections/SkillsForm';
import FormTextArea from '../components/form/FormTextArea';

const emptyResume = (templateId: string): Resume => ({
  id: '',
  title: '',
  templateId,
  personalInfo: { name: '', phone: '', email: '', title: '' },
  summary: '',
  workExperience: [],
  projectExperience: [],
  organizationExperience: [],
  awards: [],
  skills: [],
  createdAt: '',
  updatedAt: '',
});

/* ─── Accordion Section ─── */
function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-4 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
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

  // Determine initial templateId
  const initialTemplateId = searchParams.get('templateId') || 'professional';

  // Local resume state
  const [data, setData] = useState<Resume>(() => emptyResume(initialTemplateId));

  // Sync loaded data into local state
  useEffect(() => {
    if (resume) {
      setData(resume);
    }
  }, [resume]);

  // For new mode, ensure templateId from URL is set
  useEffect(() => {
    if (isNew && searchParams.get('templateId')) {
      setData((prev) => ({ ...prev, templateId: searchParams.get('templateId') || 'professional' }));
    }
  }, [isNew, searchParams]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await save(data);
      setToast('保存成功');
      if (isNew && saved?.id) {
        navigate(`/editor/${saved.id}`, { replace: true });
      }
    } catch {
      setToast('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [data, save, isNew, navigate]);

  const updateField = <K extends keyof Resume>(field: K, value: Resume[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  /* ─── Resolve template component ─── */
  const templateInfo = getTemplate(data.templateId);
  const TemplateComponent = templateInfo?.component;

  /* ─── Scale preview to fit container ─── */
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const updateScale = () => {
      // A4 width = 210mm ≈ 794px at 96dpi
      const containerWidth = el.clientWidth - 32; // padding
      setPreviewScale(Math.min(1, containerWidth / 794));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="返回首页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="请输入简历标题"
              className="text-sm font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-0 w-60 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Template selector */}
            <select
              value={data.templateId}
              onChange={(e) => updateField('templateId', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {templateRegistry.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <ExportButton
              documentTitle={data.title || '我的简历'}
              getPrintRef={() => previewRef.current}
            />
          </div>
        </div>
      </header>

      {/* ─── Two Column Layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor Form */}
        <div className="w-1/2 overflow-y-auto p-5 space-y-3 no-print">
          <Section title="个人信息" defaultOpen>
            <PersonalInfoForm
              data={data.personalInfo}
              onChange={(v) => updateField('personalInfo', v)}
            />
          </Section>

          <Section title="个人总结">
            <FormTextArea
              label="个人总结"
              value={data.summary}
              onChange={(v) => updateField('summary', v)}
              placeholder="简要描述自己的核心优势和职业目标"
              rows={4}
            />
          </Section>

          <Section title="工作经历">
            <WorkExperienceForm
              data={data.workExperience}
              onChange={(v) => updateField('workExperience', v)}
            />
          </Section>

          <Section title="项目经历">
            <ProjectExperienceForm
              data={data.projectExperience}
              onChange={(v) => updateField('projectExperience', v)}
            />
          </Section>

          <Section title="社团经历">
            <OrganizationForm
              data={data.organizationExperience}
              onChange={(v) => updateField('organizationExperience', v)}
            />
          </Section>

          <Section title="荣誉奖项">
            <AwardsForm
              data={data.awards}
              onChange={(v) => updateField('awards', v)}
            />
          </Section>

          <Section title="技能">
            <SkillsForm
              data={data.skills}
              onChange={(v) => updateField('skills', v)}
            />
          </Section>
        </div>

        {/* Right: Live Preview */}
        <div
          ref={previewContainerRef}
          className="w-1/2 overflow-y-auto bg-gray-200 flex items-start justify-center p-4"
        >
          <div
            className="print-area shadow-lg bg-white"
            ref={previewRef}
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              marginBottom: `-${(1 - previewScale) * 400}px`,
            }}
          >
            {TemplateComponent ? (
              <TemplateComponent resume={data} />
            ) : (
              <div className="flex items-center justify-center" style={{ width: '210mm', minHeight: '297mm' }}>
                <p className="text-gray-400 text-sm">请选择模板</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
