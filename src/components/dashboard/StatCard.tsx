import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  accent?: 'oxblood' | 'brass' | 'forest' | 'rose' | 'indigo' | 'navy' | 'success' | 'warning' | 'danger';
  className?: string;
}

const accentConfig = {
  oxblood: { bg: 'rgba(84,37,54,0.07)',    icon: '#542536', bar: '#542536' },
  brass:   { bg: 'rgba(182,154,105,0.10)', icon: '#B69A69', bar: '#B69A69' },
  forest:  { bg: 'rgba(52,72,58,0.08)',     icon: '#34483A', bar: '#34483A' },
  rose:    { bg: 'rgba(197,141,152,0.10)', icon: '#C58D98', bar: '#C58D98' },
  indigo:  { bg: 'rgba(84,37,54,0.07)',    icon: '#542536', bar: '#542536' },
  navy:    { bg: 'rgba(50,25,35,0.07)',     icon: '#302A2B', bar: '#302A2B' },
  success: { bg: 'rgba(52,72,58,0.08)',     icon: '#34483A', bar: '#34483A' },
  warning: { bg: 'rgba(182,154,105,0.10)', icon: '#B69A69', bar: '#B69A69' },
  danger:  { bg: 'rgba(139,44,53,0.08)',   icon: '#8b2c35', bar: '#8b2c35' },
};

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
  const cfg = accentConfig[accent];

  return (
    <div
      className={clsx('card p-5 relative overflow-hidden', className)}
      style={{ background: '#FFFFFF' }}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-[14px]"
        style={{ background: cfg.bar }}
      />
      <div className="pl-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-[#79666A] uppercase tracking-widest mb-2.5">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#302A2B] leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-[#79666A] font-medium mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={clsx(
                'flex items-center gap-1 mt-2 text-xs font-semibold',
                trendPositive && 'text-[#34483A]',
                trendNegative && 'text-[#8b2c35]',
                !trendPositive && !trendNegative && 'text-[#a08a8e]'
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
            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ml-3"
            style={{
              background: cfg.bg,
              color: cfg.icon,
              border: `1px solid ${cfg.bar}22`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
