import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const DEFAULT_ACCENT = '#ea580c';
const DEFAULT_ACCENT_LIGHT = '#fb923c';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

// ── 区段标题（左侧圆点 + 文字 + 底部分隔线） ──
const SectionTitle: React.FC<{ title: string; accent?: string }> = ({ title, accent = DEFAULT_ACCENT }) => (
  <div style={{ marginBottom: '8px', borderBottom: '1.5px solid #e5e7eb', paddingBottom: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: accent,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: '14px', fontWeight: 700, color: accent, letterSpacing: '1px' }}>{title}</span>
    </div>
  </div>
);

// ── 经历条目 ──
const ExpBlock: React.FC<{
  title: string;
  dateRange: string;
  subtitle: string;
  location: string;
  highlights: string[];
  accent?: string;
}> = ({ title, dateRange, subtitle, location, highlights, accent = '#111827' }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontWeight: 700, fontSize: '13px', color: accent }}>{title}</span>
      <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{dateRange}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
      <span style={{ fontSize: '12.5px', color: '#4b5563' }}>{subtitle}</span>
      {location && (
        <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{location}</span>
      )}
    </div>
    {highlights && highlights.length > 0 && (
      <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
        {highlights.map((h, i) => (
          <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.5', marginBottom: '1px' }}>
            {h}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ClassicTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo = {} as any, summary = '', education = [], workExperience = [], projectExperience = [], organizationExperience = [], awards = [], others = DEFAULT_OTHERS, themeColor } = resume;
  const skills = others?.skills || resume.skills || [];
  const ACCENT = themeColor || DEFAULT_ACCENT;
  const ACCENT_LIGHT = themeColor || DEFAULT_ACCENT_LIGHT;
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
      {/* ===== 顶部：左侧姓名信息 + 右上角方形头像 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        {/* 左侧 */}
        <div style={{ flex: 1, textAlign: headerAlign }}>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
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
            {personalInfo.phone && personalInfo.email && <span style={{ color: '#d1d5db' }}>|</span>}
            {personalInfo.email && <span>{personalInfo.email}</span>}
          </div>
          {personalInfo.title && (
            <div style={{ marginTop: '4px', fontSize: '14px', color: ACCENT, fontWeight: 600 }}>
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

        {/* 右上角方形圆角头像 */}
        {personalInfo.photo && (
          <img
            src={personalInfo.photo}
            alt="avatar"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              objectFit: 'cover',
              flexShrink: 0,
              marginLeft: '20px',
              border: `2px solid ${ACCENT_LIGHT}`,
            }}
          />
        )}
      </div>

      {/* ===== 个人总结 ===== */}
      {summary && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="个人总结" accent={ACCENT} />
          <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: '1.55', textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}

      {/* ===== 教育经历 ===== */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="教育经历" accent={ACCENT} />
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{edu.school}</span>
                  {edu.tags && edu.tags.map((tag, ti) => (
                    <span key={ti} style={{ fontSize: '10px', color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '3px', padding: '0 4px', lineHeight: '16px', display: 'inline-block' }}>{tag}</span>
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
          <SectionTitle title="工作经历" accent={ACCENT} />
          {workExperience.map((exp) => (
            <ExpBlock
              key={exp.id}
              title={exp.company}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={[exp.position, exp.department].filter(Boolean).join(' · ')}
              location={exp.location}
              highlights={exp.highlights}
              accent="#5281F5"
            />
          ))}
        </div>
      )}

      {/* ===== 项目经历 ===== */}
      {projectExperience && projectExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="项目经历" accent={ACCENT} />
          {projectExperience.map((exp) => (
            <ExpBlock
              key={exp.id}
              title={exp.name}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={exp.role}
              location={exp.location}
              highlights={exp.highlights}
              accent="#5281F5"
            />
          ))}
        </div>
      )}

      {/* ===== 社团和组织经历 ===== */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="社团和组织经历" accent={ACCENT} />
          {organizationExperience.map((exp) => (
            <ExpBlock
              key={exp.id}
              title={exp.name}
              dateRange={`${exp.startDate} - ${exp.endDate}`}
              subtitle={[exp.role, exp.department].filter(Boolean).join(' · ')}
              location={exp.location}
              highlights={exp.highlights}
              accent="#5281F5"
            />
          ))}
        </div>
      )}

      {/* ===== 荣誉奖项 ===== */}
      {awards && awards.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <SectionTitle title="荣誉奖项" accent={ACCENT} />
          <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
            {awards.map((award, i) => (
              <li key={award.id || i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.55', marginBottom: '4px' }}>
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
          <SectionTitle title="技能" accent={ACCENT} />
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
          const hasAny = sections.some(s => others[s.key] && others[s.key].length > 0);
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom: '12px' }}>
              <SectionTitle title="其他" accent={ACCENT} />
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

export default React.memo(ClassicTemplate);
