import { useState } from 'react';
import Layout from '../components/Layout';
import ResumeCard from '../components/ResumeCard';
import CreateResumeModal from '../components/CreateResumeModal';
import { useResumeList } from '../hooks/useResumeList';
import { resumeApi } from '../services/api';

export default function Home() {
  const { resumes, loading, error, refresh } = useResumeList();
  const [showCreate, setShowCreate] = useState(false);
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

  const newBtn = (
    <button
      onClick={() => setShowCreate(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      新建简历
    </button>
  );

  return (
    <Layout actions={newBtn}>
      {/* Loading state */}
      {loading && resumes.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={refresh} className="ml-2 underline">重试</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && resumes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有简历</h2>
          <p className="text-gray-500 mb-6">点击上方按钮，创建你的第一份简历吧！</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建简历
          </button>
        </div>
      )}

      {/* Resume grid */}
      {resumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map(r => (
            <ResumeCard key={r.id} resume={r} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Delete loading overlay */}
      {deletingId && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          正在删除...
        </div>
      )}

      {/* Create modal */}
      <CreateResumeModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </Layout>
  );
}
