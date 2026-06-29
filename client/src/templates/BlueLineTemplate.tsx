import React from 'react';
import { Resume, OtherInfo } from '../types/resume';

const DEFAULT_COLOR = '#4472C4';
const DEFAULT_OTHERS: OtherInfo = { skills: [], certificates: [], languages: [], hobbies: [] };

// 主题色转浅背景：叠加白色 90% 透明度
function lightBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r * 0.18 + 255 * 0.82);
  const lg = Math.round(g * 0.18 + 255 * 0.82);
  const lb = Math.round(b * 0.18 + 255 * 0.82);
  return `rgb(${lr},${lg},${lb})`;
}

const BlueLineTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
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

  const COLOR = themeColor || DEFAULT_COLOR;
  const BG = lightBg(COLOR);

  const skillList = skills && skills.length > 0 ? skills : others?.skills ?? [];
  const otherSections: { key: keyof OtherInfo; label: string }[] = [
    { key: 'certificates', label: '证书' },
    { key: 'languages', label: '语言' },
    { key: 'hobbies', label: '兴趣' },
  ];
  const otherItems = otherSections.filter(s => ((others?.[s.key] ?? []) as string[]).length > 0);

  const BASE_FONT = '12px';
  const LINE_HEIGHT = '1.6';
  const FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", Arial, sans-serif';

  const SectionTitle = ({ title }: { title: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center',
      marginTop: '14px', marginBottom: '8px',
      backgroundColor: BG,
      borderLeft: `4px solid ${COLOR}`,
      paddingLeft: '8px', paddingTop: '4px', paddingBottom: '4px',
    }}>
      <span style={{ color: COLOR, fontWeight: 700, fontSize: BASE_FONT, fontFamily: FONT_FAMILY, lineHeight: LINE_HEIGHT }}>
        {title}
      </span>
    </div>
  );

  const ItemHeader = ({ name, start, end }: { name: React.ReactNode; start?: string; end?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', lineHeight: LINE_HEIGHT }}>
      <span style={{ fontWeight: 700, fontSize: BASE_FONT, color: '#111111' }}>{name}</span>
      {start && (
        <span style={{ fontSize: BASE_FONT, color: '#555', flexShrink: 0, marginLeft: '12px', whiteSpace: 'nowrap' }}>
          {start}{end ? ` - ${end}` : ''}
        </span>
      )}
    </div>
  );

  const ItemSub = ({ sub, location }: { sub?: string; location?: string }) => {
    if (!sub && !location) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: LINE_HEIGHT, marginBottom: '2px' }}>
        <span style={{ fontSize: BASE_FONT, color: '#444' }}>{sub}</span>
        {location && <span style={{ fontSize: BASE_FONT, color: '#666', flexShrink: 0, marginLeft: '12px' }}>{location}</span>}
      </div>
    );
  };

  const SchoolTag = ({ label }: { label: string }) => (
    <span style={{
      fontSize: '10px', color: COLOR, backgroundColor: BG,
      borderRadius: '2px', padding: '0 5px', lineHeight: '16px',
      display: 'inline-block', marginLeft: '5px', verticalAlign: 'middle',
    }}>{label}</span>
  );

  const BulletList = ({ items }: { items: string[] }) => (
    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyle: 'disc' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: BASE_FONT, color: '#333', lineHeight: LINE_HEIGHT, marginBottom: '3px' }}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div style={{
      width: '794px',
      minHeight: '1123px',
      maxHeight: '1123px',
      overflow: 'hidden',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      padding: '19px',          // 5mm ≈ 19px
      boxSizing: 'border-box',
      fontFamily: FONT_FAMILY,
      color: '#222',
      fontSize: BASE_FONT,
      lineHeight: LINE_HEIGHT,
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111', letterSpacing: '1px', lineHeight: '24px', marginBottom: '3px' }}>
          {personalInfo.name || '姓名'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: BASE_FONT, color: '#444', flexWrap: 'wrap', lineHeight: LINE_HEIGHT }}>
          {[personalInfo.phone, personalInfo.email, personalInfo.city]
            .filter(Boolean)
            .map((item, i, arr) => (
              <React.Fragment key={i}>
                <span>{item}</span>
                {i < arr.length - 1 && <span style={{ margin: '0 8px', color: '#bbb' }}>|</span>}
              </React.Fragment>
            ))}
        </div>
        {personalInfo.title && (
          <div style={{ marginTop: '2px', fontSize: BASE_FONT, color: '#666', lineHeight: LINE_HEIGHT }}>{personalInfo.title}</div>
        )}
      </div>

      {/* 个人总结 */}
      {summary && (
        <>
          <SectionTitle title="个人总结" />
          <p style={{ margin: '0 0 4px 0', fontSize: BASE_FONT, color: '#333', lineHeight: LINE_HEIGHT, textAlign: 'justify' }}>
            {summary}
          </p>
        </>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <>
          <SectionTitle title="教育经历" />
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <ItemHeader
                name={<>{edu.school}{edu.tags?.map((t, ti) => <SchoolTag key={ti} label={t} />)}</>}
                start={edu.startDate} end={edu.endDate}
              />
              <ItemSub sub={[edu.major, edu.degree].filter(Boolean).join('  ')} />
              {edu.highlights && edu.highlights.length > 0 && <BulletList items={edu.highlights} />}
            </div>
          ))}
        </>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <>
          <SectionTitle title="工作经历" />
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <ItemHeader name={exp.company} start={exp.startDate} end={exp.endDate} />
              <ItemSub sub={[exp.position, exp.department].filter(Boolean).join('  ')} location={exp.location} />
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </>
      )}

      {/* 项目经历 */}
      {projectExperience.length > 0 && (
        <>
          <SectionTitle title="项目经历" />
          {projectExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <ItemHeader name={exp.name} start={exp.startDate} end={exp.endDate} />
              {exp.role && <ItemSub sub={exp.role} />}
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </>
      )}

      {/* 社团经历 */}
      {organizationExperience.length > 0 && (
        <>
          <SectionTitle title="社团经历" />
          {organizationExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <ItemHeader name={exp.name} start={exp.startDate} end={exp.endDate} />
              <ItemSub sub={[exp.role, exp.department].filter(Boolean).join('  ')} location={exp.location} />
              {exp.highlights && exp.highlights.length > 0 && <BulletList items={exp.highlights} />}
            </div>
          ))}
        </>
      )}

      {/* 专利及荣誉 */}
      {awards.length > 0 && (
        <>
          <SectionTitle title="专利及荣誉" />
          {awards.map((award, i) => (
            <div key={award.id || i} style={{ marginBottom: '10px' }}>
              <ItemHeader name={award.title || `奖项 ${i + 1}`} start={award.date} />
              {award.description && (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyle: 'disc' }}>
                  <li style={{ fontSize: BASE_FONT, color: '#333', lineHeight: LINE_HEIGHT }}>{award.description}</li>
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* 其他 */}
      {(skillList.length > 0 || otherItems.length > 0) && (
        <>
          <SectionTitle title="其他" />
          <div style={{ fontSize: BASE_FONT, color: '#333', lineHeight: LINE_HEIGHT }}>
            {skillList.length > 0 && (
              <div>
                <span style={{ fontWeight: 600 }}>技能：</span>
                <span>{skillList.map(s => s.category && s.items ? `${s.category}（${s.items}）` : s.category || s.items).filter(Boolean).join('，')}</span>
              </div>
            )}
            {otherItems.map(({ key, label }) => {
              const items = (others?.[key] ?? []) as string[];
              return (
                <div key={key}>
                  <span style={{ fontWeight: 600 }}>{label}：</span>
                  <span>{items.join('，')}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BlueLineTemplate;
