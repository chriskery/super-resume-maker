import { OrganizationExperience } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';

interface OrganizationFormProps {
  data: OrganizationExperience[];
  onChange: (data: OrganizationExperience[]) => void;
}

const emptyItem = (): OrganizationExperience => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  department: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [],
});

export default function OrganizationForm({ data, onChange }: OrganizationFormProps) {
  return (
    <DynamicList<OrganizationExperience>
      items={data}
      onAdd={() => onChange([...data, emptyItem()])}
      onRemove={(i) => onChange(data.filter((_, idx) => idx !== i))}
      onUpdate={(i, item) => onChange(data.map((d, idx) => (idx === i ? item : d)))}
      addLabel="添加社团/组织经历"
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="组织名称" value={item.name} onChange={(v) => onUpdate({ ...item, name: v })} placeholder="组织/社团名称" />
            <FormInput label="角色" value={item.role} onChange={(v) => onUpdate({ ...item, role: v })} placeholder="担任角色" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="部门" value={item.department} onChange={(v) => onUpdate({ ...item, department: v })} placeholder="所在部门" />
            <FormInput label="地点" value={item.location} onChange={(v) => onUpdate({ ...item, location: v })} placeholder="地点" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="开始时间" value={item.startDate} onChange={(v) => onUpdate({ ...item, startDate: v })} placeholder="如 2021-09" />
            <FormInput label="结束时间" value={item.endDate} onChange={(v) => onUpdate({ ...item, endDate: v })} placeholder="如 2023-06" />
          </div>
          <FormTextArea
            label="经历亮点（每行一条）"
            value={item.highlights.join('\n')}
            onChange={(v) => onUpdate({ ...item, highlights: v.split('\n').filter(Boolean) })}
            placeholder="每行写一条亮点或成果"
            rows={4}
          />
        </div>
      )}
    />
  );
}
