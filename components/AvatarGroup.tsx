import React from 'react';

interface AvatarGroupProps {
  avatars: { src: string; alt: string }[];
  max?: number;
  size?: 'sm' | 'md';
  showOverflow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 3,
  size = 'md',
  showOverflow = true,
  className,
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className ?? ''}`}>
      {visible.map((avatar, i) => (
        <img
          key={i}
          className={`${sizeClasses[size]} rounded-full border-2 border-white`}
          src={avatar.src}
          alt={avatar.alt}
        />
      ))}
      {showOverflow && overflow > 0 && (
        <div className={`${sizeClasses[size]} rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500`}>
          +{overflow}
        </div>
      )}
    </div>
  );
};
