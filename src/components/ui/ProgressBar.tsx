import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  height?: 'xs' | 'sm' | 'md';
  color?: 'indigo' | 'green' | 'amber' | 'red' | 'blue' | 'coral' | 'turquoise' | 'yellow' | 'lavender' | 'peach' | 'oxblood' | 'forest' | 'sage' | 'brass';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const heightClasses = {
  xs: 'h-1.5',
  sm: 'h-2.5',
  md: 'h-3.5',
};

const colorClasses: Record<string, string> = {
  // Oxblood, Ivory & Sage native
  oxblood:   'bg-[#542536]',
  forest:    'bg-[#34483A]',
  sage:      'bg-[#687B62]',
  brass:     'bg-[#B69A69]',
  // Legacy aliases → warm palette
  indigo:    'bg-[#542536]',
  green:     'bg-[#34483A]',
  amber:     'bg-[#B69A69]',
  red:       'bg-[#8b2c35]',
  blue:      'bg-[#34483A]',
  coral:     'bg-[#8b2c35]',
  turquoise: 'bg-[#34483A]',
  yellow:    'bg-[#B69A69]',
  lavender:  'bg-[#542536]',
  peach:     'bg-[#C58D98]',
};

const getAutoColor = (value: number): string => {
  if (value >= 75) return 'forest';
  if (value >= 55) return 'sage';
  if (value >= 40) return 'brass';
  return 'coral';
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
          {label && <span className="text-sm font-medium text-[#79666A]">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-[#302A2B]">{Math.round(percentage)}%</span>
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
