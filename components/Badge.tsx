import React from 'react';

export type BadgeVariant = 'indigo' | 'purple' | 'slate' | 'green' | 'blue' | 'red' | 'amber';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant, className }) => {
  return (
    <span
      className={`inline-block rounded-full text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 ${variantClasses[variant]} ${className ?? ''}`}
    >
      {children}
    </span>
  );
};
