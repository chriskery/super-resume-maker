import { useNavigate } from 'react-router-dom';
import { Resume } from '../types/resume';

const templateNameMap: Record<string, string> = {
  professional: '专业模板',
  minimal: '简约模板',
  modern: '现代模板',
  tech: '技术模板',
  business: '商务模板',
};

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
}

export default function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900 truncate mb-1">{resume.title}</h3>
        <p className="text-sm text-blue-600 mb-2">{templateNameMap[resume.templateId] || resume.templateId}</p>
        <p className="text-xs text-gray-400">更新于 {formatDate(resume.updatedAt)}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/editor/${resume.id}`)}
          className="flex-1 text-sm text-blue-600 hover:bg-blue-50 py-1.5 rounded transition-colors"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(resume.id)}
          className="flex-1 text-sm text-red-500 hover:bg-red-50 py-1.5 rounded transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
}
