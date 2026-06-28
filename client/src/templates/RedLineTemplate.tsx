import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const RED = '#b91c1c';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [], activities: [] };

const RedLineTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const {
    personalInfo = {} as any,
    summary = '',
    education = [],
    workExperience = [],
    projectExperience = [],
    organizationExperience = [],
    awards = [],
    skills,
    others = DEFAULT_OTHERS,
  } = resume;

  // fallback: read skills from others if top-level is empty
  const skillList = skills && skills.length > 0 ? skills : others?.skills ?? [];

  const sectionTitle = (text: string) => (
    <div
      style={{
        borderLeft: `3px solid ${RED}`,
        paddingLeft: '8px',
        paddingTop: '4px',
        paddingBottom: '4px',
        marginBottom: '8px',
        marginTop: '14px',
        backgroundColor: '#fef2f2',
      }}
    >
      <span
        style={{
          color: RED,
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.5px',
        }}
      >
        {text}
      </span>
    </div>
  );

  const badgeStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#fff',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    padding: '0 5px',
    lineHeight: '16px',
    display: 'inline-block',
    marginLeft: '6px',
    fontWeight: 500,
  };

  const bulletList = (items: string[]) => (
    <div style={{ marginTop: '3px', paddingLeft: '2px' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            fontSize: '12px',
            color: '#374151',
            lineHeight: '1.65',
            marginBottom: '1px',
          }}
        >
          <span style={{ color: '#6b7280', marginRight: '4px' }}>•</span>
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '32px 36px',
        boxSizing: 'border-box',
        fontFamily:
          '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif',
        color: '#1f2937',
        fontSize: '12.5px',
        lineHeight: '1.5',
      }}
    >
      {/* ===== 顶部 Header ===== */}
      <div
        style={{
          borderLeft: `4px solid ${RED}`,
          paddingLeft: '12px',
          paddingBottom: '10px',
          marginBottom: '4px',
        }}
      >
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
            fontSize: '12.5px',
            color: '#4b5563',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && (
            <span style={{ color: '#d1d5db' }}>|</span>
          )}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {(personalInfo.phone || personalInfo.email) && personalInfo.city && (
            <span style={{ color: '#d1d5db' }}>|</span>
          )}
          {personalInfo.city && <span>{personalInfo.city}</span>}
        </div>
      </div>

      {/* ===== 个人总结 ===== */}
      {summary && (
        <div>
          {sectionTitle('个人总结')}
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#374151',
              lineHeight: '1.7',
              textAlign: 'justify',
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {/* ===== 教育经历 ===== */}
      {education && education.length > 0 && (
        <div>
          {sectionTitle('教育经历')}
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0px',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: '#111827',
                    }}
                  >
                    {edu.school}
                  </span>
                  {edu.tags &&
                    edu.tags.map((tag, ti) => (
                      <span key={ti} style={badgeStyle}>
                        {tag}
                      </span>
                    ))}
                </div>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#6b7280',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: '1px',
                }}
              >
                <span style={{ fontSize: '12px', color: '#4b5563' }}>
                  {[edu.major, edu.degree].filter(Boolean).join(' / ')}
                </span>
              </div>
              {edu.highlights && edu.highlights.length > 0 && bulletList(edu.highlights)}
            </div>
          ))}
        </div>
      )}

      {/* ===== 工作经历 ===== */}
      {workExperience && workExperience.length > 0 && (
        <div>
          {sectionTitle('工作经历')}
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#111827',
                  }}
                >
                  {exp.company}
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#6b7280',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: '1px',
                }}
              >
                <span style={{ fontSize: '12px', color: '#4b5563' }}>
                  {[exp.department, exp.position].filter(Boolean).join(' / ')}
                </span>
                {exp.location && (
                  <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                    {exp.location}
                  </span>
                )}
              </div>
              {exp.highlights && exp.highlights.length > 0 && bulletList(exp.highlights)}
            </div>
          ))}
        </div>
      )}

      {/* ===== 项目经历 ===== */}
      {projectExperience && projectExperience.length > 0 && (
        <div>
          {sectionTitle('项目经历')}
          {projectExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#111827',
                  }}
                >
                  {exp.name}
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#6b7280',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              {exp.role && (
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '1px' }}>
                  {exp.role}
                </div>
              )}
              {exp.highlights && exp.highlights.length > 0 && bulletList(exp.highlights)}
            </div>
          ))}
        </div>
      )}

      {/* ===== 社团和组织经历 ===== */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div>
          {sectionTitle('社团和组织经历')}
          {organizationExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#111827',
                  }}
                >
                  {exp.name}
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#6b7280',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '1px' }}>
                {[exp.role, exp.department].filter(Boolean).join(' / ')}
              </div>
              {exp.highlights && exp.highlights.length > 0 && bulletList(exp.highlights)}
            </div>
          ))}
        </div>
      )}

      {/* ===== 专利及荣誉 ===== */}
      {awards && awards.length > 0 && (
        <div>
          {sectionTitle('专利及荣誉')}
          <div style={{ paddingLeft: '2px' }}>
            {awards.map((award, i) => (
              <div
                key={i}
                style={{
                  fontSize: '12px',
                  color: '#374151',
                  lineHeight: '1.65',
                  marginBottom: '1px',
                }}
              >
                <span style={{ color: '#6b7280', marginRight: '4px' }}>•</span>
                {award}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 技能 ===== */}
      {skillList.length > 0 && (
        <div>
          {sectionTitle('专业技能')}
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
            {skillList.map((skill, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {skill.category}：
                </span>
                <span>{skill.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 其他信息 ===== */}
      {others &&
        (() => {
          const sections: { key: keyof typeof others; label: string }[] = [
            { key: 'certificates', label: '证书/执照' },
            { key: 'languages', label: '语言' },
            { key: 'hobbies', label: '兴趣爱好' },
            { key: 'activities', label: '活动' },
          ];
          const hasAny = sections.some(
            (s) => others[s.key] && others[s.key].length > 0,
          );
          if (!hasAny) return null;
          return (
            <div>
              {sectionTitle('其他')}
              {sections.map(({ key, label }) => {
                const items = others[key];
                if (!items || items.length === 0) return null;
                return (
                  <div
                    key={key}
                    style={{
                      marginBottom: '4px',
                      fontSize: '12px',
                      color: '#374151',
                      lineHeight: '1.7',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#111827' }}>
                      {label}：
                    </span>
                    <span>{items.join('、')}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
    </div>
  );
};

export default RedLineTemplate;
