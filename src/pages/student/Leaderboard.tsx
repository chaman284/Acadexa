import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { ControlledTabs } from '../../components/ui/Tabs';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockLeaderboard } from '../../data/students';
import { Trophy, TrendingUp } from 'lucide-react';

const mostImprovedData: { rank: number; studentId: string; studentName: string; score: number; change: 'up' | 'down' | 'same'; changeValue: number }[] = [];

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
          className="card p-5 flex items-center gap-5 border border-oxblood/30 shadow-card relative overflow-hidden text-white"
          style={{ background: 'linear-gradient(135deg, #321923 0%, #441d2b 50%, #542536 100%)' }}
        >
          <div className="w-12 h-12 bg-brass/20 border border-brass/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-brass" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-bold text-lg text-white">Your Current Ranking</p>
            <p className="text-xs text-white/75 mt-0.5">
              You're ranked <strong className="text-white">#{myEntry.rank}</strong> out of 62 students in your cohort this week
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-serif font-bold text-brass">#{myEntry.rank}</p>
            <div className="flex items-center gap-1 text-xs text-sage justify-end mt-0.5 font-medium">
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
