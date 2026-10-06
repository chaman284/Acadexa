import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, BookOpen, ClipboardList, Database,
  TrendingUp, Trophy, MessageSquare, Building2,
  User, Settings, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, Users, BarChart3, FileText, Wrench, X,
} from 'lucide-react';
import { authService } from '../../services/authService';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { to: '/student', label: 'Overview', icon: <LayoutDashboard className="nav-icon" /> },
  { to: '/student/courses', label: 'My Courses', icon: <BookOpen className="nav-icon" /> },
  { to: '/student/quiz', label: 'Weekly Quiz', icon: <ClipboardList className="nav-icon" /> },
  { to: '/student/question-bank', label: 'Question Bank', icon: <Database className="nav-icon" /> },
  { to: '/student/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="nav-icon" /> },
  { to: '/student/leaderboard', label: 'Leaderboard', icon: <Trophy className="nav-icon" /> },
  { to: '/student/tutor', label: 'AI Tutor', icon: <MessageSquare className="nav-icon" /> },
  { to: '/student/department', label: 'Department Info', icon: <Building2 className="nav-icon" /> },
];

const facultyNav: NavItem[] = [
  { to: '/faculty', label: 'Overview', icon: <LayoutDashboard className="nav-icon" /> },
  { to: '/faculty/analytics', label: 'Class Analytics', icon: <BarChart3 className="nav-icon" /> },
  { to: '/faculty/students', label: 'Students', icon: <Users className="nav-icon" /> },
  { to: '/faculty/question-bank', label: 'Question Bank', icon: <Database className="nav-icon" /> },
  { to: '/faculty/quizzes', label: 'Quiz Management', icon: <ClipboardList className="nav-icon" /> },
  { to: '/faculty/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="nav-icon" /> },
  { to: '/faculty/remedial-quizzes', label: 'Remedial Quizzes', icon: <Wrench className="nav-icon" /> },
  { to: '/faculty/department', label: 'Department Info', icon: <Building2 className="nav-icon" /> },
];

const bottomNav = (role: 'student' | 'faculty') => [
  { to: '/profile', label: 'Profile', icon: <User className="nav-icon" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="nav-icon" /> },
];

interface SidebarProps {
  role: 'student' | 'faculty';
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const navItems = role === 'student' ? studentNav : facultyNav;

  const handleLogout = () => {
    authService.clearCurrentUser();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen bg-[var(--color-primary)] z-50 flex flex-col transition-all duration-300 overflow-hidden',
          isCollapsed ? 'w-[72px]' : 'w-[256px]',
          // Mobile
          'max-md:w-[256px]',
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 min-h-[64px] border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="overflow-hidden">
                <span className="text-white font-bold text-base tracking-tight">Acadexa</span>
                <p className="text-white/50 text-[10px] leading-none mt-0.5">
                  {role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center mx-auto">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden text-white/60 hover:text-white ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/faculty'}
              className={({ isActive }) =>
                clsx(
                  'nav-item text-white/70 hover:text-white hover:bg-white/10',
                  isActive && '!bg-white/15 !text-white !font-semibold',
                  isCollapsed && 'justify-center'
                )
              }
              title={isCollapsed ? item.label : undefined}
              onClick={onMobileClose}
            >
              {item.icon}
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/10 px-3 py-3 flex flex-col gap-0.5">
          {bottomNav(role).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'nav-item text-white/70 hover:text-white hover:bg-white/10',
                  isActive && '!bg-white/15 !text-white',
                  isCollapsed && 'justify-center'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className={clsx(
              'nav-item text-white/70 hover:text-white hover:bg-red-500/20 hover:!text-red-300',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="nav-icon" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-[72px] w-6 h-6 bg-white border border-[var(--color-border)] rounded-full items-center justify-center shadow-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
};
