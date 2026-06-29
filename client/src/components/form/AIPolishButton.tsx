import { useState, useRef, useCallback } from 'react';
import { streamFetch } from '../../services/api';

interface AIPolishButtonProps {
  text: string;
  type: string;
  onAccept: (newText: string) => void;
}

export default function AIPolishButton({ text, type, onAccept }: AIPolishButtonProps) {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [polished, setPolished] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handlePolish = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setStreaming(false);
    setError(null);
    setPolished('');

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      // 先打开弹窗以便实时展示流式内容
      setShowDialog(true);
      setStreaming(true);
      setLoading(false);

      await streamFetch(
        '/api/ai/polish',
        { text, type },
        (accumulated) => setPolished(accumulated),
        abort.signal,
      );
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        // 用户取消，静默处理
      } else {
        const msg = (err as { message?: string })?.message || 'AI 润色失败，请稍后重试';
        setError(msg);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleAccept = () => {
    onAccept(polished);
    setShowDialog(false);
  };

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setShowDialog(false);
    setStreaming(false);
    setLoading(false);
  }, []);

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={handlePolish}
          disabled={loading || streaming || !text.trim()}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="AI 润色"
        >
          {loading ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>连接中...</span>
            </>
          ) : streaming ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>AI 润色</span>
            </>
          )}
        </button>
        {error && (
          <span className="text-xs text-red-500 ml-1">{error}</span>
        )}
      </div>

      {/* 对比弹窗 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-[720px] max-w-[90vw] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <span>✨</span> AI 润色结果
                {streaming && (
                  <span className="inline-flex items-center gap-1 text-xs text-purple-500 font-normal ml-2">
                    <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                    生成中
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">原文</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200 min-h-[100px] max-h-[50vh] overflow-y-auto">
                  {text}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-600 mb-2">润色后</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 rounded-lg p-3 border border-purple-200 min-h-[100px] max-h-[50vh] overflow-y-auto">
                  {polished}
                  {streaming && (
                    <span className="inline-block w-0.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {streaming ? '停止' : '取消'}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={streaming || !polished}
                className="px-4 py-1.5 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                采用
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
