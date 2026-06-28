import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const ACCENT = '#ea580c';
const ACCENT_LIGHT = '#fb923c';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [], activities: [] };

// ── 区段标题（左侧橙色圆点 + 文字 + 底部分隔线） ──
const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginBottom: '10px', borderBottom: '1.5px solid #e5e7eb', paddingBottom: '6px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: ACCENT,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: '14px', fontWeight: 700, color: ACCENT, letterSpacing: '1px' }}>{title}</span>
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
}> = ({ title, dateRange, subtitle, location, highlights }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{title}</span>
      <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{dateRange}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
      <span style={{ fontSize: '12.5px', color: '#4b5563' }}>{subtitle}</span>
      {location && (
        <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, marginLeft: '12px' }}>{location}</span>
      )}
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

const ClassicTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const { personalInfo = {} as any, summary = '', education = [], workExperience = [], projectExperience = [], organizationExperience = [], awards = [], others = DEFAULT_OTHERS } = resume;
  const skills = others?.skills || resume.skills || [];

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '40px 36px',
        boxSizing: 'border-box',
        fontFamily: '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif',
        color: '#1f2937',
        fontSize: '13px',
        lineHeight: '1.5',
      }}
    >
      {/* ===== 顶部：左侧姓名信息 + 右上角方形头像 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${ACCENT_LIGHT}`,
        }}
      >
        {/* 左侧 */}
        <div style={{ flex: 1 }}>
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
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="个人总结" />
          <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: '1.7', textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}

      {/* ===== 教育经历 ===== */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="教育经历" />
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
                {[edu.major, edu.degree].filter(Boolean).join(' · ')}
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

      {/* ===== 工作经历 ===== */}
      {workExperience && workExperience.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="工作经历" />
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

      {/* ===== 项目经历 ===== */}
      {projectExperience && projectExperience.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="项目经历" />
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

      {/* ===== 社团和组织经历 ===== */}
      {organizationExperience && organizationExperience.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="社团和组织经历" />
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

      {/* ===== 荣誉奖项 ===== */}
      {awards && awards.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="荣誉奖项" />
          <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
            {awards.map((award, i) => (
              <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7', marginBottom: '2px' }}>
                {award}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 其他（技能） ===== */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionTitle title="技能" />
          <div style={{ fontSize: '12.5px', color: '#374151', lineHeight: '1.7' }}>
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
            { key: 'activities', label: '活动' },
          ];
          const hasAny = sections.some(s => others[s.key] && others[s.key].length > 0);
          if (!hasAny) return null;
          return (
            <div style={{ marginBottom: '16px' }}>
              <SectionTitle title="其他" />
              {sections.map(({ key, label }) => {
                const items = others[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: '6px', fontSize: '12.5px', color: '#374151', lineHeight: '1.7' }}>
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

export default ClassicTemplate;
