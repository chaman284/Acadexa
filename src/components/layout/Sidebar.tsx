import React from 'react';
import { NavLink, useNavigate, useMatch } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, BookOpen, ClipboardList, Database,
  MessageSquare, Building2, User, Settings, LogOut,
  GraduationCap, BarChart3, X, TrendingUp,
  PanelLeftClose, PanelLeftOpen, Users, Bell,
} from 'lucide-react';
import { authService } from '../../services/authService';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const studentNav: NavItem[] = [
  { to: '/student', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, end: true },
  { to: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
  { to: '/student/quiz', label: 'Weekly Quiz', icon: <ClipboardList className="w-5 h-5 flex-shrink-0" /> },
  { to: '/student/question-bank', label: 'Question Bank', icon: <Database className="w-5 h-5 flex-shrink-0" /> },
  { to: '/student/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="w-5 h-5 flex-shrink-0" /> },
  { to: '/student/tutor', label: 'AI Tutor', icon: <MessageSquare className="w-5 h-5 flex-shrink-0" /> },
  { to: '/student/department', label: 'Department', icon: <Building2 className="w-5 h-5 flex-shrink-0" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, end: true },
  { to: '/admin/faculty', label: 'Faculty', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
  { to: '/admin/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
  { to: '/admin/students', label: 'Students', icon: <GraduationCap className="w-5 h-5 flex-shrink-0" /> },
  { to: '/admin/sections', label: 'Sections', icon: <Building2 className="w-5 h-5 flex-shrink-0" /> },
  { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5 flex-shrink-0" /> },
];

interface SidebarProps {
  role: 'student' | 'faculty' | 'admin';
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

  // Detect if inside a class — grab classId from URL
  const classMatch = useMatch('/faculty/class/:classId/*');
  const classId = classMatch?.params?.classId ?? null;

  // Faculty nav: class-specific when inside a class
  const facultyNav: NavItem[] = classId
    ? [
        { to: `/faculty/class/${classId}`, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, end: true },
        { to: `/faculty/class/${classId}/analytics`, label: 'Analytics', icon: <BarChart3 className="w-5 h-5 flex-shrink-0" /> },
      ]
    : [
        { to: '/faculty', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, end: true },
        { to: '/faculty/quizzes', label: 'Quizzes', icon: <ClipboardList className="w-5 h-5 flex-shrink-0" /> },
        { to: '/faculty/paper-bank', label: 'Question Papers', icon: <Database className="w-5 h-5 flex-shrink-0" /> },
        { to: '/faculty/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5 flex-shrink-0" /> },
        { to: '/faculty/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="w-5 h-5 flex-shrink-0" /> },
      ];

  const navItems = role === 'admin' ? adminNav : role === 'student' ? studentNav : facultyNav;
  const profileUrl = role === 'student' ? '/student/profile' : role === 'admin' ? '/admin/profile' : '/profile';
  const settingsUrl = role === 'student' ? '/student/settings' : role === 'admin' ? '/admin/settings' : '/settings';

  const handleLogout = () => {
    authService.clearCurrentUser();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen z-50 flex flex-col',
          'bg-[var(--color-primary)] text-white shadow-xl',
          'transition-all duration-300 ease-in-out select-none',
          isCollapsed ? 'w-[72px]' : 'w-[256px]',
          'max-md:w-[256px]',
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* ── Logo & Collapse Toggle Bar ── */}
        <div
          className={clsx(
            'h-16 min-h-[64px] border-b border-white/10 px-3.5 flex items-center transition-all duration-300',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {/* Logo icon + brand title */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div
              className={clsx(
                'w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm cursor-pointer transition-transform hover:scale-105',
                isCollapsed && 'mx-auto'
              )}
              onClick={isCollapsed ? onToggle : undefined}
              title={isCollapsed ? 'Expand sidebar' : 'Acadexa'}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden min-w-0">
                <span className="text-white font-bold text-sm tracking-tight leading-none block truncate">
                  Acadexa
                </span>
                <span className="text-white/50 text-[10px] leading-none mt-1 block truncate">
                  {role === 'admin' ? 'Admin Portal' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button (Shown only when sidebar is expanded) */}
          {!isCollapsed && (
            <button
              onClick={onToggle}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Expand Toggle when collapsed (Clean icon button row) */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center py-2.5 border-b border-white/10">
            <button
              onClick={onToggle}
              className="w-10 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Main Navigation List ── */}
        <nav
          className={clsx(
            'flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-1.5',
            isCollapsed ? 'px-2 items-center' : 'px-3'
          )}
        >
          {navItems.map(item => (
            <div key={item.to} className="relative group w-full flex justify-center">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center text-sm font-medium transition-all duration-150',
                    isActive
                      ? '!bg-[var(--color-accent)] !text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                    isCollapsed
                      ? 'w-11 h-11 rounded-xl justify-center p-0'
                      : 'w-full gap-3 px-3.5 py-2.5 rounded-xl'
                  )
                }
                onClick={onMobileClose}
              >
                <span className="flex-shrink-0 flex items-center justify-center">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate text-[13px]">{item.label}</span>
                )}
              </NavLink>

              {/* High-Contrast Floating Tooltip on Collapsed Mode */}
              {isCollapsed && (
                <div className="fixed left-[78px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                  <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap animate-fade-in">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Bottom Section: Profile, Settings, Logout ── */}
        <div
          className={clsx(
            'border-t border-white/10 py-3 flex flex-col gap-1.5',
            isCollapsed ? 'px-2 items-center' : 'px-3'
          )}
        >
          {/* Profile */}
          <div className="relative group w-full flex justify-center">
            <NavLink
              to={profileUrl}
              className={({ isActive }) =>
                clsx(
                  'flex items-center text-sm font-medium transition-all duration-150',
                  isActive
                    ? '!bg-white/20 !text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                  isCollapsed
                    ? 'w-11 h-11 rounded-xl justify-center p-0'
                    : 'w-full gap-3 px-3.5 py-2.5 rounded-xl'
                )
              }
              onClick={onMobileClose}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate">Profile</span>}
            </NavLink>
            {isCollapsed && (
              <div className="fixed left-[78px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap animate-fade-in">
                  Profile
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative group w-full flex justify-center">
            <NavLink
              to={settingsUrl}
              className={({ isActive }) =>
                clsx(
                  'flex items-center text-sm font-medium transition-all duration-150',
                  isActive
                    ? '!bg-white/20 !text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                  isCollapsed
                    ? 'w-11 h-11 rounded-xl justify-center p-0'
                    : 'w-full gap-3 px-3.5 py-2.5 rounded-xl'
                )
              }
              onClick={onMobileClose}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate">Settings</span>}
            </NavLink>
            {isCollapsed && (
              <div className="fixed left-[78px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap animate-fade-in">
                  Settings
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={handleLogout}
              className={clsx(
                'flex items-center text-sm font-medium transition-all duration-150 text-white/70 hover:text-rose-200 hover:bg-rose-500/20',
                isCollapsed
                  ? 'w-11 h-11 rounded-xl justify-center p-0'
                  : 'w-full gap-3 px-3.5 py-2.5 rounded-xl'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-rose-400" />
              {!isCollapsed && <span className="text-[13px] truncate text-rose-300">Logout</span>}
            </button>
            {isCollapsed && (
              <div className="fixed left-[78px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap animate-fade-in">
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
