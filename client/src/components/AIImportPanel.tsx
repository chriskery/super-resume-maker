import { useState, useCallback } from 'react';
import { Resume } from '../types/resume';
import { aiApi } from '../services/api';

export type ParsedResumeData = Partial<Resume>;

interface AIImportPanelProps {
  /** 解析成功后的回调 */
  onSuccess: (data: ParsedResumeData) => void;
  /** 紧凑模式（编辑器内使用） */
  compact?: boolean;
  /** 默认展开（弹窗内使用） */
  defaultExpanded?: boolean;
  /** 关闭回调（弹窗关闭按钮） */
  onClose?: () => void;
}

/** 解析结果预览组件 */
function ParsedPreview({ data }: { data: ParsedResumeData }) {
  const { personalInfo, summary, workExperience, projectExperience, organizationExperience, awards, skills } = data;
  const hasInfo = personalInfo && (personalInfo.name || personalInfo.phone || personalInfo.email);

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3 text-sm max-h-[400px] overflow-y-auto">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">解析结果预览</div>

      {hasInfo && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">个人信息</div>
          <div className="text-gray-700 space-y-0.5">
            {personalInfo.name && <div>姓名：{personalInfo.name}</div>}
            {personalInfo.phone && <div>电话：{personalInfo.phone}</div>}
            {personalInfo.email && <div>邮箱：{personalInfo.email}</div>}
            {personalInfo.title && <div>职位：{personalInfo.title}</div>}
          </div>
        </div>
      )}

      {summary && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">个人总结</div>
          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">{summary}</p>
        </div>
      )}

      {workExperience && workExperience.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">工作经历 ({workExperience.length}条)</div>
          {workExperience.map((w, i) => (
            <div key={w.id || i} className="text-gray-700 text-xs ml-2">• {w.company}{w.position ? ` - ${w.position}` : ''}</div>
          ))}
        </div>
      )}

      {projectExperience && projectExperience.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">项目经历 ({projectExperience.length}条)</div>
          {projectExperience.map((p, i) => (
            <div key={p.id || i} className="text-gray-700 text-xs ml-2">• {p.name}{p.role ? ` - ${p.role}` : ''}</div>
          ))}
        </div>
      )}

      {organizationExperience && organizationExperience.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">社团经历 ({organizationExperience.length}条)</div>
          {organizationExperience.map((o, i) => (
            <div key={o.id || i} className="text-gray-700 text-xs ml-2">• {o.name}{o.role ? ` - ${o.role}` : ''}</div>
          ))}
        </div>
      )}

      {awards && awards.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">荣誉奖项 ({awards.length}条)</div>
          {awards.map((a, i) => (
            <div key={i} className="text-gray-700 text-xs ml-2">• {a}</div>
          ))}
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">技能 ({skills.length}条)</div>
          {skills.map((s, i) => (
            <div key={i} className="text-gray-700 text-xs ml-2">• {s.category}{s.items ? `：${s.items}` : ''}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/** AI 智能导入面板 — 内联组件，带 textarea 和操作按钮，解析后需确认 */
export default function AIImportPanel({ onSuccess, compact = false, defaultExpanded = false, onClose }: AIImportPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);

  const handleParse = useCallback(async () => {
    if (!text.trim()) {
      setError('请先粘贴或输入个人信息文本');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await aiApi.importResume(text);
      setParsedData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '解析失败，请检查文本内容后重试';
      setError(msg);
      console.error('AI import error:', err);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleConfirm = useCallback(() => {
    if (parsedData) {
      onSuccess(parsedData);
      setText('');
      setParsedData(null);
      setExpanded(false);
      onClose?.();
    }
  }, [parsedData, onSuccess, onClose]);

  const handleRetry = useCallback(() => {
    setParsedData(null);
    setError(null);
  }, []);

  // 未展开时显示入口卡片
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`w-full text-left border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors ${compact ? 'p-3' : 'p-4'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✨</span>
          <span className={`font-semibold text-purple-700 ${compact ? 'text-sm' : 'text-base'}`}>AI 智能导入</span>
        </div>
        <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          粘贴个人信息文本，AI 自动解析生成结构化简历
        </p>
      </button>
    );
  }

  // 展开后显示完整面板
  return (
    <div className={`border border-purple-200 rounded-lg bg-gradient-to-b from-purple-50 to-blue-50 ${compact ? 'p-3' : 'p-4'}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className={`font-semibold text-purple-700 ${compact ? 'text-sm' : 'text-base'}`}>AI 智能导入</span>
        </div>
        <button
          type="button"
          onClick={() => { setExpanded(false); setText(''); setError(null); setParsedData(null); onClose?.(); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="关闭"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 解析结果预览 */}
      {parsedData ? (
        <div className="space-y-3">
          <ParsedPreview data={parsedData} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              确认导入
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
            >
              重新解析
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setText(''); setError(null); setParsedData(null); onClose?.(); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 输入区 */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请粘贴您的个人信息、工作经历等内容，AI 将自动解析生成简历..."
            className={`w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-gray-400 ${compact ? 'min-h-[120px]' : 'min-h-[180px]'}`}
            rows={compact ? 6 : 10}
          />

          {/* 字数提示 */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{text.length > 0 ? `已输入 ${text.length} 字` : ''}</span>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={loading || !text.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  正在解析...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI 解析
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setText(''); setError(null); onClose?.(); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
}
