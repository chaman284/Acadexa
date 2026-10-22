import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { ControlledTabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Trophy, TrendingUp } from 'lucide-react';
import api from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import type { LeaderboardEntry } from '../../types/student';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'overall', label: 'Overall' },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const meRes = await api.get('/auth/me');
        const sectionId = meRes.data?.student?.sectionId || meRes.data?.student?.section?.id || 'section-5a';
        const res = await api.get(`/analytics/leaderboard/${sectionId}`);
        if (Array.isArray(res.data)) {
          const mapped: LeaderboardEntry[] = res.data.map((item: any, idx: number) => ({
            rank: idx + 1,
            studentId: item.studentId || item.id,
            studentName: item.name,
            score: Math.round(item.averageScore || 0),
            change: 'same' as const,
            changeValue: 0,
            avatarUrl: item.avatarUrl,
          }));
          setEntries(mapped);
        }
      } catch (e) {
        console.warn('Failed to load leaderboard from API:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const myEntry = entries.find(e => e.studentId === user?.id || e.studentName === user?.name);

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
              You're ranked <strong>#{myEntry.rank}</strong> out of {entries.length} students
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-[var(--color-accent)]">#{myEntry.rank}</p>
            <div className="flex items-center gap-1 text-xs text-[var(--color-success)] justify-end">
              <TrendingUp className="w-3 h-3" />
              <span>Score: {myEntry.score}%</span>
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
          entries={entries}
          currentStudentId={user?.id || ''}
        />
      </Card>

      <p className="text-xs text-[var(--color-text-muted)] text-center">
        Leaderboard shows aggregated quiz scores. Individual topic performance data is private.
      </p>
    </div>
  );
};
