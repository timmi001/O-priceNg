import React from 'react';

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export default function MasonryGrid({ children, columns = 2, className = '' }: MasonryGridProps) {
  return (
    <div
      className={className}
      style={{
        columnCount: columns,
        columnGap: '0',
      }}
    >
      {React.Children.map(children, (child) => (
        <div style={{ breakInside: 'avoid' }}>{child}</div>
      ))}
    </div>
  );
}
