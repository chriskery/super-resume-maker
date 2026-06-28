import { ProjectExperience } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';
import AIPolishButton from '../form/AIPolishButton';
import MonthPicker from '../form/MonthPicker';

interface ProjectExperienceFormProps {
  data: ProjectExperience[];
  onChange: (data: ProjectExperience[]) => void;
}

const emptyItem = (): ProjectExperience => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [],
});

export default function ProjectExperienceForm({ data, onChange }: ProjectExperienceFormProps) {
  return (
    <DynamicList<ProjectExperience>
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
      addLabel="添加项目经历"
      renderSummary={(item) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">{item.name || '未填写项目名'}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-700">{item.role || '未填写角色'}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700">{item.startDate || '开始时间'} - {item.endDate || '至今'}</span>
        </div>
      )}
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="项目名称" value={item.name} onChange={(v) => onUpdate({ ...item, name: v })} placeholder="项目名称" />
            <FormInput label="角色" value={item.role} onChange={(v) => onUpdate({ ...item, role: v })} placeholder="担任角色" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormInput label="地点" value={item.location} onChange={(v) => onUpdate({ ...item, location: v })} placeholder="项目地点" />
            <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => onUpdate({ ...item, startDate: v })} />
            <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => onUpdate({ ...item, endDate: v })} allowPresent />
          </div>
          <FormTextArea
            label="项目亮点（每行一条）"
            value={item.highlights.join('\n')}
            onChange={(v) => onUpdate({ ...item, highlights: v.split('\n').filter(Boolean) })}
            placeholder="每行写一条项目亮点或成果"
            rows={4}
          />
          <AIPolishButton
            text={item.highlights.join('\n')}
            type="highlight"
            onAccept={(newText) => onUpdate({ ...item, highlights: newText.split('\n').filter(Boolean) })}
          />
        </div>
      )}
    />
  );
}
