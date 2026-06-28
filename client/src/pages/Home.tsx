import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ResumeCard from '../components/ResumeCard';
import { useResumeList } from '../hooks/useResumeList';
import { resumeApi } from '../services/api';
import { templateRegistry } from '../templates/registry';
import TemplatePreview from '../components/TemplatePreview';

type TabKey = 'templates' | 'resumes';

// ─── 模板库 Tab ─────────────────────────────────────────────
function TemplateGallery({ onCreated }: { onCreated: () => void }) {
  const navigate = useNavigate();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleUseTemplate = async (templateId: string) => {
    if (creatingId) return;
    setCreatingId(templateId);
    // 不立即创建，只跳转到编辑器新建模式，用户点保存时才持久化
    navigate(`/editor/new?templateId=${templateId}`);
    setCreatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* 模板卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {templateRegistry.map((tpl) => {
        const isCreating = creatingId === tpl.id;
        return (
          <div
            key={tpl.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleUseTemplate(tpl.id)}
          >
            {/* 模板预览 - 铺满卡片 */}
            <div className="w-full aspect-[3/4] overflow-hidden relative">
              <TemplatePreview templateId={tpl.id} />
              {/* hover 遮罩 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 px-4 py-2 rounded-lg text-sm">
                  {isCreating ? '创建中...' : '使用此模板'}
                </span>
              </div>
            </div>

            <div className="p-3 text-center">
              <h3 className="text-sm font-semibold text-gray-900">{tpl.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

// ─── 我的简历 Tab ───────────────────────────────────────────
function MyResumes({
  resumes,
  loading,
  error,
  refresh,
}: {
  resumes: ReturnType<typeof useResumeList>['resumes'];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这份简历吗？此操作不可撤销。')) return;
    setDeletingId(id);
    try {
      await resumeApi.delete(id);
      refresh();
    } catch {
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await resumeApi.duplicate(id);
      refresh();
    } catch {
      alert('复制失败，请重试');
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await resumeApi.patch(id, { title: newTitle });
      refresh();
    } catch {
      alert('改名失败，请重试');
    }
  };

  return (
    <>
      {loading && resumes.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={refresh} className="ml-2 underline">重试</button>
        </div>
      )}

      {!loading && resumes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有简历</h2>
          <p className="text-gray-500 mb-6">去「模板库」选一个模板，创建你的第一份简历吧！</p>
        </div>
      )}

      {resumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <ResumeCard key={r.id} resume={r} onDelete={handleDelete} onDuplicate={handleDuplicate} onRename={handleRename} />
          ))}
        </div>
      )}

      {deletingId && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          正在删除...
        </div>
      )}
    </>
  );
}

// ─── 主页面 ─────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const { resumes, loading, error, refresh } = useResumeList();

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'templates', label: '模板库' },
    { key: 'resumes', label: '我的简历' },
  ];

  return (
    <Layout>
      {/* Tab 切换栏 */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'templates' && (
        <TemplateGallery onCreated={refresh} />
      )}
      {activeTab === 'resumes' && (
        <MyResumes
          resumes={resumes}
          loading={loading}
          error={error}
          refresh={refresh}
        />
      )}
    </Layout>
  );
}
