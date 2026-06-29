import { WorkExperience } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';
import AIPolishButton from '../form/AIPolishButton';
import AIGenerateHighlights from '../form/AIGenerateHighlights';
import MonthPicker from '../form/MonthPicker';
import SummaryLine from '../form/SummaryLine';

interface WorkExperienceFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

const emptyItem = (): WorkExperience => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  department: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [],
});

export default function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
  return (
    <DynamicList<WorkExperience>
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
      addLabel="添加工作经历"
      renderSummary={(item) => (
        <SummaryLine
          segments={[item.company || '未填写公司', item.position || '未填写职位']}
          dateRange={{ start: item.startDate, end: item.endDate }}
        />
      )}
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="公司" value={item.company} onChange={(v) => onUpdate({ ...item, company: v })} placeholder="公司名称" />
            <FormInput label="职位" value={item.position} onChange={(v) => onUpdate({ ...item, position: v })} placeholder="职位名称" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="部门" value={item.department} onChange={(v) => onUpdate({ ...item, department: v })} placeholder="所在部门" />
            <FormInput label="地点" value={item.location} onChange={(v) => onUpdate({ ...item, location: v })} placeholder="工作城市" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => onUpdate({ ...item, startDate: v })} />
            <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => onUpdate({ ...item, endDate: v })} allowPresent />
          </div>
          <FormTextArea
            label="工作亮点（每行一条）"
            value={item.highlights.join('\n')}
            onChange={(v) => onUpdate({ ...item, highlights: v.split('\n').filter(Boolean) })}
            placeholder="每行写一条工作亮点或成果"
            rows={4}
          />
          <AIGenerateHighlights
            position={item.position}
            company={item.company}
            type="work"
            onInsert={(picked) => onUpdate({ ...item, highlights: [...item.highlights, ...picked] })}
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
