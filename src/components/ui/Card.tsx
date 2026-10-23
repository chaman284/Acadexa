import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  accent?: 'oxblood' | 'forest' | 'brass' | 'rose' | 'sage' | 'white' | 'ivory' | 'taupe';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const accentBg: Record<string, string> = {
  oxblood: 'bg-[#EEE3E0]',
  forest:  'bg-[rgba(52,72,58,0.07)]',
  brass:   'bg-[rgba(182,154,105,0.10)]',
  rose:    'bg-[rgba(197,141,152,0.10)]',
  sage:    'bg-[rgba(104,123,98,0.08)]',
  white:   'bg-white',
  ivory:   'bg-[#F7F1E8]',
  taupe:   'bg-[#E8DDD3]',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
  accent,
}) => {
  return (
    <div
      className={clsx(
        'card',
        hover && 'card-hover',
        accent && accentBg[accent],
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  serif?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className, serif }) => (
  <div className={clsx('flex items-start justify-between mb-4', className)}>
    <div>
      <h3 className={clsx(
        'font-semibold text-[#302A2B] text-base',
        serif && 'font-serif'
      )}>{title}</h3>
      {subtitle && <p className="text-sm text-[#79666A] mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
