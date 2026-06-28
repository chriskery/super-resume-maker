import { ReactNode, useState } from 'react';

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, item: T) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number, onUpdate: (item: T) => void) => ReactNode;
  renderSummary: (item: T, index: number) => ReactNode;
  addLabel?: string;
}

export default function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  onMove,
  renderItem,
  renderSummary,
  addLabel = '添加一项',
}: DynamicListProps<T>) {
  // Track which items are expanded; newly added items auto-expand
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAdd = () => {
    setExpandedIndices((prev) => new Set(prev).add(items.length));
    onAdd();
  };

  const allExpanded = items.length > 0 && items.every((_, i) => expandedIndices.has(i));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIndices(new Set());
    } else {
      setExpandedIndices(new Set(items.map((_, i) => i)));
    }
  };

  return (
    <div className="space-y-3">
      {items.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {allExpanded ? '折叠全部' : '展开全部'}
          </button>
        </div>
      )}
      {items.map((item, index) => {
        const isExpanded = expandedIndices.has(index);
        return (
          <div
            key={index}
            className="relative border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden"
          >
            {/* Header: summary + actions */}
            <div
              className="flex items-center justify-between px-4 py-1 cursor-pointer hover:bg-gray-100/60 transition-colors"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1 min-w-0">
                {renderSummary(item, index)}
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                {onMove && index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMove(index, index - 1); }}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title="上移"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                {onMove && index < items.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMove(index, index + 1); }}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title="下移"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0.5 border-t border-gray-100">
                {renderItem(item, index, (updated) => onUpdate(index, updated))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  );
}
