import React from 'react';

interface ExperienceItemProps {
  title: string;
  dateRange: string;
  subtitle?: string;
  location?: string;
  highlights?: string[];
  color?: string;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
  title,
  dateRange,
  subtitle,
  location,
  highlights,
  color = '#2563eb',
}) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      {/* 第一行：标题 + 时间 */}
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
            fontSize: '13.5px',
            color: '#1f2937',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: '#6b7280',
            flexShrink: 0,
            marginLeft: '12px',
          }}
        >
          {dateRange}
        </span>
      </div>

      {/* 第二行：副标题 + 地点 */}
      {(subtitle || location) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: '2px',
          }}
        >
          <span style={{ fontSize: '12.5px', color: '#4b5563' }}>
            {subtitle}
          </span>
          {location && (
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                flexShrink: 0,
                marginLeft: '12px',
              }}
            >
              {location}
            </span>
          )}
        </div>
      )}

      {/* bullet points */}
      {highlights && highlights.length > 0 && (
        <ul
          style={{
            margin: '5px 0 0 0',
            paddingLeft: '16px',
            listStyleType: 'disc',
          }}
        >
          {highlights.map((h, i) => (
            <li
              key={i}
              style={{
                fontSize: '12.5px',
                color: '#374151',
                lineHeight: '1.6',
                marginBottom: '2px',
              }}
            >
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExperienceItem;
