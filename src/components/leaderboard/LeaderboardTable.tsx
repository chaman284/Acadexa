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
  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const rankBg = ['bg-yellow-50', 'bg-gray-50', 'bg-amber-50'];

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Score</th>
            {!compact && <th>Change</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = entry.studentId === currentStudentId;
            const rankColor = rankColors[entry.rank - 1] || 'text-[var(--color-text-muted)]';
            const rankBgColor = rankBg[entry.rank - 1] || '';

            return (
              <tr
                key={entry.studentId}
                className={clsx(isCurrentUser && 'bg-[var(--color-accent-light)] !border-[var(--color-accent)]/20')}
              >
                <td>
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                      entry.rank <= 3 ? `${rankBgColor} ${rankColor}` : 'text-[var(--color-text-muted)]'
                    )}
                  >
                    {entry.rank <= 3 ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : `#${entry.rank}`}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={entry.studentName} size="sm" />
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] text-sm">
                        {entry.studentName}
                        {isCurrentUser && <span className="ml-2 text-[10px] text-[var(--color-accent)] font-semibold">(You)</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-semibold text-[var(--color-text-primary)]">{entry.score}%</span>
                </td>
                {!compact && (
                  <td>
                    <div className={clsx(
                      'flex items-center gap-1 text-xs font-medium',
                      entry.change === 'up' && 'text-[var(--color-success)]',
                      entry.change === 'down' && 'text-[var(--color-danger)]',
                      entry.change === 'same' && 'text-[var(--color-text-muted)]',
                    )}>
                      {entry.change === 'up' && <TrendingUp className="w-3 h-3" />}
                      {entry.change === 'down' && <TrendingDown className="w-3 h-3" />}
                      {entry.change === 'same' && <Minus className="w-3 h-3" />}
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
