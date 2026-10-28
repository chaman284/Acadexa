import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, TrendingDown, Minus, ArrowRight, ArrowLeft,
  ClipboardList, FileStack, ChevronRight, BarChart2, Sparkles, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { NotificationPopover } from '../../components/layout/NotificationPopover';
import { facultyClasses, type FacultyClass } from '../../data/facultyClasses';
import api from '../../lib/apiClient';

const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
    setTimeout(() => ctx.close(), 300);
  } catch (_) {}
};

export const ClassSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        console.warn('Using fallback faculty classes:', err);
        if (isMounted) setClasses(facultyClasses);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClasses();
    return () => { isMounted = false; };
  }, []);

  // Typewriter effect for welcome back message
  const facultyFirstName = user?.name ? user.name.split(' ')[0] : 'Faculty';
  const fullGreeting = `Welcome back, ${facultyFirstName}`;
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayedGreeting('');
    setIsTyping(true);
    setCursorVisible(true);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        setDisplayedGreeting(fullGreeting.slice(0, currentIndex));
        if (currentIndex >= fullGreeting.length) {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => setCursorVisible(false), 2500);
        }
      }, 65);

      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(startTimeout);
  }, [fullGreeting]);

  const handleSelectClass = (classId: string) => {
    playClickSound();
    sessionStorage.setItem('activeFacultyClassId', classId);
    navigate(`/faculty/class/${classId}`);
  };

  const handleBack = () => {
    playClickSound();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/faculty/overview');
    }
  };

  return (
    <div className="min-h-screen flex flex-col select-none bg-[#F7F1E8] overflow-y-auto">
      {/* ── Top Bar ── */}
      <header
        className="h-16 bg-white border-b border-[#E1D4CA] flex items-center justify-between px-4 md:px-8 gap-4 flex-shrink-0 sticky top-0 z-30"
        style={{ boxShadow: '0 2px 12px rgba(84,37,54,0.06)' }}
      >
        {/* Left with Back Button & Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E1D4CA] text-[#542536] hover:bg-[#542536]/10 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Back</span>
          </button>

          <div className="h-5 w-px bg-[#E1D4CA] hidden sm:block" />

          <img
            src="/acadexa-emblem.png"
            alt="Acadexa"
            className="w-7 h-7 object-contain select-none cursor-pointer"
            onClick={() => navigate('/faculty/select-class')}
          />
          <span className="text-[11px] font-bold text-[#79666A] uppercase tracking-widest hidden sm:inline">
            Faculty Portal
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <NotificationPopover />

          {/* User Info */}
          <div className="flex items-center gap-2.5 px-2 py-1 select-none">
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-[#302A2B] leading-none mb-1">
                {user?.name?.split(' ')[0] || 'User'}
              </p>
              <Badge color="forest" className="text-[10px] py-0 px-1.5 font-bold">
                Faculty
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8">
        <div className="animate-fade-in-up space-y-7">
          {/* Header Title with Typewriter Animation */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#E1D4CA]/50">
            <div>
              <h1
                className="text-2xl sm:text-3xl text-[#302A2B] font-normal tracking-tight leading-tight flex items-center min-h-[38px]"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                <span>{displayedGreeting}</span>
                <span
                  className={`inline-block w-[2.5px] h-[0.85em] bg-[#542536] ml-2 align-middle transition-opacity duration-150 ${
                    isTyping ? 'opacity-100 animate-pulse' : cursorVisible ? 'opacity-70 animate-pulse' : 'opacity-0'
                  }`}
                />
              </h1>
              <p className="text-sm text-[#79666A] mt-1 font-medium">
                Choose an assigned class below to inspect syllabus progress &amp; student analytics.
              </p>
            </div>

            <span className="text-xs font-bold text-[#542536] bg-[#542536]/10 px-3 py-1.5 rounded-full self-start sm:self-auto flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Active Academic Term
            </span>
          </div>

          {/* ── Sizable Class Cards ── */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#79666A] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#542536]" /> Assigned Classes ({classes.length})
              </span>
              <span className="text-xs text-[#79666A] font-medium">Click any class to enter class workspace</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 bg-white/50 rounded-2xl border border-[#E1D4CA]">
                <div className="w-6 h-6 border-2 border-[#542536] border-t-transparent rounded-full animate-spin mr-2.5" />
                <span className="text-xs font-semibold text-[#79666A]">Loading assigned classes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {classes.map((cls) => {
                  const trendEl =
                    cls.trend === 'improving' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#34483A] bg-[#34483A]/10 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3.5 h-3.5" /> +5%
                      </span>
                    ) : cls.trend === 'declining' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#8b2c35] bg-[#8b2c35]/10 px-2 py-0.5 rounded-md">
                        <TrendingDown className="w-3.5 h-3.5" /> Attention
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#79666A] bg-slate-100 px-2 py-0.5 rounded-md">
                        <Minus className="w-3.5 h-3.5" /> Stable
                      </span>
                    );

                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleSelectClass(cls.id)}
                      className="group bg-white rounded-2xl p-6 border-2 border-[#E1D4CA]/80 hover:border-[#542536] transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 min-h-[195px] relative overflow-hidden"
                      style={{
                        boxShadow: '0 4px 16px rgba(50,25,35,0.05)',
                      }}
                    >
                      {/* Top decorative accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#542536] to-[#C9A96E] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Section Chip + Trend */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="px-3.5 py-1 rounded-lg text-xs font-bold bg-[#542536] text-[#F7F1E8] tracking-wide shadow-xs">
                            Section {cls.section}
                          </span>
                          {trendEl}
                        </div>

                        {/* Subject Name & Semester */}
                        <h3
                          className="text-lg font-bold text-[#302A2B] group-hover:text-[#542536] transition-colors leading-snug"
                          title={cls.subject}
                        >
                          {cls.subject}
                        </h3>
                        <p className="text-xs text-[#79666A] mt-1.5 font-semibold">
                          {cls.subjectCode} · {cls.semester}
                        </p>
                      </div>

                      {/* Footer Strip */}
                      <div className="mt-5 pt-3.5 border-t border-[#E1D4CA]/70 flex items-center justify-between text-xs text-[#79666A]">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#302A2B] flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#542536]" />
                            {cls.studentsCount} Students
                          </span>
                          <span className="text-[#E1D4CA]">•</span>
                          <span className="font-bold text-[#34483A] flex items-center gap-1.5">
                            <BarChart2 className="w-4 h-4" />
                            {cls.avgScore}% Avg
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-xs text-[#542536] group-hover:translate-x-1 transition-transform">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Curriculum Tools Section Below (Big with Distinct Shades) ── */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#79666A] block mb-3.5">
              Faculty Curriculum Tools
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Quiz Management Card (Rich Oxblood / Rose Tint) */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  navigate('/faculty/quizzes');
                }}
                id="btn-quiz-management"
                className="group p-6 rounded-2xl bg-[#FAF2F4] border-2 border-[#EAD5DD] hover:border-[#542536] text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex items-center justify-between relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 14px rgba(84,37,54,0.06)',
                }}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#542536] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#542536] group-hover:text-[#381622] transition-colors">
                        Quiz Management
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#542536]/15 text-[#542536] px-2 py-0.5 rounded-full">
                        Assess
                      </span>
                    </div>
                    <p className="text-xs text-[#79666A] mt-1 font-medium leading-relaxed">
                      Create, schedule &amp; evaluate assessments with automated learning gap diagnostics
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#542536]/10 flex items-center justify-center text-[#542536] group-hover:bg-[#542536] group-hover:text-white transition-all flex-shrink-0 ml-2">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Question Paper Bank Card (Calming Deep Forest / Sage Tint) */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  navigate('/faculty/paper-bank');
                }}
                id="btn-question-paper-bank"
                className="group p-6 rounded-2xl bg-[#F1F6F3] border-2 border-[#D0E0D5] hover:border-[#34483A] text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex items-center justify-between relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 14px rgba(52,72,58,0.06)',
                }}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#34483A] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <FileStack className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#34483A] group-hover:text-[#213025] transition-colors">
                        Question Paper Bank
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#34483A]/15 text-[#34483A] px-2 py-0.5 rounded-full">
                        Library
                      </span>
                    </div>
                    <p className="text-xs text-[#79666A] mt-1 font-medium leading-relaxed">
                      Syllabus question archives, past exam papers &amp; automated blueprint paper generation
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#34483A]/10 flex items-center justify-center text-[#34483A] group-hover:bg-[#34483A] group-hover:text-white transition-all flex-shrink-0 ml-2">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
