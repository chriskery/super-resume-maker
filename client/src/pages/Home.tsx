import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ResumeCard from '../components/ResumeCard';
import { useResumeList } from '../hooks/useResumeList';
import { resumeApi } from '../services/api';
import { templateRegistry } from '../templates/registry';
import TemplatePreview from '../components/TemplatePreview';

type TabKey = 'templates' | 'resumes';
type TemplateCategory = '全部' | '通用' | '互联网' | '金融' | '设计' | '学术';
type SortOrder = 'updatedAt' | 'createdAt';

// ─── 简历卡片更多操作菜单 ─────────────────────────────────────
function ResumeCardMenu({
  resumeId,
  resumeTitle,
  onDuplicate,
  onRename,
  onDelete,
}: {
  resumeId: string;
  resumeTitle: string;
  onDuplicate: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(resumeTitle);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setRenaming(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleRenameSubmit = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== resumeTitle) {
      onRename(resumeId, trimmed);
    }
    setRenaming(false);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        title="更多操作"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-36">
          {renaming ? (
            <div className="px-3 py-2" onClick={e => e.stopPropagation()}>
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') { setRenaming(false); setOpen(false); } }}
                className="w-full border border-blue-400 rounded px-2 py-1 text-xs focus:outline-none"
                placeholder="输入新名称"
              />
              <div className="flex gap-1 mt-1.5">
                <button onClick={handleRenameSubmit} className="flex-1 text-xs bg-blue-600 text-white rounded py-1 hover:bg-blue-700">确认</button>
                <button onClick={() => { setRenaming(false); setOpen(false); }} className="flex-1 text-xs bg-gray-100 text-gray-600 rounded py-1 hover:bg-gray-200">取消</button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(resumeId); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                </svg>
                复制
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setRenaming(true); setNameInput(resumeTitle); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" />
                </svg>
                改名
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(resumeId); }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeWidth="2" />
                </svg>
                删除
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 模板库 Tab ─────────────────────────────────────────────
function TemplateGallery({ onCreated }: { onCreated: () => void }) {
  const navigate = useNavigate();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('全部');

  const categories: TemplateCategory[] = ['全部', '通用', '互联网', '金融', '设计', '学术'];

  const filteredTemplates = activeCategory === '全部'
    ? templateRegistry
    : templateRegistry.filter(t => t.tags.includes(activeCategory));

  const handleUseTemplate = async (templateId: string) => {
    if (creatingId) return;
    setCreatingId(templateId);
    navigate(`/editor/new?templateId=${templateId}`);
    setCreatingId(null);
  };

  // suppress unused warning
  void onCreated;

  return (
    <div className="space-y-4">
      {/* 分类筛选 Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-2.5 text-sm transition-colors relative ${
              activeCategory === cat
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat}
            {cat !== '全部' && (
              <span className="ml-1 text-xs opacity-70">
                {templateRegistry.filter(t => t.tags.includes(cat)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 模板卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTemplates.map((tpl) => {
          const isCreating = creatingId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleUseTemplate(tpl.id)}
            >
              {/* 模板预览 */}
              <div className="w-full overflow-hidden relative">
                <TemplatePreview templateId={tpl.id} />
                {/* hover 遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 px-4 py-2 rounded-lg text-sm">
                    {isCreating ? '创建中...' : '使用此模板'}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{tpl.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{tpl.category}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{tpl.description}</p>
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
  onGoTemplates,
}: {
  resumes: ReturnType<typeof useResumeList>['resumes'];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  onGoTemplates: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updatedAt');

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

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(resumes.map(r => r.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 份简历吗？此操作不可撤销。`)) return;
    setBatchDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => resumeApi.delete(id)));
      exitSelectionMode();
      refresh();
    } catch {
      alert('部分删除失败，请刷新后重试');
    } finally {
      setBatchDeleting(false);
    }
  };

  // 过滤 + 排序
  const processedResumes = resumes
    .filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aTime = sortOrder === 'updatedAt' ? (a.updatedAt ?? a.createdAt ?? '') : (a.createdAt ?? '');
      const bTime = sortOrder === 'updatedAt' ? (b.updatedAt ?? b.createdAt ?? '') : (b.createdAt ?? '');
      return bTime.localeCompare(aTime);
    });

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

      {/* 空状态引导 */}
      {!loading && resumes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有简历</h2>
          <p className="text-gray-500 mb-6 text-sm">选择一个精美模板，快速创建你的第一份简历</p>
          <button
            onClick={onGoTemplates}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            浏览模板库
          </button>
        </div>
      )}

      {resumes.length > 0 && (
        <>
          {/* 顶部操作栏 */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {selectionMode ? (
              <div className="flex items-center gap-3 w-full">
                <span className="text-sm text-gray-600">已选择 {selectedIds.size} 项</span>
                <button onClick={selectAll} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">全选</button>
                <button onClick={clearSelection} className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors">取消全选</button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.size === 0 || batchDeleting}
                  className={`text-sm px-3 py-1.5 rounded transition-colors ${selectedIds.size === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                  {batchDeleting ? '删除中...' : '删除选中'}
                </button>
                <button onClick={exitSelectionMode} className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors ml-auto">退出管理</button>
              </div>
            ) : (
              <>
                {/* 搜索框 */}
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索简历名称"
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>

                {/* 排序选择 */}
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as SortOrder)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-gray-600"
                >
                  <option value="updatedAt">最近更新</option>
                  <option value="createdAt">最早创建</option>
                </select>

                <span className="text-xs text-gray-400 ml-1">{processedResumes.length} 份简历</span>

                <button
                  onClick={() => setSelectionMode(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors ml-auto"
                >
                  管理
                </button>
              </>
            )}
          </div>

          {/* 搜索无结果 */}
          {processedResumes.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="1.5" /><path d="m21 21-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-gray-500 text-sm">未找到名称含「{searchQuery}」的简历</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-blue-600 hover:underline">清除搜索</button>
            </div>
          )}

          {/* 简历卡片网格 */}
          {processedResumes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {processedResumes.map((r) => (
                <div key={r.id} className="relative group/card">
                  <ResumeCard
                    resume={r}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onRename={handleRename}
                    selectionMode={selectionMode}
                    selected={selectedIds.has(r.id)}
                    onToggleSelect={toggleSelect}
                  />
                  {/* 卡片菜单悬浮按钮（非选择模式时显示） */}
                  {!selectionMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <ResumeCardMenu
                        resumeId={r.id}
                        resumeTitle={r.title}
                        onDuplicate={handleDuplicate}
                        onRename={handleRename}
                        onDelete={handleDelete}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
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
const DEFAULT_TAB: TabKey = 'templates';
const VALID_TABS: TabKey[] = ['templates', 'resumes'];

function getValidTab(value: string | null): TabKey {
  return value && (VALID_TABS as string[]).includes(value) ? (value as TabKey) : DEFAULT_TAB;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getValidTab(searchParams.get('tab'));
  const { resumes, loading, error, refresh } = useResumeList();

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'templates', label: '模板库', count: undefined },
    { key: 'resumes', label: '我的简历', count: resumes.length || undefined },
  ];

  const goToTemplates = () => setSearchParams({ tab: 'templates' }, { replace: true });

  return (
    <Layout>
      {/* Tab 切换栏 */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key }, { replace: true })}
            className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
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
          onGoTemplates={goToTemplates}
        />
      )}
    </Layout>
  );
}
