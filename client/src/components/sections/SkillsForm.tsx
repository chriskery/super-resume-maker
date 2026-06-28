import { Skill } from '../../types/resume';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const emptySkill = (): Skill => ({ category: '', items: '' });

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const updateItem = (index: number, updated: Skill) => {
    onChange(data.map((d, i) => (i === index ? updated : d)));
  };

  return (
    <div className="space-y-4">
      {data.map((skill, index) => (
        <div key={index} className="relative border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <button
            type="button"
            onClick={() => onChange(data.filter((_, i) => i !== index))}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="pr-6 space-y-3">
            <FormInput
              label="技能类别"
              value={skill.category}
              onChange={(v) => updateItem(index, { ...skill, category: v })}
              placeholder="如：编程语言、框架工具"
            />
            <FormTextArea
              label="技能内容"
              value={skill.items}
              onChange={(v) => updateItem(index, { ...skill, items: v })}
              placeholder="描述具体技能，如：JavaScript, TypeScript, React, Vue"
              rows={2}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...data, emptySkill()])}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 添加技能分类
      </button>
    </div>
  );
}
