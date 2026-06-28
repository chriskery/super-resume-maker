interface AwardsFormProps {
  data: string[];
  onChange: (data: string[]) => void;
}

export default function AwardsForm({ data, onChange }: AwardsFormProps) {
  const updateItem = (index: number, value: string) => {
    onChange(data.map((d, i) => (i === index ? value : d)));
  };

  return (
    <div className="space-y-3">
      {data.map((award, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            value={award}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`荣誉奖项 ${index + 1}`}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={() => onChange(data.filter((_, i) => i !== index))}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 flex-shrink-0"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...data, ''])}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 添加荣誉奖项
      </button>
    </div>
  );
}
