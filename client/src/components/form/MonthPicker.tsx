import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MonthPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowPresent?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - 20 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function MonthPicker({ label, value, onChange, allowPresent = false }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isPresent = value === '至今';
  const parsed = !isPresent && value ? value.split('-') : [];
  const selYear = parsed.length >= 2 ? parsed[0] : '';
  const selMonth = parsed.length >= 2 ? parsed[1] : '';

  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && popupRef.current && !popupRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayText = isPresent ? '至今' : (selYear && selMonth ? `${selYear}年${parseInt(selMonth)}月` : '请选择');

  const selectYear = (year: string) => {
    onChange(`${year}-${selMonth || '01'}`);
  };

  const selectMonth = (month: string) => {
    onChange(`${selYear || currentYear}-${month}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-left transition-colors ${
          open ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'
        } ${isPresent ? 'text-blue-600 font-medium' : value ? 'text-gray-800' : 'text-gray-400'}`}
      >
        {displayText}
      </button>
      {open && createPortal(
        <div
          ref={popupRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[240px] max-h-[360px] overflow-y-auto"
          style={(() => {
            const btn = ref.current?.querySelector('button');
            if (!btn) return { top: 0, left: 0 };
            const rect = btn.getBoundingClientRect();
            return { top: rect.bottom + 4, left: rect.left };
          })()}
        >
          {allowPresent && (
            <button
              type="button"
              onClick={() => { onChange(isPresent ? '' : '至今'); setOpen(false); }}
              className={`w-full mb-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                isPresent ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              至今
            </button>
          )}
          <div className="mb-2">
            <div className="text-xs text-gray-400 mb-1">年份</div>
            <div className="grid grid-cols-5 gap-1 max-h-[120px] overflow-y-auto">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => selectYear(String(y))}
                  className={`px-1 py-1 text-xs rounded transition-colors ${
                    selYear === String(y) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">月份</div>
            <div className="grid grid-cols-4 gap-1">
              {months.map((m) => {
                const mv = String(m).padStart(2, '0');
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMonth(mv)}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      selMonth === mv ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {m}月
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
