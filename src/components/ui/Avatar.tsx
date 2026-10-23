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
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Minimal, elegant academic luxury avatar palette (Oxblood, Ivory & Sage)
const getColor = (name: string): { bg: string; text: string; border: string } => {
  const palette = [
    { bg: '#F7F1E8', text: '#542536', border: '#E1D4CA' }, // Ivory / Oxblood
    { bg: '#F0F4EF', text: '#34483A', border: '#D5DFD4' }, // Pale Sage / Forest
    { bg: '#F9F1F2', text: '#542536', border: '#E9D6DA' }, // Pale Rose / Oxblood
    { bg: '#EFE7DE', text: '#302A2B', border: '#DFCFC2' }, // Warm Taupe / Espresso
    { bg: '#FBF6EB', text: '#7A5B2E', border: '#EBDDC0' }, // Pale Warm Brass
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx(
          'rounded-full object-cover flex-shrink-0 border border-[#E1D4CA]',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (name) {
    const { bg, text, border } = getColor(name);
    return (
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-semibold tracking-wide flex-shrink-0 select-none transition-transform',
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: bg,
          color: text,
          border: `1px solid ${border}`,
        }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center flex-shrink-0 bg-[#F7F1E8] text-[#79666A] border border-[#E1D4CA]',
        sizeClasses[size],
        className
      )}
    >
      <User className="w-3.5 h-3.5" />
    </div>
  );
};
