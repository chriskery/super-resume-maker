import { ProjectExperience } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';

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
      addLabel="添加项目经历"
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="项目名称" value={item.name} onChange={(v) => onUpdate({ ...item, name: v })} placeholder="项目名称" />
            <FormInput label="角色" value={item.role} onChange={(v) => onUpdate({ ...item, role: v })} placeholder="担任角色" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormInput label="地点" value={item.location} onChange={(v) => onUpdate({ ...item, location: v })} placeholder="项目地点" />
            <FormInput label="开始时间" value={item.startDate} onChange={(v) => onUpdate({ ...item, startDate: v })} placeholder="如 2023-01" />
            <FormInput label="结束时间" value={item.endDate} onChange={(v) => onUpdate({ ...item, endDate: v })} placeholder="如 2023-12" />
          </div>
          <FormTextArea
            label="项目亮点（每行一条）"
            value={item.highlights.join('\n')}
            onChange={(v) => onUpdate({ ...item, highlights: v.split('\n').filter(Boolean) })}
            placeholder="每行写一条项目亮点或成果"
            rows={4}
          />
        </div>
      )}
    />
  );
}
