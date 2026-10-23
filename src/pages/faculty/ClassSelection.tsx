import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, TrendingDown, Minus, ArrowRight,
  ClipboardList, FileStack, ChevronRight, BarChart2
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

  return (
    <div
      className="h-screen max-h-screen flex flex-col overflow-hidden select-none bg-[#F7F1E8]"
    >
      {/* ── Top Bar (Identical to Overview Page) ── */}
      <header
        className="h-16 bg-white border-b border-[#E1D4CA] flex items-center justify-between px-4 md:px-6 gap-4 flex-shrink-0 sticky top-0 z-30"
        style={{ boxShadow: '0 2px 12px rgba(84,37,54,0.06)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/acadexa-emblem.png"
            alt="Acadexa"
            className="w-7 h-7 object-contain select-none cursor-pointer"
            onClick={() => navigate('/faculty/select-class')}
          />
          <span className="text-[11px] font-semibold text-[#79666A] uppercase tracking-widest">
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
              <Badge color="forest" className="text-[10px] py-0 px-1.5">
                Faculty
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area (Centered, compact, no scroll) ── */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 overflow-hidden">
        <div className="animate-fade-in-up space-y-5">
          {/* Header Title with Typewriter Animation */}
          <div>
            <h1
              className="text-2xl sm:text-[26px] text-[#302A2B] font-normal tracking-tight leading-tight flex items-center min-h-[34px]"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              <span>{displayedGreeting}</span>
              <span
                className={`inline-block w-[2px] h-[0.85em] bg-[#542536] ml-1.5 align-middle transition-opacity duration-150 ${
                  isTyping ? 'opacity-100 animate-pulse' : cursorVisible ? 'opacity-70 animate-pulse' : 'opacity-0'
                }`}
              />
            </h1>
            <p className="text-xs text-[#79666A] mt-1 font-medium">
              Choose an assigned class below to open its overview & student analytics.
            </p>
          </div>

          {/* ── Compact Class Cards ── */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#542536] border-t-transparent rounded-full animate-spin mr-2.5" />
              <span className="text-xs text-[#79666A]">Loading classes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {classes.map((cls) => {
                const trendEl =
                  cls.trend === 'improving' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#34483A]">
                      <TrendingUp className="w-3 h-3" /> +5%
                    </span>
                  ) : cls.trend === 'declining' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8b2c35]">
                      <TrendingDown className="w-3 h-3" /> Attn
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#79666A]">
                      <Minus className="w-3 h-3" /> Stable
                    </span>
                  );

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className="group bg-white rounded-xl p-4 border border-[#E1D4CA] hover:border-[#542536]/50 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      boxShadow: '0 2px 8px rgba(50,25,35,0.04)',
                    }}
                  >
                    <div>
                      {/* Section Chip + Trend */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-[7px] text-[11px] font-bold bg-[#542536] text-[#F7F1E8]">
                          Section {cls.section}
                        </span>
                        {trendEl}
                      </div>

                      {/* Subject Name & Semester */}
                      <h3
                        className="text-base font-medium text-[#302A2B] group-hover:text-[#542536] transition-colors truncate"
                        title={cls.subject}
                      >
                        {cls.subject}
                      </h3>
                      <p className="text-[11px] text-[#79666A] mt-0.5 font-medium">
                        {cls.subjectCode} · {cls.semester}
                      </p>
                    </div>

                    {/* Compact Footer Strip */}
                    <div className="mt-4 pt-2.5 border-t border-[#E1D4CA]/50 flex items-center justify-between text-[11px] text-[#79666A]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#302A2B] flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#542536]" />
                          {cls.studentsCount}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-[#34483A] flex items-center gap-1">
                          <BarChart2 className="w-3 h-3" />
                          {cls.avgScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-[#542536] group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Curriculum Tools Section Below ── */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#79666A] block mb-2">
              Curriculum Tools
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quiz Management Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  navigate('/faculty/quizzes');
                }}
                id="btn-quiz-management"
                className="group h-12 px-4 rounded-xl bg-white border border-[#E1D4CA] hover:border-[#542536]/40 text-left transition-all duration-150 hover:shadow-sm cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-[#542536]/10 text-[#542536] flex items-center justify-center flex-shrink-0 group-hover:bg-[#542536] group-hover:text-white transition-colors">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-[#302A2B] group-hover:text-[#542536] transition-colors truncate">
                      Quiz Management
                    </h4>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#79666A] group-hover:text-[#542536] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </button>

              {/* Question Paper Bank Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  navigate('/faculty/paper-bank');
                }}
                id="btn-question-paper-bank"
                className="group h-12 px-4 rounded-xl bg-white border border-[#E1D4CA] hover:border-[#34483A]/40 text-left transition-all duration-150 hover:shadow-sm cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-[#34483A]/10 text-[#34483A] flex items-center justify-center flex-shrink-0 group-hover:bg-[#34483A] group-hover:text-white transition-colors">
                    <FileStack className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-[#302A2B] group-hover:text-[#34483A] transition-colors truncate">
                      Question Paper Bank
                    </h4>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#79666A] group-hover:text-[#34483A] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
