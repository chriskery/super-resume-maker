import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const DEFAULT_RED = '#ca3832';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

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
    themeColor,
  } = resume;

  const RED = themeColor || DEFAULT_RED;
  const headerAlign = resume.headerAlignment || 'center';

  const skillList = skills && skills.length > 0 ? skills : others?.skills ?? [];
  const otherSections: { key: keyof OtherInfo; label: string }[] = [
    { key: 'certificates', label: '证书' },
    { key: 'languages', label: '语言' },
    { key: 'hobbies', label: '兴趣' },
  ];
  const otherItems = otherSections.filter(s => ((others?.[s.key] ?? []) as string[]).length > 0);

  const SectionTitle = ({ title }: { title: string }) => (
    <div style={{ borderBottom: `1.5px solid ${RED}`, marginBottom: '6px', marginTop: '10px', paddingBottom: '2px' }}>
      <span style={{ color: RED, fontWeight: 700, fontSize: '13.5px', letterSpacing: '0.5px' }}>
        {title}
      </span>
    </div>
  );

  const DateRange = ({ start, end }: { start?: string; end?: string }) => {
    if (!start) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: RED, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '11.5px', color: '#4b5563', whiteSpace: 'nowrap' }}>
          {start}{end ? ` - ${end}` : ''}
        </span>
      </div>
    );
  };

  const BulletList = ({ items }: { items: string[] }) => (
    <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', listStyle: 'disc' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', marginBottom: '1px' }}>{item}</li>
      ))}
    </ul>
  );

  const SchoolTag = ({ label }: { label: string }) => (
    <span style={{
      fontSize: '10px', color: RED, border: `1px solid ${RED}`, borderRadius: '2px',
      padding: '0 4px', lineHeight: '16px', display: 'inline-block',
      marginLeft: '5px', fontWeight: 500, verticalAlign: 'middle',
    }}>{label}</span>
  );

  return (
    <div style={{
      width: '210mm', height: '297mm', margin: '0 auto',
      backgroundColor: '#ffffff', padding: '20px 24px', boxSizing: 'border-box',
      fontFamily: 'SimSun, "宋体", serif',
      color: '#1f2937', fontSize: '12px', lineHeight: '1.5',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ textAlign: headerAlign, marginBottom: '4px' }}>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827', letterSpacing: '3px', marginBottom: '6px' }}>
          {personalInfo.name || '姓名'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#4b5563', flexWrap: 'wrap' }}>
          {[personalInfo.phone, personalInfo.email, personalInfo.city, personalInfo.campusActivities].filter(Boolean).map((item, i, arr) => (
            <React.Fragment key={i}>
              <span>{item}</span>
              {i < arr.length - 1 && <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>}
            </React.Fragment>
          ))}
        </div>
        {personalInfo.title && (
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>{personalInfo.title}</div>
        )}
      </div>

      {/* 教育经历 */}
      {education.length > 0 && (
        <div>
          <SectionTitle title="教育经历" />
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{edu.school}</span>
                  {edu.tags?.map((tag, ti) => <SchoolTag key={ti} label={tag} />)}
                </div>
                <DateRange start={edu.startDate} end={edu.endDate} />
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '1px' }}>
                {[edu.major, edu.degree].filter(Boolean).join('  ')}
              </div>
              {edu.highlights && edu.highlights.length > 0 && <BulletList items={edu.highlights} />}
            </div>
          ))}
        </div>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <div>
          <SectionTitle title="工作经历" />
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.company}</span>
                <DateRange start={exp.startDate} end={exp.endDate} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>
                  {[exp.position, exp.department].filter(Boolean).join('  ')}
                </span>
                {exp.location && <span style={{ fontSize: '11.5px', color: '#6b7280', flexShrink: 0 }}>{exp.location}</span>}
              </div>
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </div>
      )}

      {/* 项目经历 */}
      {projectExperience.length > 0 && (
        <div>
          <SectionTitle title="项目经历" />
          {projectExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.name}</span>
                <DateRange start={exp.startDate} end={exp.endDate} />
              </div>
              {exp.role && <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '1px' }}>{exp.role}</div>}
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </div>
      )}

      {/* 社团经历 */}
      {organizationExperience.length > 0 && (
        <div>
          <SectionTitle title="社团经历" />
          {organizationExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{exp.name}</span>
                <DateRange start={exp.startDate} end={exp.endDate} />
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '1px' }}>
                {[exp.role, exp.department].filter(Boolean).join('  ')}
              </div>
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </div>
      )}

      {/* 专利及荣誉 */}
      {awards.length > 0 && (
        <div>
          <SectionTitle title="专利及荣誉" />
          {awards.map((award, i) => (
            <div key={award.id || i} style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '12.5px', color: '#111827' }}>
                  {award.title || `奖项 ${i + 1}`}
                </span>
                {award.date && <DateRange start={award.date} />}
              </div>
              {award.description && (
                <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', listStyle: 'disc' }}>
                  <li style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>{award.description}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 其他（技能 + 语言等） */}
      {(skillList.length > 0 || otherItems.length > 0) && (
        <div>
          <SectionTitle title="其他" />
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.8' }}>
            {skillList.length > 0 && (
              <div>
                <span style={{ fontWeight: 600, color: '#111827' }}>技能：</span>
                <span>
                  {skillList.map(s => s.category && s.items ? `${s.category}（${s.items}）` : s.category || s.items).filter(Boolean).join('，')}
                </span>
              </div>
            )}
            {otherItems.map(({ key, label }) => {
              const items = (others?.[key] ?? []) as string[];
              return (
                <div key={key}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{label}：</span>
                  <span>{items.join('，')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 个人总结 */}
      {summary && (
        <div>
          <SectionTitle title="个人总结" />
          <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: '1.7', textAlign: 'justify' }}>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(RedLineTemplate);
