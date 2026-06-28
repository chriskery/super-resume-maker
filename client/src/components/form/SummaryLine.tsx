import { ReactNode } from 'react';

export interface Segment {
  text: string;
  fallback?: string;
  bold?: boolean;
}

interface SummaryLineProps {
  segments: (string | Segment)[];
  dateRange?: { start: string; end: string };
}

function normalizeSegment(seg: string | Segment, index: number): { text: string; bold: boolean } {
  if (typeof seg === 'string') {
    return { text: seg, bold: index === 0 };
  }
  return { text: seg.text, bold: seg.bold ?? index === 0 };
}

/**
 * 统一的摘要行组件，用于 DynamicList 的 renderSummary。
 * segments: 用 '·' 分隔的文本段（第一个默认加粗）
 * dateRange: 可选的时间范围，用 '|' 与前面分隔
 */
export default function SummaryLine({ segments, dateRange }: SummaryLineProps): ReactNode {
  return (
    <div className="flex items-center gap-2 text-sm">
      {segments.map((seg, i) => {
        const { text, bold } = normalizeSegment(seg, i);
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-400">·</span>}
            <span className={text ? (bold ? 'font-medium text-gray-700' : 'text-gray-700') : 'text-gray-400'}>
              {text}
            </span>
          </span>
        );
      })}
      {dateRange && (
        <>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700">
            {dateRange.start || '开始时间'} - {dateRange.end || '至今'}
          </span>
        </>
      )}
    </div>
  );
}
