import React from 'react';
import type { TemplateConfig } from '../types';
import type { PersonalInfo } from '../../../types/resume';

interface HeaderSectionProps {
  personalInfo: PersonalInfo;
  config: TemplateConfig;
}

/* ── SVG contact icons ── */
const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const MapPinIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function contactIcon(field: string): React.ReactNode {
  if (field === 'phone') return PhoneIcon;
  if (field === 'email') return MailIcon;
  if (field === 'city') return MapPinIcon;
  return null;
}

/* ── Alignment helper ── */
function alignmentToJustify(alignment: string): string {
  if (alignment === 'left') return 'flex-start';
  if (alignment === 'right') return 'flex-end';
  return 'center';
}

/* ── Contact item helper ── */
function renderContactItem(
  value: string,
  field: string,
  config: TemplateConfig,
  textColor: string,
): React.ReactNode {
  return (
    <span key={field} style={{ color: textColor, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {config.header.showIcons && contactIcon(field)}
      <span>{value}</span>
    </span>
  );
}

/* ── Separator ── */
function renderSeparator(config: TemplateConfig, color: string): React.ReactNode {
  return (
    <span key={`sep-${Math.random()}`} style={{ color, userSelect: 'none' }}>
      {config.header.separator}
    </span>
  );
}

/* ══════════════════════════════════════════
   Mode 1: Standard top
   ══════════════════════════════════════════ */
const TopHeader: React.FC<HeaderSectionProps> = ({ personalInfo, config }) => {
  const showPhoto = config.header.showPhoto && !!personalInfo.photo && config.header.photoPosition === 'top-right';
  const jobColor = config.header.jobTitleColor || config.palette.primary;
  const sepColor = '#d1d5db';

  const contactFields: { key: 'phone' | 'email' | 'city'; value: string }[] = [
    { key: 'phone' as const, value: personalInfo.phone },
    { key: 'email' as const, value: personalInfo.email },
    { key: 'city' as const, value: personalInfo.city || '' },
  ].filter(f => f.value);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '10px',
      }}
    >
      <div style={{ flex: 1, textAlign: config.header.alignment }}>
        <h1
          style={{
            margin: 0,
            fontSize: config.typography.nameSize,
            fontWeight: 800,
            color: config.palette.text,
            letterSpacing: '2px',
          }}
        >
          {personalInfo.name || '姓名'}
        </h1>

        {/* Contact row */}
        {contactFields.length > 0 && (
          <div
            style={{
              marginTop: '6px',
              fontSize: config.typography.bodySize,
              color: config.palette.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: alignmentToJustify(config.header.alignment),
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {contactFields.map((f, i) => (
              <React.Fragment key={f.key}>
                {i > 0 && renderSeparator(config, sepColor)}
                {renderContactItem(f.value, f.key, config, config.palette.textSecondary)}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Job title */}
        {config.header.showJobTitle && personalInfo.title && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '14px',
              color: jobColor,
              fontWeight: 600,
            }}
          >
            {personalInfo.title}
          </div>
        )}
      </div>

      {showPhoto && (
        <img
          src={personalInfo.photo}
          alt="avatar"
          style={{
            width: config.header.photoSize,
            height: config.header.photoSize,
            borderRadius: config.header.photoBorderRadius,
            objectFit: 'cover',
            flexShrink: 0,
            border: config.header.photoBorderColor
              ? `2px solid ${config.header.photoBorderColor}`
              : `2px solid ${config.palette.primary}`,
          }}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   Mode 2: header-center (Elegant gradient)
   ══════════════════════════════════════════ */
const CenterHeader: React.FC<HeaderSectionProps> = ({ personalInfo, config }) => {
  const gradient = config.gradient;
  const from = gradient?.from || '#60a5fa';
  const to = gradient?.to || '#3b82f6';
  const showPhoto = config.header.showPhoto && !!personalInfo.photo;

  const contactFields: { key: 'phone' | 'email' | 'city'; value: string }[] = [
    { key: 'phone' as const, value: personalInfo.phone },
    { key: 'email' as const, value: personalInfo.email },
    { key: 'city' as const, value: personalInfo.city || '' },
  ].filter(f => f.value);

  // Negative margins compensate for A4 container padding so gradient fills edge-to-edge
  return (
    <div
      style={{
        position: 'relative',
        marginTop: '-24px',
        marginLeft: '-40px',
        marginRight: '-40px',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        // Bottom curve via clipPath: ellipse that clips the bottom corners
        clipPath: 'ellipse(120% 100% at 50% 0%)',
        paddingBottom: '32px',
        textAlign: config.header.alignment,
      }}
    >
      {/* Photo centered at top of gradient */}
      {showPhoto && (
        <div style={{ textAlign: 'center', paddingTop: '28px' }}>
          <img
            src={personalInfo.photo}
            alt="avatar"
            style={{
              width: config.header.photoSize,
              height: config.header.photoSize,
              borderRadius: config.header.photoBorderRadius,
              objectFit: 'cover',
              border: '4px solid rgba(255,255,255,0.85)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      )}

      {/* Name */}
      <h1
        style={{
          margin: showPhoto ? '10px 0 0' : '32px 0 0',
          fontSize: config.typography.nameSize,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '4px',
        }}
      >
        {personalInfo.name || '姓名'}
      </h1>

      {/* Contact row */}
      {contactFields.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            fontSize: config.typography.bodySize,
            color: 'rgba(255,255,255,0.9)',
            display: 'flex',
            justifyContent: alignmentToJustify(config.header.alignment),
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {contactFields.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 && <span style={{ opacity: 0.5 }}>{config.header.separator}</span>}
              <span>{f.value}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {config.header.showJobTitle && personalInfo.title && (
        <div style={{ marginTop: '6px', fontSize: '14px', color: '#ffffff', fontWeight: 600, letterSpacing: '1px' }}>
          {personalInfo.title}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   Mode 3: sidebar (Modern)
   ══════════════════════════════════════════ */
const SidebarHeader: React.FC<HeaderSectionProps> = ({ personalInfo, config }) => {
  const showPhoto = config.header.showPhoto && !!personalInfo.photo;
  const jobColor = config.header.jobTitleColor || config.palette.primary;
  const sideTextColor = config.layout.sidebarTextColor || '#f1f5f9';
  const accent = config.palette.primary;

  const contactFields: { key: 'phone' | 'email' | 'city'; value: string }[] = [
    { key: 'phone' as const, value: personalInfo.phone },
    { key: 'email' as const, value: personalInfo.email },
    { key: 'city' as const, value: personalInfo.city || '' },
  ].filter(f => f.value);

  return (
    <div style={{ textAlign: config.header.alignment }}>
      {showPhoto && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src={personalInfo.photo}
            alt="avatar"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.3)',
            }}
          />
        </div>
      )}

      <h1
        style={{
          margin: 0,
          fontSize: '22px',
          fontWeight: 800,
          color: '#ffffff',
          textAlign: config.header.alignment,
          letterSpacing: '2px',
        }}
      >
        {personalInfo.name || '姓名'}
      </h1>

      {config.header.showJobTitle && personalInfo.title && (
        <div style={{ textAlign: config.header.alignment, marginTop: '4px', fontSize: '12px', color: accent, fontWeight: 600 }}>
          {personalInfo.title}
        </div>
      )}

      {/* Contact - vertical */}
      <div style={{ marginTop: '24px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: accent,
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            paddingBottom: '4px',
          }}
        >
          联系方式
        </div>
        {contactFields.map(f => (
          <div key={f.key} style={{ fontSize: '12px', marginBottom: '6px', color: sideTextColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {config.header.showIcons && contactIcon(f.key)}
            <span style={{ wordBreak: f.key === 'email' ? 'break-all' : undefined }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   Main HeaderSection
   ══════════════════════════════════════════ */
const HeaderSection: React.FC<HeaderSectionProps> = ({ personalInfo, config }) => {
  switch (config.header.photoPosition) {
    case 'header-center':
      return <CenterHeader personalInfo={personalInfo} config={config} />;
    case 'sidebar':
      return <SidebarHeader personalInfo={personalInfo} config={config} />;
    case 'top-right':
    case 'none':
    default:
      return <TopHeader personalInfo={personalInfo} config={config} />;
  }
};

export default React.memo(HeaderSection);
