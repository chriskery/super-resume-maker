import { Award } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import DynamicList from '../form/DynamicList';
import MonthPicker from '../form/MonthPicker';
import SummaryLine from '../form/SummaryLine';

interface AwardsFormProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

const emptyItem = (): Award => ({
  id: crypto.randomUUID(),
  title: '',
  date: '',
  description: '',
});

export default function AwardsForm({ data, onChange }: AwardsFormProps) {
  return (
    <DynamicList<Award>
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
      addLabel="添加荣誉奖项"
      renderSummary={(item) => (
        <SummaryLine
          segments={[item.title || '未填写奖项名称']}
          dateRange={item.date ? { start: item.date, end: '' } : undefined}
        />
      )}
      renderItem={(item, _index, onUpdate) => (
        <div className="space-y-3">
          <FormInput
            label="奖项 / 专利名称"
            value={item.title}
            onChange={(v) => onUpdate({ ...item, title: v })}
            placeholder="如：一种在 Kubernetes 内提交 Slurm 物理机作业的方法"
          />
          <MonthPicker
            label="获得时间"
            value={item.date}
            onChange={(v) => onUpdate({ ...item, date: v })}
            allowPresent
          />
          <FormTextArea
            label="详细描述（选填）"
            value={item.description || ''}
            onChange={(v) => onUpdate({ ...item, description: v })}
            placeholder="简要介绍该奖项 / 专利的背景、技术方案与价值"
            rows={3}
          />
        </div>
      )}
    />
  );
}
