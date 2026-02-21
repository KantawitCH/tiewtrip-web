import React from 'react';
import { Card } from './Card';

interface NotificationItemProps {
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  tripLabel?: string;
  onClick?: () => void;
  className?: string;
}

const borderColor: Record<string, string> = {
  info: 'border-l-blue-500',
  success: 'border-l-green-500',
  warning: 'border-l-amber-500',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  message,
  timestamp,
  type,
  tripLabel,
  onClick,
  className,
}) => {
  return (
    <Card
      className={`p-4 border-l-4 ${borderColor[type]} ${onClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''} ${className ?? ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          {tripLabel && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{tripLabel}</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{timestamp}</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </Card>
  );
};
