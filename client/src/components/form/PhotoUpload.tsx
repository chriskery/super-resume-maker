import { useRef } from 'react';

interface PhotoUploadProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    // reset so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="block text-sm font-medium text-gray-700 self-start">头像</label>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center bg-gray-50 cursor-pointer"
      >
        {value ? (
          <img src={value} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          移除头像
        </button>
      )}
    </div>
  );
}
