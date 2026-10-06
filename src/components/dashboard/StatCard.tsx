import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  icon?: React.ReactNode;
  accent?: 'indigo' | 'navy' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  accent = 'indigo',
  className,
}) => {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className={clsx('card p-5 stat-card-accent', `accent-${accent}`, className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={clsx(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                trendPositive && 'text-[var(--color-success)]',
                trendNegative && 'text-[var(--color-danger)]',
                !trendPositive && !trendNegative && 'text-[var(--color-text-muted)]'
              )}
            >
              {trendPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {trendNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {!trendPositive && !trendNegative && <Minus className="w-3.5 h-3.5" />}
              <span>
                {trendPositive && '+'}
                {trend}
                {trendLabel ? ` ${trendLabel}` : '%'}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3',
              accent === 'indigo' && 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
              accent === 'navy' && 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
              accent === 'success' && 'bg-[var(--color-success-light)] text-[var(--color-success)]',
              accent === 'warning' && 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
              accent === 'danger' && 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
