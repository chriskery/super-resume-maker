import React from 'react';
import type { TemplateConfig } from '../types';

interface SectionTitleProps {
  title: string;
  config: TemplateConfig;
  sectionKey?: string;
}

/** SVG icons for icon-circle style, keyed by sectionKey */
const sectionIcons: Record<string, React.ReactNode> = {
  summary: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  education: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  workExperience: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  projectExperience: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  organizationExperience: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  awards: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  skills: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  others: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

function renderIconCircle(
  title: string,
  config: TemplateConfig,
  sectionKey?: string,
): React.ReactNode {
  const primary = config.palette.primary;
  const icon = sectionKey ? sectionIcons[sectionKey] : null;
  return (
    <div style={{ marginBottom: '8px', borderBottom: '1.5px solid #e5e7eb', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: `${primary}18`,
              color: primary,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: config.sectionTitle.fontSize,
            fontWeight: config.sectionTitle.fontWeight,
            color: primary,
            letterSpacing: config.sectionTitle.letterSpacing || '1px',
            textTransform: config.sectionTitle.textTransform || 'none',
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

function renderUnderline(title: string, config: TemplateConfig): React.ReactNode {
  const primary = config.palette.primary;
  const bw = config.sectionTitle.borderWidth || '1.5px';
  return (
    <div
      style={{
        fontSize: config.sectionTitle.fontSize,
        fontWeight: config.sectionTitle.fontWeight,
        color: primary,
        borderBottom: `${bw} solid ${primary}`,
        paddingBottom: '4px',
        marginBottom: '10px',
        textTransform: config.sectionTitle.textTransform || 'none',
        letterSpacing: config.sectionTitle.letterSpacing || '1px',
      }}
    >
      {title}
    </div>
  );
}

function renderCenterLine(title: string, config: TemplateConfig): React.ReactNode {
  const primary = config.palette.primary;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '10px',
      }}
    >
      <div style={{ flex: 1, maxWidth: '60px', height: '1px', backgroundColor: '#cbd5e1' }} />
      <span
        style={{
          fontSize: config.sectionTitle.fontSize,
          fontWeight: config.sectionTitle.fontWeight,
          color: primary,
          letterSpacing: config.sectionTitle.letterSpacing || '2px',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
      <div style={{ flex: 1, maxWidth: '60px', height: '1px', backgroundColor: '#cbd5e1' }} />
    </div>
  );
}

function renderLeftDot(title: string, config: TemplateConfig): React.ReactNode {
  const primary = config.palette.primary;
  return (
    <div style={{ marginBottom: '8px', borderBottom: '1.5px solid #e5e7eb', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: primary,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: config.sectionTitle.fontSize,
            fontWeight: config.sectionTitle.fontWeight,
            color: primary,
            letterSpacing: config.sectionTitle.letterSpacing || '1px',
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

function renderLeftBar(title: string, config: TemplateConfig): React.ReactNode {
  const primary = config.palette.primary;
  const bw = config.sectionTitle.borderWidth || '4px';
  const bg = config.sectionTitle.bgColor || `${primary}14`;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '14px',
        marginBottom: '8px',
        backgroundColor: bg,
        borderLeft: `${bw} solid ${primary}`,
        paddingLeft: '8px',
        paddingTop: '4px',
        paddingBottom: '4px',
      }}
    >
      <span
        style={{
          color: primary,
          fontWeight: config.sectionTitle.fontWeight,
          fontSize: config.sectionTitle.fontSize,
          letterSpacing: config.sectionTitle.letterSpacing,
        }}
      >
        {title}
      </span>
    </div>
  );
}

function renderPlain(title: string, config: TemplateConfig): React.ReactNode {
  const primary = config.palette.primary;
  return (
    <div
      style={{
        fontSize: config.sectionTitle.fontSize,
        fontWeight: config.sectionTitle.fontWeight,
        color: primary,
        marginBottom: '10px',
        letterSpacing: config.sectionTitle.letterSpacing,
        textTransform: config.sectionTitle.textTransform || 'none',
      }}
    >
      {title}
    </div>
  );
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, config, sectionKey }) => {
  switch (config.sectionTitle.style) {
    case 'icon-circle':
      return <>{renderIconCircle(title, config, sectionKey)}</>;
    case 'underline':
      return <>{renderUnderline(title, config)}</>;
    case 'center-line':
      return <>{renderCenterLine(title, config)}</>;
    case 'left-dot':
      return <>{renderLeftDot(title, config)}</>;
    case 'left-bar':
      return <>{renderLeftBar(title, config)}</>;
    case 'plain':
    default:
      return <>{renderPlain(title, config)}</>;
  }
};

export default React.memo(SectionTitle);
