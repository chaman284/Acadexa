import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowRight, GraduationCap, LogOut,
  Sparkles, TrendingUp, TrendingDown, Minus,
  ClipboardList, FileStack,
} from 'lucide-react';
import { facultyClasses } from '../../data/facultyClasses';
import { useAuth } from '../../context/AuthContext';

// ─── Accent colours per class (light-friendly, no dark gradients) ─────────────
const ACCENTS: Record<string, { color: string; bg: string; border: string }> = {
  sec_5a_ds: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' },
  sec_5b_ds: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  sec_7c_cc: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  sec_3a_db: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
};

const getAccent = (id: string) =>
  ACCENTS[id] ?? { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' };

const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
  if (trend === 'improving') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
};

const TREND_TEXT: Record<string, string> = {
  improving: 'text-emerald-600',
  declining: 'text-rose-600',
  stable: 'text-slate-500',
};

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col selection:bg-[var(--color-accent)] selection:text-white">

      {/* ── Top Header Bar ── */}
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Acadexa</span>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/12 text-[var(--color-accent)] border border-[var(--color-accent)]/20 flex items-center justify-center font-bold text-sm">
                {(user?.name || 'F').charAt(0)}
              </div>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {user?.name || 'Professor'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full space-y-8">

        {/* Greeting */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium mb-3">
            <Sparkles className="w-3 h-3" />
            Academic Session 2026–27
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Faculty Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Select a class to view its dashboard.
          </p>
        </div>

        {/* ── Class Picker ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              Your Classes
            </h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {facultyClasses.length} assigned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facultyClasses.map(cls => {
              const acc = getAccent(cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => navigate(`/faculty/class/${cls.id}`)}
                  className="group relative flex items-center justify-between p-4 rounded-xl text-left transition-all duration-150 bg-[var(--color-surface)] border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    borderColor: acc.border,
                    borderLeftWidth: '3px',
                    borderLeftColor: acc.color,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = acc.bg;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.08)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  {/* Left content */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Section badge */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: acc.bg, color: acc.color }}
                    >
                      {cls.section}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {cls.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--color-text-muted)]">{cls.subjectCode}</span>
                        <span className="text-[var(--color-text-muted)] text-xs">·</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{cls.semester}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: stats + arrow */}
                  <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={cls.trend} />
                        <span className={`text-xs font-semibold ${TREND_TEXT[cls.trend]}`}>
                          {cls.avgScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">{cls.studentsCount}</span>
                      </div>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 group-hover:translate-x-0.5"
                      style={{ background: acc.bg, color: acc.color }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Quick Tools ── */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: <ClipboardList className="w-4 h-4" />,
                label: 'Quiz Management',
                description: 'Create and manage quizzes across all sections.',
                path: '/faculty/quizzes',
                color: '#06b6d4',
              },
              {
                icon: <FileStack className="w-4 h-4" />,
                label: 'Question Paper Bank',
                description: 'Browse and upload previous year question papers.',
                path: '/faculty/paper-bank',
                color: '#8b5cf6',
              },
            ].map(tool => (
              <button
                key={tool.path}
                onClick={() => navigate(tool.path)}
                className="group flex items-center gap-3 p-4 rounded-xl text-left bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tool.color}15`, color: tool.color }}
                >
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{tool.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{tool.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
