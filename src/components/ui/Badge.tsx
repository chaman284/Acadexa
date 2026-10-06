import React from 'react';
import { clsx } from 'clsx';

type BadgeColor = 'indigo' | 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  dot?: boolean;
}

const colorClasses: Record<BadgeColor, string> = {
  indigo: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-[var(--color-success-light)] text-[#15803d]',
  amber: 'bg-[var(--color-warning-light)] text-[#92400e]',
  red: 'bg-[var(--color-danger-light)] text-[#dc2626]',
  gray: 'bg-[var(--color-muted)] text-[var(--color-text-secondary)]',
  blue: 'bg-blue-50 text-blue-600',
};

const dotColors: Record<BadgeColor, string> = {
  indigo: 'bg-[var(--color-accent)]',
  purple: 'bg-purple-600',
  green: 'bg-[var(--color-success)]',
  amber: 'bg-[var(--color-warning)]',
  red: 'bg-[var(--color-danger)]',
  gray: 'bg-[var(--color-text-muted)]',
  blue: 'bg-blue-600',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'gray',
  className,
  dot = false,
}) => {
  return (
    <span className={clsx('badge', colorClasses[color], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[color])} />}
      {children}
    </span>
  );
};
