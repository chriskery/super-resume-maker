import { PersonalInfo } from '../../types/resume';
import FormInput from '../form/FormInput';
import PhotoUpload from '../form/PhotoUpload';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const update = (field: keyof PersonalInfo, value: string | undefined) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 grid grid-cols-2 gap-4">
        <FormInput label="姓名" value={data.name} onChange={(v) => update('name', v)} placeholder="请输入姓名" />
        <FormInput label="职位" value={data.title} onChange={(v) => update('title', v)} placeholder="如：前端工程师" />
        <FormInput label="电话" value={data.phone} onChange={(v) => update('phone', v)} placeholder="请输入手机号" />
        <FormInput label="邮箱" value={data.email} onChange={(v) => update('email', v)} placeholder="请输入邮箱" />
      </div>
      <PhotoUpload value={data.photo} onChange={(v) => update('photo', v)} />
    </div>
  );
}
