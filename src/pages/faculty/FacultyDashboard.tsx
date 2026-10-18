import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowRight, Sparkles, TrendingUp, TrendingDown, Minus,
  ClipboardList, FileStack, BookOpen,
} from 'lucide-react';
import { facultyClasses, type FacultyClass } from '../../data/facultyClasses';
import api from '../../lib/apiClient';

// ─── Accent colours per class (light-friendly, no dark gradients) ─────────────
const ACCENTS: Record<string, { color: string; bg: string; border: string }> = {
  sec_5a_ds: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' },
  sec_5b_ds: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  sec_7c_cc: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  sec_3a_db: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
};

const PALETTE = [
  { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' },
  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.25)' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
  { color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' },
];

const getAccent = (id: string, index = 0) =>
  ACCENTS[id] ?? PALETTE[index % PALETTE.length];

const TrendIcon = ({ trend }: { trend?: 'improving' | 'stable' | 'declining' }) => {
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
  const [classes, setClasses] = useState<FacultyClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchClasses = async () => {
      try {
        const res = await api.get('/sections/faculty-classes');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          if (isMounted) setClasses(res.data);
        } else {
          if (isMounted) setClasses(facultyClasses);
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
        if (isMounted) setClasses(facultyClasses);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClasses();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
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
              {loading ? 'Loading...' : `${classes.length} assigned`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map(n => (
                <div
                  key={n}
                  className="h-20 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse flex items-center p-4 gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-muted)]/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[var(--color-muted)]/60" />
                    <div className="h-3 w-1/2 rounded bg-[var(--color-muted)]/40" />
                  </div>
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <BookOpen className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">No classes assigned yet</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Contact your administrator to assign course sections to your faculty account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls, idx) => {
                const acc = getAccent(cls.id, idx);
                return (
                  <button
                    key={cls.id || idx}
                    onClick={() => navigate(`/faculty/class/${cls.id}`)}
                    className="group relative flex items-center justify-between p-4 rounded-xl text-left transition-all duration-150 bg-[var(--color-surface)] border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
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
                          <span className={`text-xs font-semibold ${TREND_TEXT[cls.trend || 'stable']}`}>
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
          )}
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
    </div>
  );
};
