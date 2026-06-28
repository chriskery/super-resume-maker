import React from 'react';
import { Resume } from '../types/resume';

const ACCENT = '#2563eb';
const GRADIENT_FROM = '#60a5fa';
const GRADIENT_TO = '#3b82f6';

// ── 居中区段标题（带左右装饰线） ──
const CenterSectionTitle: React.FC<{ title: string }> = ({ title }) => (
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
    <span style={{ fontSize: '14px', fontWeight: 700, color: ACCENT, letterSpacing: '2px', whiteSpace: 'nowrap' }}>
      {title}
    </span>
    <div style={{ flex: 1, maxWidth: '60px', height: '1px', backgroundColor: '#cbd5e1' }} />
  </div>
);

// ── 经历条目（公司/项目） ──
const ExpBlock: React.FC<{
  title: string;
  dateRange: string;
  subtitle: string;
  location: string;
  highlights: string[];
}> = ({ title, dateRange, subtitle, location, highlights }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{title}</span>
      <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{dateRange}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
      <span style={{ fontSize: '12.5px', color: '#4b5563' }}>{subtitle}</span>
      {location && <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{location}</span>}
    </div>
    {highlights && highlights.length > 0 && (
      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
        {highlights.map((h, i) => (
          <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', marginBottom: '2px' }}>
            {h}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ElegantTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo, summary, education, workExperience, projectExperience, organizationExperience, awards, skills } = resume;

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif',
        color: '#1f2937',
        fontSize: '13px',
        lineHeight: '1.5',
      }}
    >
      {/* ===== 顶部弧形背景 + 头像 ===== */}
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${GRADIENT_FROM}, ${GRADIENT_TO})`,
          padding: '40px 36px 48px',
          textAlign: 'center',
          overflow: 'visible',
        }}
      >
        {/* 底部弧形（SVG 波浪） */}
        <svg
          viewBox="0 0 1440 80"
          style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '48px', display: 'block' }}
          preserveAspectRatio="none"
        >
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
        </svg>

        {/* 头像 */}
        {personalInfo.photo && (
          <img
            src={personalInfo.photo}
            alt="avatar"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid rgba(255,255,255,0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              marginBottom: '12px',
            }}
          />
        )}

        {/* 姓名 */}
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '4px',
          }}
        >
          {personalInfo.name || '姓名'}
        </h1>

        {/* 联系方式 */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span style={{ opacity: 0.5 }}>|</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
        </div>

        {/* 职位 */}
        {personalInfo.title && (
          <div style={{ marginTop: '6px', fontSize: '14px', color: '#ffffff', fontWeight: 600, letterSpacing: '1px' }}>
            {personalInfo.title}
          </div>
        )}
      </div>

      {/* ===== 内容区 ===== */}
      <div style={{ padding: '24px 40px 32px' }}>
        {/* 个人总结 */}
        {summary && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="个人总结" />
            <p
              style={{
                margin: 0,
                fontSize: '12.5px',
                color: '#374151',
                lineHeight: '1.7',
                textAlign: 'justify',
              }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* 教育经历 */}
        {education && education.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="教育经历" />
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{edu.school}</span>
                    {edu.tags && edu.tags.map((tag, ti) => (
                      <span key={ti} style={{ fontSize: '10px', color: '#ea580c', border: '1px solid #ea580c', borderRadius: '3px', padding: '0 4px', lineHeight: '16px', display: 'inline-block' }}>{tag}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>
                  {[edu.degree, edu.major].filter(Boolean).join(' · ')}
                </div>
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                    {edu.highlights.map((h, i) => (
                      <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', marginBottom: '2px' }}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 工作经历 */}
        {workExperience && workExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="工作经历" />
            {workExperience.map((exp) => (
              <ExpBlock
                key={exp.id}
                title={exp.company}
                dateRange={`${exp.startDate} - ${exp.endDate}`}
                subtitle={[exp.position, exp.department].filter(Boolean).join(' · ')}
                location={exp.location}
                highlights={exp.highlights}
              />
            ))}
          </div>
        )}

        {/* 项目经历 */}
        {projectExperience && projectExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="项目经历" />
            {projectExperience.map((exp) => (
              <ExpBlock
                key={exp.id}
                title={exp.name}
                dateRange={`${exp.startDate} - ${exp.endDate}`}
                subtitle={exp.role}
                location={exp.location}
                highlights={exp.highlights}
              />
            ))}
          </div>
        )}

        {/* 社团和组织经历 */}
        {organizationExperience && organizationExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="社团和组织经历" />
            {organizationExperience.map((exp) => (
              <ExpBlock
                key={exp.id}
                title={exp.name}
                dateRange={`${exp.startDate} - ${exp.endDate}`}
                subtitle={[exp.role, exp.department].filter(Boolean).join(' · ')}
                location={exp.location}
                highlights={exp.highlights}
              />
            ))}
          </div>
        )}

        {/* 荣誉奖项 */}
        {awards && awards.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <CenterSectionTitle title="荣誉奖项" />
            <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
              {awards.map((award, i) => (
                <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', marginBottom: '2px' }}>
                  {award}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 技能 & 其他 — 双栏 */}
        {skills && skills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <CenterSectionTitle title="其他" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: skills.length > 2 ? '1fr 1fr' : '1fr',
                gap: '4px 32px',
                fontSize: '12.5px',
                color: '#374151',
                lineHeight: '1.7',
              }}
            >
              {skills.map((skill, i) => (
                <div key={i} style={{ marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{skill.category}：</span>
                  <span>{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElegantTemplate;
