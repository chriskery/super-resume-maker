import { useState } from 'react';
import { aiApi } from '../../services/api';

interface AIGenerateHighlightsProps {
  position: string;
  company: string;
  description?: string;
  type: 'work' | 'project';
  onInsert: (selected: string[]) => void;
}

export default function AIGenerateHighlights({
  position,
  company,
  description,
  type,
  onInsert,
}: AIGenerateHighlightsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!position.trim() || !company.trim()) {
      setError('请先填写职位和公司/项目信息');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(new Set());
    try {
      const data = await aiApi.generateHighlights({ position, company, description, type });
      setResults(data.highlights);
      if (!data.highlights.length) {
        setError('AI 未生成有效结果，请补充更多信息后重试');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'AI 生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleInsert = () => {
    const picked = results.filter((_, i) => selected.has(i));
    if (picked.length) {
      onInsert(picked);
      setResults([]);
      setSelected(new Set());
    }
  };

  const handleDismiss = () => {
    setResults([]);
    setSelected(new Set());
    setError(null);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>{loading ? '⏳' : '✨'}</span>
        <span>{loading ? '生成中…' : 'AI生成'}</span>
      </button>

      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-2 rounded-md border border-purple-200 bg-purple-50 p-3">
          <div className="mb-2 text-xs font-medium text-purple-800">
            AI 生成建议（勾选后插入）
          </div>
          <ul className="space-y-1.5">
            {results.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(idx)}
                  onChange={() => toggleSelect(idx)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInsert}
              disabled={selected.size === 0}
              className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              插入选中（{selected.size}）
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
