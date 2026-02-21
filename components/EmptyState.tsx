import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div className={`text-center py-12 bg-white border border-dashed border-slate-200 ${className ?? 'rounded-3xl'}`}>
      {icon && (
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
      <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">{description}</p>
      {action}
    </div>
  );
};
