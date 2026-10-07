import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen, Users, TrendingUp, Award } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password, role);
      if (user.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'student' | 'faculty') => {
    setIsLoading(true);
    try {
      const demoEmail = demoRole === 'student' ? 'chaman@cs.college.edu' : 'faculty@cs.college.edu';
      const user = await login(demoEmail, 'demo', demoRole);
      if (demoRole === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch {
      setError('Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      {/* Main container */}
      <div
        className="w-full max-w-4xl bg-white rounded-[24px] overflow-hidden flex shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
        style={{ minHeight: '560px' }}
      >
        {/* Left: Illustration */}
        <div
          className="hidden md:flex flex-col justify-between p-10 w-[48%] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e2a3b 0%, #2d3f56 100%)' }}
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'var(--color-accent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'var(--color-accent)', transform: 'translate(-30%, 30%)' }} />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-9 h-9 bg-[var(--color-accent)] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">Acadexa</span>
              <p className="text-white/50 text-xs">Assess. Identify. Improve.</p>
            </div>
          </div>

          {/* Illustration content */}
          <div className="relative z-10 my-auto">
            <div className="space-y-4">
              {[
                { icon: BookOpen, title: 'Weekly Quizzes', desc: 'Test your knowledge every week', color: '#6366f1' },
                { icon: TrendingUp, title: 'Learning Gap Analysis', desc: 'Identify and bridge knowledge gaps', color: '#22c55e' },
                { icon: Users, title: 'Department Analytics', desc: 'Class performance insights for faculty', color: '#f59e0b' },
                { icon: Award, title: 'Leaderboards', desc: 'Track your rank among peers', color: '#ef4444' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/8 rounded-xl p-3 backdrop-blur-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${feature.color}25` }}
                  >
                    <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{feature.title}</p>
                    <p className="text-white/50 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="text-white/40 text-xs relative z-10">
            Department-level academic intelligence platform
          </p>
        </div>

        {/* Right: Login form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)] font-bold">Acadexa</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Welcome back!</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Continue your academic journey.</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 bg-[var(--color-muted)] rounded-[10px]">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all duration-150 ${
                role === 'student'
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('faculty')}
              className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all duration-150 ${
                role === 'faculty'
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Faculty
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              id="login-email"
              label="College Email"
              type="email"
              placeholder={role === 'student' ? 'you@cs.college.edu' : 'professor@college.edu'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <Input
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/20"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[var(--color-accent)] hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-light)] px-3 py-2 rounded-[8px]">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" fullWidth isLoading={isLoading} className="mt-1">
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Demo buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => handleDemoLogin('student')}
              id="demo-student-btn"
            >
              Demo Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => handleDemoLogin('faculty')}
              id="demo-faculty-btn"
            >
              Demo Faculty
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
            Don't have an account?{' '}
            <span className="text-[var(--color-text-secondary)] font-medium">
              Contact your department.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
