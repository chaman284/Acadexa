import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/student';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentStudentId?: string;
  compact?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentStudentId,
  compact = false,
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
        No leaderboard data available yet.
      </div>
    );
  }

  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const rankBg = ['bg-yellow-50', 'bg-gray-50', 'bg-amber-50'];

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white shadow-xs">
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="font-semibold text-xs text-[var(--color-text-secondary)]">Rank</th>
            <th className="font-semibold text-xs text-[var(--color-text-secondary)]">Student</th>
            <th className="font-semibold text-xs text-[var(--color-text-secondary)]">Score</th>
            {!compact && <th className="font-semibold text-xs text-[var(--color-text-secondary)]">Change</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = entry.studentId === currentStudentId;

            return (
              <tr
                key={entry.studentId}
                className={clsx(
                  'transition-colors',
                  isCurrentUser ? 'bg-oxblood/5 font-semibold' : 'hover:bg-ivory/50'
                )}
              >
                <td>
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                      entry.rank === 1 && 'bg-brass/20 text-brass font-serif font-bold border border-brass/30',
                      entry.rank === 2 && 'bg-taupe/40 text-charcoal font-serif font-bold border border-border',
                      entry.rank === 3 && 'bg-rose/20 text-oxblood font-serif font-bold border border-rose/30',
                      entry.rank > 3 && 'text-[var(--color-text-muted)] font-mono text-[11px]'
                    )}
                  >
                    {entry.rank <= 3 ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : `#${entry.rank}`}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={entry.studentName} size="sm" className="ring-1 ring-border" />
                    <div>
                      <p className="font-medium text-charcoal text-sm">
                        {entry.studentName}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-oxblood text-white font-medium">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-serif font-bold text-charcoal text-base">{entry.score}%</span>
                </td>
                {!compact && (
                  <td>
                    <div className={clsx(
                      'flex items-center gap-1 text-xs font-medium',
                      entry.change === 'up' && 'text-forest',
                      entry.change === 'down' && 'text-danger',
                      entry.change === 'same' && 'text-[var(--color-text-muted)]',
                    )}>
                      {entry.change === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                      {entry.change === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                      {entry.change === 'same' && <Minus className="w-3.5 h-3.5" />}
                      <span>
                        {entry.change === 'same' ? '—' : `${entry.change === 'up' ? '+' : '-'}${entry.changeValue}`}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
