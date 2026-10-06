import React from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getColor = (name: string): string => {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover flex-shrink-0', sizeClasses[size], className)}
      />
    );
  }

  if (name) {
    return (
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
          sizeClasses[size],
          getColor(name),
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center bg-[var(--color-muted)] text-[var(--color-text-muted)] flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      <User className="w-4 h-4" />
    </div>
  );
};
