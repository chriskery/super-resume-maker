import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Resume } from '../types/resume';
import { getTemplate } from '../templates/registry';

const templateNameMap: Record<string, string> = {
  professional: '专业模板',
  minimal: '简约模板',
  modern: '现代模板',
  elegant: '优雅模板',
  classic: '经典模板',
};

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function ResumeCard({ resume, onDelete, onDuplicate, onRename, selectionMode, selected, onToggleSelect }: ResumeCardProps) {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(resume.title);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleRenameConfirm = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== resume.title) {
      onRename(resume.id, trimmed);
    }
    setIsRenaming(false);
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden transition-all duration-200 flex flex-col relative ${
      selectionMode && selected ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-200 hover:shadow-lg hover:border-blue-300'
    }`}>
      {/* 选择模式 checkbox */}
      {selectionMode && (
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(resume.id); }}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
            selected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 hover:border-blue-400'
          }`}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}
      {/* 简历预览缩略图 */}
      <div
        className="w-full aspect-[3/4] overflow-hidden bg-gray-50 border-b border-gray-100 relative cursor-pointer group"
        onClick={() => {
          if (isRenaming) return;
          if (selectionMode) { onToggleSelect?.(resume.id); return; }
          navigate(`/editor/${resume.id}`);
        }}
      >
        <div style={{ zoom: 0.22, pointerEvents: 'none', userSelect: 'none' }}>
          {(() => {
            const tpl = getTemplate(resume.templateId);
            if (!tpl) return null;
            const Comp = tpl.component;
            const safeResume = {
              ...resume,
              personalInfo: resume.personalInfo ?? { name: '', phone: '', email: '', title: '' },
              workExperience: resume.workExperience ?? [],
              projectExperience: resume.projectExperience ?? [],
              organizationExperience: resume.organizationExperience ?? [],
              education: resume.education ?? [],
              awards: resume.awards ?? [],
              skills: resume.skills ?? [],
              tags: resume.tags ?? [],
            };
            return <Comp resume={safeResume} />;
          })()}
        </div>
        {/* hover 遮罩 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(resume.id); }}
            className="bg-white/90 hover:bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow transition-colors"
            title="复制简历"
          >
            复制
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRenameValue(resume.title); setIsRenaming(true); }}
            className="bg-white/90 hover:bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow transition-colors"
            title="修改标题"
          >
            改名
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{resume.title}</h3>
          <p className="text-xs text-gray-400 mt-1">更新于 {formatDate(resume.updatedAt)}</p>
          {/* 标签展示 */}
          {resume.tags && resume.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {resume.tags.map((tag, i) => (
                <span key={i} className="inline-block bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => navigate(`/editor/${resume.id}`)}
            className="flex-1 text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(resume.id)}
            className="flex-1 text-xs text-red-500 hover:bg-red-50 py-1.5 rounded transition-colors"
          >
            删除
          </button>
        </div>
      </div>

      {/* 改名弹窗 */}
      {isRenaming && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setIsRenaming(false)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">修改简历标题</h4>
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setIsRenaming(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsRenaming(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleRenameConfirm} className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
