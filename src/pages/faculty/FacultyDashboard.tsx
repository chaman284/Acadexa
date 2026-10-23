import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowRight, Sparkles, TrendingUp, TrendingDown, Minus,
  ClipboardList, FileStack, BookOpen,
} from 'lucide-react';
import { facultyClasses, type FacultyClass } from '../../data/facultyClasses';
import api from '../../lib/apiClient';

// ─── Oxblood, Ivory & Sage accents per class ──────────────────────────────────
const ACCENTS = [
  { color: '#542536', bg: 'rgba(84,37,54,0.07)',    border: 'rgba(84,37,54,0.18)' },
  { color: '#34483A', bg: 'rgba(52,72,58,0.07)',    border: 'rgba(52,72,58,0.18)' },
  { color: '#B69A69', bg: 'rgba(182,154,105,0.09)', border: 'rgba(182,154,105,0.22)' },
  { color: '#687B62', bg: 'rgba(104,123,98,0.07)',  border: 'rgba(104,123,98,0.18)' },
  { color: '#C58D98', bg: 'rgba(197,141,152,0.08)', border: 'rgba(197,141,152,0.20)' },
  { color: '#302A2B', bg: 'rgba(48,42,43,0.06)',    border: 'rgba(48,42,43,0.16)' },
];

const getAccent = (index = 0) => ACCENTS[index % ACCENTS.length];

const TrendIcon = ({ trend }: { trend?: 'improving' | 'stable' | 'declining' }) => {
  if (trend === 'improving') return <TrendingUp className="w-3.5 h-3.5 text-[#34483A]" />;
  if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-[#8b2c35]" />;
  return <Minus className="w-3.5 h-3.5 text-[#79666A]" />;
};

const TREND_TEXT: Record<string, string> = {
  improving: 'text-[#34483A]',
  declining:  'text-[#8b2c35]',
  stable:     'text-[#79666A]',
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
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[#687B62] text-xs font-semibold mb-3"
          style={{ background: 'rgba(104,123,98,0.10)', border: '1px solid rgba(104,123,98,0.20)' }}
        >
          <Sparkles className="w-3 h-3" />
          Academic Session 2026–27
        </div>
        <h1
          className="text-[26px] font-normal text-[#302A2B] leading-tight"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Faculty Dashboard
        </h1>
        <p className="text-sm font-medium text-[#79666A] mt-1">
          Select a class below to view its analytics and manage assignments.
        </p>
      </div>

      {/* ── Class Picker ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-[#79666A] uppercase tracking-widest">
            Your Classes
          </h2>
          <span className="text-xs font-medium text-[#79666A]">
            {loading ? 'Loading…' : `${classes.length} assigned`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(n => (
              <div
                key={n}
                className="h-20 rounded-[14px] bg-white border border-[#E1D4CA] animate-pulse flex items-center p-4 gap-3"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#EEE3E0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[#EEE3E0]" />
                  <div className="h-3 w-1/2 rounded bg-[#EEE3E0]" />
                </div>
              </div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="p-8 text-center rounded-[14px] border border-[#E1D4CA] bg-white">
            <BookOpen className="w-8 h-8 mx-auto text-[#a08a8e] mb-2" />
            <p className="text-sm font-semibold text-[#302A2B]">No classes assigned yet</p>
            <p className="text-xs text-[#79666A] font-medium mt-1">Contact your administrator to assign course sections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((cls, idx) => {
              const accent = getAccent(idx);
              return (
                <button
                  key={cls.id || idx}
                  onClick={() => navigate(`/faculty/class/${cls.id}`)}
                  className="group relative flex items-center justify-between p-4 rounded-[14px] text-left transition-all duration-200 bg-white border border-[#E1D4CA] cursor-pointer hover:shadow-[0_6px_20px_rgba(84,37,54,0.10)] hover:-translate-y-0.5"
                  style={{ boxShadow: '0 2px 8px rgba(84,37,54,0.07)' }}
                >
                  {/* Accent left bar */}
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: accent.color }} />

                  {/* Left content */}
                  <div className="flex items-center gap-3 min-w-0 pl-3">
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
                    >
                      {cls.section}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#302A2B] truncate">
                        {cls.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-[#79666A]">{cls.subjectCode}</span>
                        <span className="text-[#a08a8e] text-xs">·</span>
                        <span className="text-xs font-medium text-[#79666A]">{cls.semester}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: stats + arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={cls.trend} />
                        <span className={`text-xs font-semibold ${TREND_TEXT[cls.trend || 'stable']}`}>
                          {cls.avgScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#79666A]">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">{cls.studentsCount}</span>
                      </div>
                    </div>
                    <div
                      className="w-8 h-8 rounded-[8px] bg-[#F7F1E8] text-[#79666A] flex items-center justify-center transition-all duration-200 group-hover:bg-[#542536] group-hover:text-white"
                      style={{ border: '1px solid #E1D4CA' }}
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
        <h2 className="text-[11px] font-semibold text-[#79666A] uppercase tracking-widest mb-3">
          Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <ClipboardList className="w-5 h-5" />,
              label: 'Quiz Management',
              description: 'Create and manage quizzes across all sections.',
              path: '/faculty/quizzes',
              accent: ACCENTS[0],
            },
            {
              icon: <FileStack className="w-5 h-5" />,
              label: 'Question Paper Bank',
              description: 'Browse and upload previous year question papers.',
              path: '/faculty/paper-bank',
              accent: ACCENTS[1],
            },
          ].map(tool => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group flex items-center gap-3.5 p-4 rounded-[14px] text-left bg-white border border-[#E1D4CA] transition-all duration-200 cursor-pointer hover:shadow-[0_6px_20px_rgba(84,37,54,0.10)] hover:-translate-y-0.5"
              style={{ boxShadow: '0 2px 8px rgba(84,37,54,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ background: tool.accent.bg, border: `1px solid ${tool.accent.border}`, color: tool.accent.color }}
              >
                {tool.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#302A2B]">{tool.label}</p>
                <p className="text-xs font-medium text-[#79666A] mt-0.5 truncate">{tool.description}</p>
              </div>
              <div
                className="w-8 h-8 rounded-[8px] bg-[#F7F1E8] text-[#79666A] flex items-center justify-center group-hover:bg-[#542536] group-hover:text-white transition-all flex-shrink-0"
                style={{ border: '1px solid #E1D4CA' }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
