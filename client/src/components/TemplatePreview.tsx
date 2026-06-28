import { getTemplate } from '../templates/registry';
import { mockResume } from '../templates/mockData';

const ZOOM = 0.3;

interface TemplatePreviewProps {
  templateId: string;
}

export default function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const TemplateComponent = template.component;
  const previewData = { ...mockResume, templateId };

  return (
    <div
      style={{
        zoom: ZOOM,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <TemplateComponent resume={previewData} />
    </div>
  );
}
