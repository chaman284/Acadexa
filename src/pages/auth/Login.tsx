import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, GraduationCap,
  BookOpen, TrendingUp, Users, Award, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Warm button click sound via Web Audio API
const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
    setTimeout(() => ctx.close(), 300);
  } catch (_) {}
};


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  // If already authenticated, redirect immediately away from login
  useEffect(() => {
    if (!authLoading && user) {
      const dest =
        user.role === 'admin'
          ? '/admin'
          : user.role === 'faculty'
          ? '/faculty/select-class'
          : '/student';
      navigate(dest, { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Sliding role selector animation
  const roleContainerRef = useRef<HTMLDivElement>(null);
  const roleTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const updateSlider = () => {
      const el = roleTabRefs.current.get(role);
      if (el && roleContainerRef.current) {
        const containerRect = roleContainerRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setSliderStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
          opacity: 1,
        });
      }
    };
    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!email || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await login(email, password, role);
      if (loggedUser.role === 'admin') navigate('/admin', { replace: true });
      else if (loggedUser.role === 'faculty') navigate('/faculty/select-class', { replace: true });
      else navigate('/student', { replace: true });
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'student' | 'faculty' | 'admin') => {
    playClickSound();
    setIsLoading(true);
    setError('');
    try {
      let demoEmail = 'student@college.edu';
      let demoPassword = 'student123';
      if (demoRole === 'faculty') {
        demoEmail = 'faculty@college.edu';
        demoPassword = 'faculty123';
      } else if (demoRole === 'admin') {
        demoEmail = 'admin@college.edu';
        demoPassword = 'admin123';
      }
      const loggedUser = await login(demoEmail, demoPassword, demoRole);
      if (loggedUser.role === 'admin') navigate('/admin', { replace: true });
      else if (loggedUser.role === 'faculty') navigate('/faculty/select-class', { replace: true });
      else navigate('/student', { replace: true });
    } catch {
      setError('Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BookOpen,   title: 'Weekly Quizzes',        desc: 'Test your knowledge every week' },
    { icon: TrendingUp, title: 'Learning Gap Analysis',  desc: 'Identify and bridge knowledge gaps' },
    { icon: Users,      title: 'Department Analytics',   desc: 'Class performance insights' },
    { icon: Award,      title: 'Leaderboards',           desc: 'Track your rank among peers' },
  ];

  const roleOptions: { id: 'student' | 'faculty' | 'admin'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty', icon: BookOpen },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ background: '#F7F1E8' }}>
      {/* Main card */}
      <div
        className="w-full max-w-[980px] bg-white rounded-[26px] overflow-hidden flex flex-col md:flex-row border border-[#E1D4CA] relative"
        style={{
          boxShadow: '0 24px 64px rgba(50,25,35,0.14), 0 8px 24px rgba(50,25,35,0.06)',
          minHeight: '680px',
        }}
      >
        {/* Left Side: Aesthetic Luxurious Sidebar with Darkened Background & High Contrast */}
        <div
          className="md:w-[45%] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(18, 5, 10, 0.98) 0%, rgba(24, 7, 13, 0.95) 20%, rgba(28, 9, 15, 0.92) 50%, rgba(22, 6, 12, 0.96) 80%, rgba(14, 4, 8, 0.99) 100%), url('/login-sidebar-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRight: '1px solid rgba(247,241,232,0.12)',
          }}
        >
          {/* Top Brand Header: Official Stacked Acadexa Logo — big & luxurious */}
          <div className="relative z-10 flex items-center">
            <img
              src="/acadexa-logo-light.png"
              alt="Acadexa — Assess. Identify. Improve."
              className="w-auto object-contain select-none"
              style={{
                height: '72px',
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.40))',
              }}
            />
          </div>

          {/* Heading & Original Feature Items (Clean unboxed list, zero glass boxes, pure legibility) */}
          <div className="relative z-10 my-auto py-8">
            <h2
              className="text-[28px] sm:text-[32px] text-[#F7F1E8] font-normal leading-[1.2] tracking-tight mb-2"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              Everything you need<br />to ace academics.
            </h2>
            <p className="text-xs text-[#E8DDD3]/75 font-normal leading-relaxed mb-6">
              Department-level academic intelligence platform.
            </p>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 py-0.5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(247, 241, 232, 0.12)',
                      border: '1px solid rgba(247, 241, 232, 0.22)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <feature.icon className="w-4 h-4 text-[#F7F1E8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#F7F1E8] text-[13px] font-medium leading-tight tracking-wide">{feature.title}</p>
                    <p className="text-[#E8DDD3]/80 text-[11px] font-normal mt-1 leading-snug">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-[#E8DDD3]/60 text-[11px] font-normal leading-tight">
              Personalised insights, targeted learning & measurable progress.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="md:w-[55%] flex flex-col justify-center p-8 sm:p-10 md:p-12 bg-[#FAF6F0]">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-[30px] sm:text-[34px] text-[#302A2B] font-normal leading-tight"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              Welcome back!
            </h1>
            <p className="text-xs sm:text-sm text-[#79666A] font-normal mt-1">
              Continue your academic journey.
            </p>
          </div>

          {/* Role selector segmented control with SLIDING ANIMATION BAR */}
          <div
            ref={roleContainerRef}
            className="relative flex p-1 rounded-[13px] bg-[#EFE7DE] border border-[#E1D4CA] mb-6 select-none overflow-hidden"
          >
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-[10px] bg-[#542536] transition-all duration-300 ease-out pointer-events-none shadow-sm"
              style={{
                left: `${sliderStyle.left}px`,
                width: `${sliderStyle.width}px`,
                opacity: sliderStyle.opacity,
              }}
            />

            {roleOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = role === opt.id;
              return (
                <button
                  key={opt.id}
                  ref={el => {
                    if (el) roleTabRefs.current.set(opt.id, el);
                    else roleTabRefs.current.delete(opt.id);
                  }}
                  type="button"
                  onClick={() => { playClickSound(); setRole(opt.id); }}
                  className={`relative z-10 flex-1 py-2.5 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-white' : 'text-[#79666A] hover:text-[#302A2B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#302A2B] mb-1.5">
                College Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#79666A] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    role === 'admin'
                      ? 'admin@college.edu'
                      : role === 'faculty'
                      ? 'faculty@college.edu'
                      : 'you@college.edu'
                  }
                  autoComplete="email"
                  className="w-full h-12 bg-white border border-[#E1D4CA] rounded-[12px] pl-11 pr-4 text-sm text-[#302A2B] placeholder:text-[#79666A]/60 focus:border-[#542536] focus:ring-2 focus:ring-[#542536]/10 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#302A2B] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#79666A] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 bg-white border border-[#E1D4CA] rounded-[12px] pl-11 pr-11 text-sm text-[#302A2B] placeholder:text-[#79666A]/60 focus:border-[#542536] focus:ring-2 focus:ring-[#542536]/10 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#79666A] hover:text-[#542536] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border border-[#E1D4CA] accent-[#542536] cursor-pointer"
                />
                <span className="text-xs font-normal text-[#79666A]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs text-[#542536] hover:underline font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs font-medium text-[#8b2c35] bg-[#FAF0F2] border border-[#EAD5D9] px-3.5 py-2.5 rounded-[10px]">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={playClickSound}
              className="mt-1 w-full h-12 rounded-[12px] bg-[#542536] hover:bg-[#3d1926] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E1D4CA]" />
            <span className="text-[10px] font-semibold text-[#79666A]/80 uppercase tracking-widest">
              OR
            </span>
            <div className="flex-1 h-px bg-[#E1D4CA]" />
          </div>

          {/* Quick Demo Section */}
          <div>
            <span className="text-[10px] font-bold text-[#79666A] uppercase tracking-wider text-center block mb-2">
              QUICK DEMO
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                id="demo-student-btn"
                className="h-11 rounded-[12px] bg-[#F7F1E8] hover:bg-[#EFE7DE] border border-[#E1D4CA] text-xs font-medium text-[#302A2B] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#542536]" />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('faculty')}
                disabled={isLoading}
                id="demo-faculty-btn"
                className="h-11 rounded-[12px] bg-[#F7F1E8] hover:bg-[#EFE7DE] border border-[#E1D4CA] text-xs font-medium text-[#302A2B] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#687B62]" />
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                id="demo-admin-btn"
                className="h-11 rounded-[12px] bg-[#F7F1E8] hover:bg-[#EFE7DE] border border-[#E1D4CA] text-xs font-medium text-[#302A2B] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#542536]" />
                Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#79666A] font-normal mt-5">
            Don't have an account?{' '}
            <span className="text-[#542536] font-semibold cursor-pointer hover:underline">
              Contact your department.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
