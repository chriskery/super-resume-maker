import React from 'react';
import { Resume, OtherInfo } from '../types/resume';
import SectionTitle from './components/SectionTitle';
import ExperienceItem from './components/ExperienceItem';

const DEFAULT_THEME = '#5281F5';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

// 简单的 SVG 图标
const icons = {
  education: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  summary: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  work: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  project: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  org: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  award: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  skill: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
};

const ProfessionalTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo = {} as any, summary = '', education = [], workExperience = [], projectExperience = [], organizationExperience = [], awards = [], others = DEFAULT_OTHERS, themeColor } = resume;
  const skills = others?.skills || resume.skills || [];
  const THEME = themeColor || DEFAULT_THEME;
  const headerAlign = resume.headerAlignment || 'center';

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
      {/* ===== 顶部 Header ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '10px',
        }}
      >
        {/* 左侧信息 */}
        <div style={{ flex: 1, textAlign: headerAlign }}>
          <h1
            style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '2px',
            }}
          >
            {personalInfo.name || '姓名'}
          </h1>
          <div
            style={{
              marginTop: '6px',
              fontSize: '13px',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.email && (
              <span style={{ color: '#d1d5db' }}>|</span>
            )}
            {personalInfo.email && <span>{personalInfo.email}</span>}
          </div>
          {personalInfo.title && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '14px',
                color: THEME,
                fontWeight: 600,
              }}
            >
              {personalInfo.title}
            </div>
          )}
          {personalInfo.city && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              意向城市：{personalInfo.city}
            </div>
          )}
          {personalInfo.campusActivities && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              校园活动：{personalInfo.campusActivities}
            </div>
          )}
        </div>
        {/* 右上角头像 */}
        {personalInfo.photo && (
          <img
            src={personalInfo.photo}
            alt="avatar"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              border: `2px solid ${THEME}`,
            }}
          />
        )}
      </div>

      {/* ===== 个人总结 ===== */}
      {summary && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="个人总结" icon={icons.summary} color={THEME} />
          <p
            style={{
              margin: 0,
              fontSize: '12.5px',
              color: '#374151',
              lineHeight: '1.55',
              textAlign: 'justify',
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {/* ===== 教育经历 ===== */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="教育经历" icon={icons.education} color={THEME} />
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{edu.school}</span>
                  {edu.tags && edu.tags.map((tag, ti) => (
                    <span key={ti} style={{ fontSize: '10px', color: THEME, backgroundColor: `${THEME}18`, borderRadius: '3px', padding: '0 5px', lineHeight: '16px', display: 'inline-block', marginLeft: '4px' }}>{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{edu.startDate} - {edu.endDate}</span>
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
          <SectionTitle title="工作经历" icon={icons.work} color={THEME} />
          {workExperience.map((exp) => (
            <ExperienceItem
              key={exp.id}
              title={exp.company}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={[exp.position, exp.department].filter(Boolean).join(' · ')}
              location={exp.location}
              highlights={exp.highlights}
              color="#111827"
            />
          ))}
        </div>
      )}

      {/* ===== 项目经历 ===== */}
      {projectExperience && projectExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="项目经历" icon={icons.project} color={THEME} />
          {projectExperience.map((exp) => (
            <ExperienceItem
              key={exp.id}
              title={exp.name}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={exp.role}
              location={exp.location}
              highlights={exp.highlights}
              color="#111827"
            />
          ))}
        </div>
      )}

      {/* ===== 社团和组织经历 ===== */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="社团和组织经历" icon={icons.org} color={THEME} />
          {organizationExperience.map((exp) => (
            <ExperienceItem
              key={exp.id}
              title={exp.name}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={[exp.role, exp.department].filter(Boolean).join(' · ')}
              location={exp.location}
              highlights={exp.highlights}
              color="#111827"
            />
          ))}
        </div>
      )}

      {/* ===== 荣誉奖项 ===== */}
      {awards && awards.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="荣誉奖项" icon={icons.award} color={THEME} />
          <ul
            style={{
              margin: 0,
              paddingLeft: '16px',
              listStyleType: 'disc',
            }}
          >
            {awards.map((award, i) => (
              <li
                key={award.id || i}
                style={{
                  fontSize: '12.5px',
                  color: '#374151',
                  lineHeight: '1.55',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {award.title || `奖项 ${i + 1}`}
                  {award.date && <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>{award.date}</span>}
                </span>
                {award.description && (
                  <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px', lineHeight: 1.6 }}>
                    {award.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 其他（技能） ===== */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="技能" icon={icons.skill} color={THEME} />
          <div style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.55' }}>
            {skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>
                  {skill.category}：
                </span>
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
          const hasAny = sections.some(s => others[s.key] && others[s.key].length > 0);
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom: '12px' }}>
              <SectionTitle title="其他" icon={icons.skill} color={THEME} />
              {sections.map(({ key, label }) => {
                const items = others[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: '4px', fontSize: '12.5px', color: '#374151', lineHeight: '1.55' }}>
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

export default React.memo(ProfessionalTemplate);
