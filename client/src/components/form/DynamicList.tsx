import { ReactNode } from 'react';

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, item: T) => void;
  renderItem: (item: T, index: number, onUpdate: (item: T) => void) => ReactNode;
  addLabel?: string;
}

export default function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  renderItem,
  addLabel = '添加一项',
}: DynamicListProps<T>) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="relative border border-gray-200 rounded-lg p-4 bg-gray-50/50"
        >
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="pr-6">
            {renderItem(item, index, (updated) => onUpdate(index, updated))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  );
}
