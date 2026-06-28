import React from 'react';

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  color = '#2563eb',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: `2px solid ${color}`,
        ...style,
      }}
    >
      {icon && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: color,
            color: '#fff',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <h2
        style={{
          margin: 0,
          fontSize: '15px',
          fontWeight: 700,
          color,
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;
