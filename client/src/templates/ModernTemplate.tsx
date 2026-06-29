import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const SIDEBAR_BG = '#1e293b';
const DEFAULT_ACCENT = '#3b82f6';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

const ModernTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo = {} as any, summary = '', education = [], workExperience = [], projectExperience = [], organizationExperience = [], awards = [], others = DEFAULT_OTHERS, themeColor } = resume;
  const skills = others?.skills || resume.skills || [];
  const ACCENT = themeColor || DEFAULT_ACCENT;
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
        display: 'flex',
        boxSizing: 'border-box',
        fontFamily: 'SimSun, "宋体", serif',
        color: '#1f2937',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* ===== 左侧侧边栏 ===== */}
      <div
        style={{
          width: '72mm',
          backgroundColor: SIDEBAR_BG,
          color: '#f1f5f9',
          padding: '36px 20px',
          boxSizing: 'border-box',
          flexShrink: 0,
          textAlign: headerAlign,
        }}
      >
        {/* 头像 */}
        {personalInfo.photo && (
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

        {/* 姓名 */}
        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '2px',
          }}
        >
          {personalInfo.name || '姓名'}
        </h1>

        {personalInfo.title && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '4px',
              fontSize: '12px',
              color: ACCENT,
              fontWeight: 600,
            }}
          >
            {personalInfo.title}
          </div>
        )}

        {/* 联系方式 */}
        <div style={{ marginTop: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: ACCENT,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: `1px solid rgba(255,255,255,0.15)`,
              paddingBottom: '4px',
            }}
          >
            联系方式
          </div>
          {personalInfo.phone && (
            <div style={{ fontSize: '12px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span style={{ marginRight: '6px' }}>📱</span>{personalInfo.phone}
            </div>
          )}
          {personalInfo.email && (
            <div style={{ fontSize: '12px', marginBottom: '6px', color: '#cbd5e1', wordBreak: 'break-all' }}>
              <span style={{ marginRight: '6px' }}>✉️</span>{personalInfo.email}
            </div>
          )}
          {personalInfo.city && (
            <div style={{ fontSize: '12px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span style={{ marginRight: '6px' }}>📍</span>{personalInfo.city}
            </div>
          )}
          {personalInfo.campusActivities && (
            <div style={{ fontSize: '12px', marginBottom: '6px', color: '#cbd5e1' }}>
              <span style={{ marginRight: '6px' }}>🎯</span>{personalInfo.campusActivities}
            </div>
          )}
        </div>

        {/* 技能 */}
        {skills && skills.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: ACCENT,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: `1px solid rgba(255,255,255,0.15)`,
                paddingBottom: '4px',
              }}
            >
              技能
            </div>
            {skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#e2e8f0' }}>
                  {skill.category}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {skill.items}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 荣誉奖项 - 放在侧边栏 */}
        {awards && awards.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: ACCENT,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: `1px solid rgba(255,255,255,0.15)`,
                paddingBottom: '4px',
              }}
            >
              荣誉奖项
            </div>
            <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc' }}>
              {awards.map((award, i) => (
                <li key={award.id || i} style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '6px' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                    {award.title || `奖项 ${i + 1}`}
                  </span>
                  {award.date && (
                    <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{award.date}</span>
                  )}
                  {award.description && (
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px', lineHeight: 1.5 }}>
                      {award.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 其他信息 - 放在侧边栏 */}
        {others && (
          (() => {
            const secs: { key: keyof typeof others; label: string }[] = [
              { key: 'certificates', label: '证书' },
              { key: 'languages', label: '语言' },
              { key: 'hobbies', label: '爱好' },
            ];
            const hasAny = secs.some(s => others[s.key] && others[s.key].length > 0);
            if (!hasAny) return null;
            return (
              <div style={{ marginTop: '24px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: ACCENT,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderBottom: `1px solid rgba(255,255,255,0.15)`,
                    paddingBottom: '4px',
                  }}
                >
                  其他
                </div>
                {secs.map(({ key, label }) => {
                  const items = others[key];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={key} style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{items.join('、')}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      {/* ===== 右侧主内容 ===== */}
      <div
        style={{
          flex: 1,
          padding: '36px 28px',
          boxSizing: 'border-box',
        }}
      >
        {/* 个人总结 */}
        {summary && (
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              个人总结
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: '1.7', textAlign: 'justify' }}>
              {summary}
            </p>
          </div>
        )}

        {/* 教育经历 */}
        {education && education.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              教育经历
            </div>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{edu.school}</span>
                    {edu.tags && edu.tags.map((tag, ti) => (
                      <span key={ti} style={{ fontSize: '10px', color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: '3px', padding: '0 4px', lineHeight: '16px', display: 'inline-block' }}>{tag}</span>
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
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              工作经历
            </div>
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
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              项目经历
            </div>
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
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: ACCENT,
                borderBottom: `2px solid ${ACCENT}`,
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              社团和组织经历
            </div>
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
      </div>
    </div>
  );
};

export default React.memo(ModernTemplate);
