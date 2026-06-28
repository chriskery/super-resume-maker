import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/api';

const templateOptions = [
  { id: 'professional', name: '专业模板', description: '经典专业中文简历，适合求职' },
  { id: 'minimal', name: '简约模板', description: '简洁清爽，突出内容' },
  { id: 'modern', name: '现代模板', description: '双栏设计，现代感十足' },
];

interface CreateResumeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateResumeModal({ open, onClose, onCreated }: CreateResumeModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('professional');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('请输入简历标题');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const resume = await resumeApi.create({ title: title.trim(), templateId });
      onCreated?.();
      onClose();
      navigate(`/editor/${resume.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">新建简历</h2>

        {/* Title input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">简历标题</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：我的简历"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Template selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择模板</label>
          <div className="grid grid-cols-3 gap-3">
            {templateOptions.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`border rounded-lg p-3 text-left transition-all ${
                  templateId === t.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {creating ? '创建中...' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
