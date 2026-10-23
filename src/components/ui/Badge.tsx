import React from 'react';
import { clsx } from 'clsx';

type BadgeColor =
  | 'oxblood' | 'forest' | 'brass' | 'rose' | 'sage' | 'pale-rose'
  | 'indigo' | 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'purple'
  | 'coral' | 'yellow' | 'turquoise' | 'lavender' | 'peach';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  dot?: boolean;
}

const colorClasses: Record<BadgeColor, string> = {
  // Native Oxblood, Ivory & Sage
  oxblood:    'bg-[#EEE3E0] text-[#542536] border-[#C58D98]',
  forest:     'bg-[rgba(52,72,58,0.10)] text-[#34483A] border-[rgba(52,72,58,0.25)]',
  brass:      'bg-[rgba(182,154,105,0.15)] text-[#7a6200] border-[rgba(182,154,105,0.35)]',
  rose:       'bg-[rgba(197,141,152,0.15)] text-[#8b3048] border-[rgba(197,141,152,0.35)]',
  sage:       'bg-[rgba(104,123,98,0.12)] text-[#4a5e45] border-[rgba(104,123,98,0.28)]',
  'pale-rose':'bg-[#EEE3E0] text-[#79666A] border-[#E1D4CA]',
  // Legacy mappings → warm equivalents
  indigo:     'bg-[#EEE3E0] text-[#542536] border-[#C58D98]',
  purple:     'bg-[#EEE3E0] text-[#542536] border-[#C58D98]',
  green:      'bg-[rgba(52,72,58,0.10)] text-[#34483A] border-[rgba(52,72,58,0.25)]',
  amber:      'bg-[rgba(182,154,105,0.15)] text-[#7a6200] border-[rgba(182,154,105,0.35)]',
  red:        'bg-[rgba(139,44,53,0.10)] text-[#8b2c35] border-[rgba(139,44,53,0.25)]',
  gray:       'bg-[#EEE3E0] text-[#79666A] border-[#E1D4CA]',
  blue:       'bg-[rgba(52,72,58,0.10)] text-[#34483A] border-[rgba(52,72,58,0.25)]',
  coral:      'bg-[rgba(139,44,53,0.10)] text-[#8b2c35] border-[rgba(139,44,53,0.25)]',
  yellow:     'bg-[rgba(182,154,105,0.15)] text-[#7a6200] border-[rgba(182,154,105,0.35)]',
  turquoise:  'bg-[rgba(52,72,58,0.10)] text-[#34483A] border-[rgba(52,72,58,0.25)]',
  lavender:   'bg-[#EEE3E0] text-[#542536] border-[#C58D98]',
  peach:      'bg-[rgba(182,154,105,0.15)] text-[#7a6200] border-[rgba(182,154,105,0.35)]',
};

const dotColors: Record<BadgeColor, string> = {
  oxblood:    'bg-[#542536]',
  forest:     'bg-[#34483A]',
  brass:      'bg-[#B69A69]',
  rose:       'bg-[#C58D98]',
  sage:       'bg-[#687B62]',
  'pale-rose':'bg-[#79666A]',
  indigo:     'bg-[#542536]',
  purple:     'bg-[#542536]',
  green:      'bg-[#34483A]',
  amber:      'bg-[#B69A69]',
  red:        'bg-[#8b2c35]',
  gray:       'bg-[#79666A]',
  blue:       'bg-[#34483A]',
  coral:      'bg-[#8b2c35]',
  yellow:     'bg-[#B69A69]',
  turquoise:  'bg-[#34483A]',
  lavender:   'bg-[#542536]',
  peach:      'bg-[#B69A69]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'pale-rose',
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
