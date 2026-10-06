import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  height?: 'xs' | 'sm' | 'md';
  color?: 'indigo' | 'green' | 'amber' | 'red' | 'blue';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const heightClasses = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-3',
};

const colorClasses = {
  indigo: 'bg-[var(--color-accent)]',
  green: 'bg-[var(--color-success)]',
  amber: 'bg-[var(--color-warning)]',
  red: 'bg-[var(--color-danger)]',
  blue: 'bg-blue-500',
};

const getAutoColor = (value: number): 'green' | 'amber' | 'red' | 'indigo' => {
  if (value >= 75) return 'green';
  if (value >= 55) return 'indigo';
  if (value >= 40) return 'amber';
  return 'red';
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 'sm',
  color,
  showLabel = false,
  label,
  className,
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const resolvedColor = color || getAutoColor(percentage);

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={clsx('progress-bar-track w-full', heightClasses[height])}>
        <div
          className={clsx('progress-bar-fill', colorClasses[resolvedColor], heightClasses[height], !animated && '!transition-none')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
