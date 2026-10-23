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
    <div
      className="bg-white border-2 border-[#171717] rounded-[8px] p-3"
      style={{ boxShadow: '3px 3px 0px #171717' }}
    >
      <p className="text-xs font-black text-[#696969] mb-1 uppercase tracking-wider">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-black" style={{ color: entry.color === '#42CFC1' ? '#0e6b64' : entry.color }}>
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
          <h3 className="font-black text-[#171717] text-base">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full bg-[#E0FAF8] border border-[#171717] text-[#171717]"
              style={{ boxShadow: '1.5px 1.5px 0px #171717' }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#0e6b64] stroke-[2.5]" />
              +{improvement}% vs last {period}
            </span>
          </div>
        </div>
        <ControlledTabs tabs={tabs} activeTab={period} onChange={setPeriod} />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF666B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#FF666B" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#42CFC1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#42CFC1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5d8c7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#171717', fontWeight: 600 }}
            axisLine={{ stroke: '#171717', strokeWidth: 1.5 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#171717', fontWeight: 600 }}
            axisLine={{ stroke: '#171717', strokeWidth: 1.5 }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showClassAverage && data[0]?.average !== undefined && (
            <Area
              type="monotone"
              dataKey="average"
              stroke="#42CFC1"
              strokeWidth={2}
              fill="url(#avgGradient)"
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#FF666B"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{ fill: '#FF666B', r: 4, strokeWidth: 2, stroke: '#171717' }}
            activeDot={{ r: 6, fill: '#FFE66D', stroke: '#171717', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {showClassAverage && data[0]?.average !== undefined && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t-2 border-[#e5d8c7]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#FF666B] rounded-[4px] border border-[#171717]" style={{ boxShadow: '1px 1px 0px #171717' }} />
            <span className="text-xs font-bold text-[#171717]">Your score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#42CFC1] rounded-[4px] border border-[#171717]" style={{ boxShadow: '1px 1px 0px #171717' }} />
            <span className="text-xs font-bold text-[#171717]">Class average</span>
          </div>
        </div>
      )}
    </div>
  );
};
