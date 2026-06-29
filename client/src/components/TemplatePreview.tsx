import React, { useEffect, useRef, useState } from 'react';
import { getTemplate } from '../templates/registry';
import { mockResume } from '../templates/mockData';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface TemplatePreviewProps {
  templateId: string;
}

function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const TemplateComponent = template.component;
  const previewData = { ...mockResume, templateId };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / A4_WIDTH_PX);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', position: 'relative', paddingBottom: `${(A4_HEIGHT_PX / A4_WIDTH_PX) * 100}%` }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: A4_WIDTH_PX, height: A4_HEIGHT_PX,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <TemplateComponent resume={previewData} />
      </div>
    </div>
  );
}

export default React.memo(TemplatePreview);
