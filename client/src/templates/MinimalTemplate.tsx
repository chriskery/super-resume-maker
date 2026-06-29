import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };
const DEFAULT_ACCENT = '#374151';

const MinimalTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo = {} as any, summary = '', education = [], workExperience = [], projectExperience = [], organizationExperience = [], awards = [], others = DEFAULT_OTHERS, themeColor } = resume;
  const skills = others?.skills || resume.skills || [];
  const accent = themeColor || DEFAULT_ACCENT;
  const headerAlign = resume.headerAlignment || 'center';

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: accent,
    borderBottom: `1.5px solid ${accent}`,
    paddingBottom: '4px',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        overflow: 'hidden',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '40px 40px',
        boxSizing: 'border-box',
        fontFamily: 'SimSun, "宋体", serif',
        color: '#1f2937',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* Header - 左侧姓名信息 + 右上角头像 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        {/* 左侧/中间信息 */}
        <div style={{ flex: 1, textAlign: headerAlign }}>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '4px',
            }}
          >
            {personalInfo.name || '姓名'}
          </h1>
          <div
            style={{
              marginTop: '8px',
              fontSize: '13px',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.email && (
              <span style={{ color: '#9ca3af' }}>·</span>
            )}
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.title && (
              <>
                <span style={{ color: '#9ca3af' }}>·</span>
                <span>{personalInfo.title}</span>
              </>
            )}
            {personalInfo.city && (
              <>
                <span style={{ color: '#9ca3af' }}>·</span>
                <span>{personalInfo.city}</span>
              </>
            )}
            {personalInfo.campusActivities && (
              <>
                <span style={{ color: '#9ca3af' }}>·</span>
                <span>{personalInfo.campusActivities}</span>
              </>
            )}
          </div>
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
              marginLeft: '20px',
              border: '2px solid #e5e7eb',
            }}
          />
        )}
      </div>

      {/* 个人总结 */}
      {summary && (
        <div style={sectionStyle}>
          <div style={titleStyle}>个人总结</div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: '1.7', textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}

      {/* 教育经历 */}
      {education && education.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>教育经历</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{edu.school}</span>
                  {edu.tags && edu.tags.map((tag, ti) => (
                    <span key={ti} style={{ fontSize: '10px', color: accent, backgroundColor: `${accent}18`, borderRadius: '3px', padding: '0 5px', lineHeight: '16px', display: 'inline-block', marginLeft: '4px' }}>{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{edu.startDate} - {edu.endDate}</span>
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
        <div style={sectionStyle}>
          <div style={titleStyle}>工作经历</div>
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.company}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span style={{ fontSize: '12.5px', color: '#4b5563' }}>
                  {[exp.position, exp.department].filter(Boolean).join(' · ')}
                </span>
                {exp.location && <span style={{ fontSize: '12px', color: '#6b7280' }}>{exp.location}</span>}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', marginBottom: '2px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 项目经历 */}
      {projectExperience && projectExperience.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>项目经历</div>
          {projectExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.name}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              {exp.role && (
                <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>{exp.role}</div>
              )}
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', marginBottom: '2px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 社团和组织经历 */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>社团和组织经历</div>
          {organizationExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.name}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#4b5563', marginTop: '2px' }}>
                {[exp.role, exp.department].filter(Boolean).join(' · ')}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.6', marginBottom: '2px' }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 荣誉奖项 */}
      {awards && awards.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>荣誉奖项</div>
          <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
            {awards.map((award, i) => (
              <li key={award.id || i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', marginBottom: '6px' }}>
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

      {/* 技能 */}
      {skills && skills.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>技能</div>
          {skills.map((skill, i) => (
            <div key={i} style={{ marginBottom: '3px', fontSize: '12.5px', color: '#374151' }}>
              <span style={{ fontWeight: 600 }}>{skill.category}：</span>
              <span>{skill.items}</span>
            </div>
          ))}
        </div>
      )}

      {/* 其他信息 */}
      {others && (
        (() => {
          const secs: { key: keyof typeof others; label: string }[] = [
            { key: 'certificates', label: '证书/执照' },
            { key: 'languages', label: '语言' },
            { key: 'hobbies', label: '兴趣爱好' },
          ];
          const hasAny = secs.some(s => others[s.key] && others[s.key].length > 0);
          if (!hasAny) return null;
          return (
            <div style={sectionStyle}>
              <div style={titleStyle}>其他</div>
              {secs.map(({ key, label }) => {
                const items = others[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: '4px', fontSize: '12.5px', color: '#374151' }}>
                    <span style={{ fontWeight: 600 }}>{label}：</span>
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

export default React.memo(MinimalTemplate);
