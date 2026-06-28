import { useState } from 'react';
import { Education } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';
import MonthPicker from '../form/MonthPicker';
import SummaryLine from '../form/SummaryLine';

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const PRESET_TAGS = ['985', '211', '双一流', 'C9'];

const emptyItem = (): Education => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  highlights: [],
  tags: [],
});

function TagSelector({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [customInput, setCustomInput] = useState('');

  const togglePreset = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter((t) => t !== tag));
    } else {
      onChange([...tags, tag]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setCustomInput('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">学校标签</label>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {PRESET_TAGS.map((tag) => {
          const active = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => togglePreset(tag)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                active
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 rounded-full">
              {tag}
              <button type="button" onClick={() => removeTag(i)} className="text-orange-400 hover:text-red-500 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="自定义标签，回车添加"
          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="px-2.5 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg transition-colors"
        >
          添加
        </button>
      </div>
    </div>
  );
}

export default function EducationForm({ data, onChange }: EducationFormProps) {
  return (
    <DynamicList<Education>
      items={data}
      onAdd={() => onChange([...data, emptyItem()])}
      onRemove={(i) => onChange(data.filter((_, idx) => idx !== i))}
      onUpdate={(i, item) => onChange(data.map((d, idx) => (idx === i ? item : d)))}
      onMove={(from, to) => {
        const arr = [...data];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        onChange(arr);
      }}
      addLabel="添加教育经历"
      renderSummary={(item) => (
        <SummaryLine
          segments={[
            item.school || '未填写学校',
            item.degree || '未填写学历',
            item.major || '未填写专业',
          ]}
          dateRange={{ start: item.startDate, end: item.endDate }}
        />
      )}
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="学校" value={item.school} onChange={(v) => onUpdate({ ...item, school: v })} placeholder="学校名称" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">学历</label>
              <select
                value={item.degree}
                onChange={(e) => onUpdate({ ...item, degree: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-gray-800"
              >
                <option value="">请选择学历</option>
                <option value="高中">高中</option>
                <option value="中专">中专</option>
                <option value="大专">大专</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
          </div>
          <FormInput label="专业" value={item.major} onChange={(v) => onUpdate({ ...item, major: v })} placeholder="所学专业" />
          <TagSelector tags={item.tags} onChange={(tags) => onUpdate({ ...item, tags })} />
          <div className="grid grid-cols-2 gap-3">
            <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => onUpdate({ ...item, startDate: v })} />
            <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => onUpdate({ ...item, endDate: v })} allowPresent />
          </div>
          <FormTextArea
            label="在校成就（每行一条，选填）"
            value={item.highlights.join('\n')}
            onChange={(v) => onUpdate({ ...item, highlights: v.split('\n').filter(Boolean) })}
            placeholder="如：GPA 3.8/4.0，获得优秀毕业生称号"
            rows={3}
          />
        </div>
      )}
    />
  );
}
