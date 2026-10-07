import React from 'react';
import { NavLink, useNavigate, useMatch } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, BookOpen, ClipboardList, Database,
  MessageSquare, Building2, User, Settings, LogOut,
  GraduationCap, BarChart3, X, TrendingUp,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { authService } from '../../services/authService';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const studentNav: NavItem[] = [
  { to: '/student', label: 'Overview', icon: <LayoutDashboard className="nav-icon" />, end: true },
  { to: '/student/courses', label: 'My Courses', icon: <BookOpen className="nav-icon" /> },
  { to: '/student/quiz', label: 'Weekly Quiz', icon: <ClipboardList className="nav-icon" /> },
  { to: '/student/question-bank', label: 'Question Bank', icon: <Database className="nav-icon" /> },
  { to: '/student/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="nav-icon" /> },
  { to: '/student/tutor', label: 'AI Tutor', icon: <MessageSquare className="nav-icon" /> },
  { to: '/student/department', label: 'Department', icon: <Building2 className="nav-icon" /> },
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

  // Detect if inside a class — grab classId from URL
  const classMatch = useMatch('/faculty/class/:classId/*');
  const classId = classMatch?.params?.classId ?? null;

  // Faculty nav: class-specific when inside a class
  const facultyNav: NavItem[] = classId
    ? [
        { to: `/faculty/class/${classId}`, label: 'Overview', icon: <LayoutDashboard className="nav-icon" />, end: true },
        { to: `/faculty/class/${classId}/analytics`, label: 'Analytics', icon: <BarChart3 className="nav-icon" /> },
      ]
    : [
        { to: '/faculty', label: 'Overview', icon: <LayoutDashboard className="nav-icon" />, end: true },
        { to: '/faculty/analytics', label: 'Analytics', icon: <BarChart3 className="nav-icon" /> },
      ];

  const navItems = role === 'student' ? studentNav : facultyNav;

  const handleLogout = () => {
    authService.clearCurrentUser();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen z-50 flex flex-col',
          'bg-[var(--color-primary)]',
          'transition-all duration-300',
          // Width
          isCollapsed ? 'w-[72px]' : 'w-[240px]',
          // Mobile
          'max-md:w-[240px]',
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}
      >
        {/* ── Logo / Brand ── */}
        <div className={clsx(
          'flex items-center min-h-[64px] border-b border-white/10 px-4 transition-all duration-300',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="text-white font-bold text-sm tracking-tight leading-none block">Acadexa</span>
                <span className="text-white/40 text-[10px] leading-none mt-0.5 block">
                  {role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className={clsx(
              'hidden md:flex items-center justify-center',
              'w-7 h-7 rounded-lg',
              'text-white/40 hover:text-white hover:bg-white/10',
              'transition-colors duration-150 flex-shrink-0',
              isCollapsed && 'mx-auto mt-0'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <PanelLeftOpen className="w-4 h-4" />
              : <PanelLeftClose className="w-4 h-4" />
            }
          </button>

          {/* Mobile close */}
          <button onClick={onMobileClose} className="md:hidden text-white/50 hover:text-white flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 flex flex-col gap-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'nav-item group text-white/60 hover:text-white hover:bg-white/8',
                  isActive && '!bg-[var(--color-accent)] !text-white shadow-sm',
                  isCollapsed && 'justify-center'
                )
              }
              title={isCollapsed ? item.label : undefined}
              onClick={onMobileClose}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="truncate text-[13px]">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: settings + user ── */}
        <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              clsx('nav-item text-white/60 hover:text-white hover:bg-white/8',
                isActive && '!bg-white/15 !text-white',
                isCollapsed && 'justify-center')
            }
            title={isCollapsed ? 'Profile' : undefined}
          >
            <User className="nav-icon flex-shrink-0" />
            {!isCollapsed && <span className="text-[13px] truncate">Profile</span>}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              clsx('nav-item text-white/60 hover:text-white hover:bg-white/8',
                isActive && '!bg-white/15 !text-white',
                isCollapsed && 'justify-center')
            }
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="nav-icon flex-shrink-0" />
            {!isCollapsed && <span className="text-[13px] truncate">Settings</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={clsx(
              'nav-item w-full text-white/60 hover:text-red-300 hover:bg-red-500/15',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="nav-icon flex-shrink-0" />
            {!isCollapsed && <span className="text-[13px] truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
