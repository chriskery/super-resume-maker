import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const DEFAULT_THEME = '#5281F5';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

const SectionTitle: React.FC<{ title: string; theme?: string }> = ({ title, theme = DEFAULT_THEME }) => (
  <div
    style={{
      marginBottom: '8px',
      paddingBottom: '4px',
      borderBottom: `1.5px solid ${theme}`,
    }}
  >
    <span style={{ fontSize: '15px', fontWeight: 700, color: theme, letterSpacing: '0.5px' }}>
      {title}
    </span>
  </div>
);

const Tag: React.FC<{ text: string; theme?: string }> = ({ text, theme = DEFAULT_THEME }) => (
  <span
    style={{
      fontSize: '10px',
      color: theme,
      backgroundColor: '#eff6ff',
      borderRadius: '3px',
      padding: '1px 5px',
      lineHeight: '16px',
      display: 'inline-block',
    }}
  >
    {text}
  </span>
);

const TechTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const {
    personalInfo = {} as any,
    summary = '',
    education = [],
    workExperience = [],
    projectExperience = [],
    organizationExperience = [],
    awards = [],
    others = DEFAULT_OTHERS,
    themeColor,
  } = resume;
  const skills = others?.skills || resume.skills || [];
  const THEME = themeColor || DEFAULT_THEME;
  const headerAlign = resume.headerAlignment || 'center';

  const contactItems = [
    personalInfo.phone,
    personalInfo.email,
    personalInfo.city,
    personalInfo.campusActivities,
  ].filter(Boolean);

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        overflow: 'hidden',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: 'SimSun, "宋体", serif',
        color: '#1f2937',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* ===== Header ===== */}
      <div style={{ marginBottom: '14px', textAlign: headerAlign }}>
        <h1
          style={{
            margin: 0,
            fontSize: '26px',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '1px',
          }}
        >
          {personalInfo.name || '姓名'}
        </h1>
        {contactItems.length > 0 && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '12.5px',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                <span>{item}</span>
                {i < contactItems.length - 1 && (
                  <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ===== 个人总结 ===== */}
      {summary && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="个人总结" theme={THEME} />
          <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: '1.55', textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}

      {/* ===== 教育经历 ===== */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="教育经历" theme={THEME} />
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{edu.school}</span>
                  {edu.tags && edu.tags.map((tag, ti) => <Tag key={ti} text={tag} theme={THEME} />)}
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>
                {[edu.major, edu.degree].filter(Boolean).join(' · ')}
              </div>
              {edu.highlights && edu.highlights.length > 0 && (
                <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {edu.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.5', marginBottom: '1px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== 工作经历 ===== */}
      {workExperience && workExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="工作经历" theme={THEME} />
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{exp.company}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1px' }}>
                <span style={{ fontSize: '12.5px', color: '#4b5563' }}>
                  {[exp.position, exp.department].filter(Boolean).join(' · ')}
                </span>
                {exp.location && (
                  <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{exp.location}</span>
                )}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.5', marginBottom: '1px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== 项目经历 ===== */}
      {projectExperience && projectExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="项目经历" theme={THEME} />
          {projectExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{exp.name}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              {exp.role && (
                <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '1px' }}>{exp.role}</div>
              )}
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.55', marginBottom: '1px', textAlign: 'justify' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== 社团和组织经历 ===== */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="社团和组织经历" theme={THEME} />
          {organizationExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{exp.name}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1px' }}>
                <span style={{ fontSize: '12.5px', color: '#4b5563' }}>
                  {[exp.role, exp.department].filter(Boolean).join(' · ')}
                </span>
                {exp.location && (
                  <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{exp.location}</span>
                )}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.5', marginBottom: '1px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== 荣誉奖项 ===== */}
      {awards && awards.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="专利及荣誉" theme={THEME} />
          <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
            {awards.map((award, i) => (
              <li key={award.id || i} style={{ marginBottom: award.description ? '6px' : '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                    {award.title || `奖项 ${i + 1}`}
                  </span>
                  {award.date && (
                    <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{award.date}</span>
                  )}
                </div>
                {award.description && (
                  <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px', lineHeight: 1.55, textAlign: 'justify' }}>
                    {award.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 技能 ===== */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="技能" theme={THEME} />
          <div style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.55' }}>
            {skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{skill.category}：</span>
                <span>{skill.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 其他信息 ===== */}
      {others && (
        (() => {
          const sections: { key: keyof typeof others; label: string }[] = [
            { key: 'certificates', label: '证书/执照' },
            { key: 'languages', label: '语言' },
            { key: 'hobbies', label: '兴趣爱好' },
          ];
          const hasAny = sections.some((s) => others[s.key] && others[s.key].length > 0);
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom: '12px' }}>
              <SectionTitle title="其他" theme={THEME} />
              {sections.map(({ key, label }) => {
                const items = others[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: '3px', fontSize: '12.5px', color: '#374151', lineHeight: '1.55' }}>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{label}：</span>
                    <span>{items.join('、')}</span>
                  </div>
                );
              })}
            </div>
          );
        })()
      )}
    </div>
  );
};

export default React.memo(TechTemplate);
