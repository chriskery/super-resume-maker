import { useState } from 'react';
import { PersonalInfo } from '../../types/resume';
import FormInput from '../form/FormInput';
import PhotoUpload from '../form/PhotoUpload';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  const update = (field: keyof PersonalInfo, value: string | undefined) => {
    onChange({ ...data, [field]: value });
  };

  const validatePhone = () => {
    const val = data.phone.replace(/[-\s]/g, '');
    if (val && !/^\d{11}$/.test(val)) {
      setErrors((e) => ({ ...e, phone: '请输入11位手机号码' }));
    } else {
      setErrors((e) => ({ ...e, phone: undefined }));
    }
  };

  const validateEmail = () => {
    const val = data.email.trim();
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrors((e) => ({ ...e, email: '请输入有效的邮箱地址' }));
    } else {
      setErrors((e) => ({ ...e, email: undefined }));
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 grid grid-cols-2 gap-4">
        <FormInput label="姓名" value={data.name} onChange={(v) => update('name', v)} placeholder="请输入姓名" />
        <FormInput label="职位" value={data.title} onChange={(v) => update('title', v)} placeholder="如：前端工程师" />
        <FormInput label="电话" value={data.phone} onChange={(v) => update('phone', v)} placeholder="请输入手机号" type="tel" error={errors.phone} onBlur={validatePhone} />
        <FormInput label="邮箱" value={data.email} onChange={(v) => update('email', v)} placeholder="请输入邮箱" type="email" error={errors.email} onBlur={validateEmail} />
        <FormInput label="意向城市" value={data.city ?? ''} onChange={(v) => update('city', v)} placeholder="如：北京、上海" />
        <FormInput label="校园活动" value={data.campusActivities ?? ''} onChange={(v) => update('campusActivities', v)} placeholder="如：XX公众号（运营）、技术社区志愿者" />
      </div>
      <PhotoUpload value={data.photo} onChange={(v) => update('photo', v)} />
    </div>
  );
}
