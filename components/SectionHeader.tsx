import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action, badge, className }) => {
  return (
    <div className={`flex items-center justify-between ${className ?? ''}`}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {title}
          {badge}
        </h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
