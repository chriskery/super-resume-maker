import { useState, useEffect } from 'react';
import { templateRegistry } from '../templates/registry';
import { mockResume } from '../templates/mockData';
import { Resume } from '../types/resume';

const A4_W = 794;
const A4_H = 1123;

interface Props {
  currentId: string;
  resume: Resume;
  onSelect: (id: string) => void;
}

export default function TemplatePicker({ currentId, resume, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string>(currentId);

  // 预览用数据：有内容用真实数据，否则 mock
  const previewData: Resume = (() => {
    const hasContent = resume.personalInfo?.name || resume.summary || resume.workExperience?.length > 0;
    return hasContent ? resume : mockResume;
  })();

  const previewTemplate = templateRegistry.find(t => t.id === hoverId) ?? templateRegistry[0];
  const PreviewComponent = previewTemplate.component;

  // 缩略图缩放比（网格卡片宽约 130px）
  const THUMB_W = 130;
  const thumbScale = THUMB_W / A4_W;

  // 右侧大预览缩放（容器高度约 560px）
  const PREVIEW_H = 560;
  const previewScale = PREVIEW_H / A4_H;
  const previewW = A4_W * previewScale;

  // 关闭弹窗 reset hover
  useEffect(() => {
    if (!open) setHoverId(currentId);
  }, [open, currentId]);

  const currentTemplate = templateRegistry.find(t => t.id === currentId);

  return (
    <>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <span className="text-gray-700">{currentTemplate?.name ?? '选择模板'}</span>
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 弹窗遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex overflow-hidden"
            style={{ width: '860px', height: '620px', maxWidth: '95vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 左：模板网格 */}
            <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-800">选择模板</h2>
                <p className="text-xs text-gray-400 mt-0.5">悬停预览，点击应用</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {templateRegistry.map(t => {
                    const Comp = t.component;
                    const isActive = t.id === currentId;
                    const isHovered = t.id === hoverId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                          isActive ? 'border-blue-500 shadow-md' : isHovered ? 'border-blue-300' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ height: `${Math.round(A4_H * thumbScale)}px` }}
                        onMouseEnter={() => setHoverId(t.id)}
                        onClick={() => { onSelect(t.id); setOpen(false); }}
                      >
                        {/* 缩略图渲染 */}
                        <div
                          style={{
                            width: A4_W,
                            height: A4_H,
                            transform: `scale(${thumbScale})`,
                            transformOrigin: 'top left',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          <Comp resume={{ ...previewData, templateId: t.id }} />
                        </div>
                        {/* 选中角标 */}
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {/* 名称 tooltip */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-1.5">
                          <span className="text-white text-[10px] font-medium drop-shadow">{t.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右：大预览 */}
            <div className="flex-1 bg-gray-100 flex flex-col">
              <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-800">{previewTemplate.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{previewTemplate.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-auto flex items-start justify-center p-6">
                <div
                  style={{
                    width: previewW,
                    height: A4_H * previewScale,
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: A4_W,
                      height: A4_H,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <PreviewComponent resume={{ ...previewData, templateId: hoverId }} />
                  </div>
                </div>
              </div>

              {/* 底部应用按钮 */}
              <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {hoverId === currentId ? '当前使用中' : `点击应用「${previewTemplate.name}」`}
                </span>
                <button
                  type="button"
                  disabled={hoverId === currentId}
                  onClick={() => { onSelect(hoverId); setOpen(false); }}
                  className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-default rounded-lg transition-colors"
                >
                  应用模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
