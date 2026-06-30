import React from 'react';
import type { TemplateConfig } from '../types';

interface BulletListProps {
  items: string[];
  config: TemplateConfig;
}

const BulletList: React.FC<BulletListProps> = ({ items, config }) => {
  if (!items || items.length === 0) return null;
  return (
    <ul
      style={{
        margin: '4px 0 0 0',
        paddingLeft: '16px',
        listStyleType: 'disc',
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: config.typography.bodySize,
            color: config.palette.textSecondary,
            lineHeight: config.typography.lineHeight,
            marginBottom: config.spacing.bulletGap,
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default React.memo(BulletList);
