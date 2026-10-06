import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { ControlledTabs } from '../ui/Tabs';
import { CardHeader } from '../ui/Card';
import { TrendingUp } from 'lucide-react';
import type { PerformancePoint } from '../../types/analytics';

interface PerformanceChartProps {
  weekData: PerformancePoint[];
  monthData: PerformancePoint[];
  semesterData: PerformancePoint[];
  showClassAverage?: boolean;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 shadow-lg">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name === 'score' ? 'Your Score' : 'Class Avg'}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  weekData,
  monthData,
  semesterData,
  showClassAverage = true,
  title = 'Performance Overview',
}) => {
  const [period, setPeriod] = useState('week');

  const tabs = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'semester', label: 'Semester' },
  ];

  const data = period === 'week' ? weekData : period === 'month' ? monthData : semesterData;
  const latestScore = data[data.length - 1]?.score || 0;
  const previousScore = data[data.length - 2]?.score || 0;
  const improvement = latestScore - previousScore;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)] text-base">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" />
            <span className="text-xs text-[var(--color-success)] font-medium">
              +{improvement}% from last {period === 'week' ? 'week' : period === 'month' ? 'month' : 'semester'}
            </span>
          </div>
        </div>
        <ControlledTabs tabs={tabs} activeTab={period} onChange={setPeriod} />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showClassAverage && data[0]?.average !== undefined && (
            <Area
              type="monotone"
              dataKey="average"
              stroke="#22c55e"
              strokeWidth={1.5}
              fill="url(#avgGradient)"
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
            dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {showClassAverage && data[0]?.average !== undefined && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[var(--color-accent)] rounded" />
            <span className="text-xs text-[var(--color-text-muted)]">Your score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[var(--color-success)] rounded border-dashed border border-[var(--color-success)]" style={{ borderStyle: 'dashed', borderWidth: 1 }} />
            <span className="text-xs text-[var(--color-text-muted)]">Class average</span>
          </div>
        </div>
      )}
    </div>
  );
};
