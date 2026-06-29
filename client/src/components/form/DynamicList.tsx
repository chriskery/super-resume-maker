import { ReactNode, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, item: T) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  onReorder?: (items: T[]) => void;
  renderItem: (item: T, index: number, onUpdate: (item: T) => void) => ReactNode;
  renderSummary: (item: T, index: number) => ReactNode;
  addLabel?: string;
}

/* ── Drag handle (six-dot grip icon) ── */
function DragHandle({ attributes, listeners }: { attributes: any; listeners: any }) {
  return (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 touch-none"
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </button>
  );
}

/* ── Sortable wrapper for each list item ── */
function SortableItem<T>({
  id,
  index,
  item,
  total,
  isExpanded,
  onToggle,
  onRemove,
  onMove,
  onUpdate,
  renderItem,
  renderSummary,
}: {
  id: string;
  index: number;
  item: T;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMove?: (from: number, to: number) => void;
  onUpdate: (item: T) => void;
  renderItem: DynamicListProps<T>['renderItem'];
  renderSummary: DynamicListProps<T>['renderSummary'];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden ${
        isDragging ? 'shadow-lg ring-2 ring-blue-300 opacity-90' : ''
      }`}
    >
      {/* Header: summary + actions */}
      <div
        className="flex items-center justify-between px-4 py-1 cursor-pointer hover:bg-gray-100/60 transition-colors"
        onClick={onToggle}
      >
        {/* Drag handle – only visible when collapsed and there are multiple items */}
        {!isExpanded && total > 1 && (
          <DragHandle attributes={attributes} listeners={listeners} />
        )}
        {/* Spacer when expanded or single item so layout stays consistent */}
        {(isExpanded || total <= 1) && <div className="w-6 flex-shrink-0" />}

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
          {onMove && index < total - 1 && (
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
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
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
          {renderItem(item, index, onUpdate)}
        </div>
      )}
    </div>
  );
}

export default function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  onUpdate,
  onMove,
  onReorder,
  renderItem,
  renderSummary,
  addLabel = '添加一项',
}: DynamicListProps<T>) {
  // Track which items are expanded; newly added items auto-expand
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Stable ids for dnd-kit (regenerate only when length changes)
  const itemIds = items.map((_, i) => `item-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    if (onReorder) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      onReorder(reordered);
    } else if (onMove) {
      onMove(oldIndex, newIndex);
    }

    // Remap expanded state to follow items
    setExpandedIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx === oldIndex) next.add(newIndex);
        else if (oldIndex < newIndex && idx > oldIndex && idx <= newIndex) next.add(idx - 1);
        else if (oldIndex > newIndex && idx >= newIndex && idx < oldIndex) next.add(idx + 1);
        else next.add(idx);
      });
      return next;
    });
  };

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

  const canDrag = items.length > 1;

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableItem
              key={itemIds[index]}
              id={itemIds[index]}
              index={index}
              item={item}
              total={items.length}
              isExpanded={expandedIndices.has(index)}
              onToggle={() => toggleExpand(index)}
              onRemove={() => onRemove(index)}
              onMove={canDrag && onMove ? (from: number, to: number) => onMove(from, to) : undefined}
              onUpdate={(updated) => onUpdate(index, updated)}
              renderItem={renderItem}
              renderSummary={renderSummary}
            />
          ))}
        </SortableContext>
      </DndContext>
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
