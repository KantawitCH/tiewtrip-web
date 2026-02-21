import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, className }) => {
  return (
    <div className={`bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm ${className ?? ''}`}>
      <span className="block text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
  );
};
