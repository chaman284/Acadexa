import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { ControlledTabs } from '../../components/ui/Tabs';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockLeaderboard } from '../../data/students';
import { Trophy, TrendingUp } from 'lucide-react';

const mostImprovedData = [
  { rank: 1, studentId: 'stu006', studentName: 'Divya Rao', score: 65, change: 'up' as const, changeValue: 3 },
  { rank: 2, studentId: 'stu001', studentName: 'Chaman', score: 78, change: 'up' as const, changeValue: 2 },
  { rank: 3, studentId: 'stu002', studentName: 'Priya Nair', score: 82, change: 'up' as const, changeValue: 1 },
];

export const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState('weekly');

  const tabs = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'overall', label: 'Overall' },
    { id: 'improved', label: 'Most Improved' },
  ];

  const data = tab === 'improved' ? mostImprovedData : mockLeaderboard;
  const myEntry = mockLeaderboard.find(e => e.studentId === 'stu001');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you rank among your classmates"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Leaderboard' }]}
      />

      {/* My ranking banner */}
      {myEntry && (
        <div
          className="card p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #e0e7ff 100%)', borderColor: 'var(--color-accent)' }}
        >
          <div className="w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--color-accent)]">Your Current Ranking</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              You're ranked <strong>#{myEntry.rank}</strong> out of 62 students this week
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-[var(--color-accent)]">#{myEntry.rank}</p>
            <div className="flex items-center gap-1 text-xs text-[var(--color-success)] justify-end">
              <TrendingUp className="w-3 h-3" />
              <span>+{myEntry.changeValue} this week</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + Table */}
      <Card padding="none">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Rankings</h3>
          <ControlledTabs tabs={tabs} activeTab={tab} onChange={setTab} />
        </div>
        <LeaderboardTable
          entries={data}
          currentStudentId="stu001"
        />
      </Card>

      {/* Note about privacy */}
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        Leaderboard shows aggregated quiz scores. Individual topic performance data is private.
      </p>
    </div>
  );
};
