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
  { to: '/student', label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />, end: true },
  { to: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/student/quiz', label: 'Weekly Quiz', icon: <ClipboardList className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/student/question-bank', label: 'Question Bank', icon: <Database className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/student/learning-gaps', label: 'Learning Gaps', icon: <TrendingUp className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/student/tutor', label: 'AI Tutor', icon: <MessageSquare className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/student/department', label: 'Department', icon: <Building2 className="w-4.5 h-4.5 flex-shrink-0" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />, end: true },
  { to: '/admin/faculty', label: 'Faculty', icon: <Users className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/admin/courses', label: 'Courses', icon: <BookOpen className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/admin/students', label: 'Students', icon: <GraduationCap className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/admin/sections', label: 'Sections', icon: <Building2 className="w-4.5 h-4.5 flex-shrink-0" /> },
  { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4.5 h-4.5 flex-shrink-0" /> },
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

  const classMatch = useMatch('/faculty/class/:classId/*');
  const classId = classMatch?.params?.classId ?? null;

  const facultyNav: NavItem[] = classId
    ? [
        { to: `/faculty/class/${classId}`, label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />, end: true },
        { to: `/faculty/class/${classId}/analytics`, label: 'Analytics', icon: <BarChart3 className="w-4.5 h-4.5 flex-shrink-0" /> },
      ]
    : [
        { to: '/faculty/select-class', label: 'Overview', icon: <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />, end: true },
      ];

  const navItems = role === 'admin' ? adminNav : role === 'student' ? studentNav : facultyNav;
  const profileUrl = role === 'student' ? '/student/profile' : role === 'admin' ? '/admin/profile' : '/profile';
  const settingsUrl = role === 'student' ? '/student/settings' : role === 'admin' ? '/admin/settings' : '/settings';

  const handleLogout = () => {
    authService.clearCurrentUser();
    navigate('/login');
  };

  // Sidebar background: Deep Forest Olive / Black Cherry gradient
  const sidebarBg = 'linear-gradient(175deg, #34483A 0%, #302A2B 50%, #321923 100%)';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(50,25,35,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen z-50 flex flex-col',
          'transition-all duration-300 ease-in-out select-none',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          'max-md:w-[260px]',
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        )}
        style={{ background: sidebarBg, boxShadow: '2px 0 20px rgba(50,25,35,0.18)' }}
      >
        {/* ── Logo & Collapse Toggle ── */}
        <div
          className={clsx(
            'h-16 min-h-[64px] px-4 flex items-center transition-all duration-300',
            'border-b border-white/10',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {/* Official Acadexa logo: collapsed shows emblem only, expanded shows full */}
            {isCollapsed ? (
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 cursor-pointer mx-auto overflow-hidden"
                style={{ background: 'rgba(247,241,232,0.10)', border: '1px solid rgba(247,241,232,0.20)' }}
                onClick={onToggle}
                title="Expand sidebar"
              >
                <img
                  src="/acadexa-emblem.png"
                  alt="Acadexa"
                  className="w-6 h-6 object-contain select-none"
                  draggable={false}
                />
              </div>
            ) : (
              <img
                src="/acadexa-logo-light.png"
                alt="Acadexa — Assess. Identify. Improve."
                className="h-9 w-auto object-contain select-none"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
                draggable={false}
              />
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggle}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-[7px] text-white/50 hover:text-white/80 hover:bg-white/10 transition-all flex-shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onMobileClose}
            className="md:hidden text-white/50 hover:text-white/80 p-1.5 rounded-[7px] hover:bg-white/10 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Collapsed expand toggle */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center py-2.5 border-b border-white/10">
            <button
              onClick={onToggle}
              className="w-9 h-7 rounded-[7px] flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Section Label ── */}
        {!isCollapsed && (
          <div className="px-4 pt-5 pb-1.5">
            <span className="text-white/35 text-[10px] font-semibold uppercase tracking-widest">Navigation</span>
          </div>
        )}

        {/* ── Main Navigation ── */}
        <nav
          className={clsx(
            'flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-0.5',
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
                    'flex items-center text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-white/15 text-[#F7F1E8] border border-white/20'
                      : 'text-white/55 hover:text-white/85 hover:bg-white/08 border border-transparent',
                    isCollapsed
                      ? 'w-10 h-10 rounded-[10px] justify-center p-0'
                      : 'w-full gap-3 px-3.5 py-2.5 rounded-[10px]'
                  )
                }
                onClick={onMobileClose}
              >
                <span className="flex-shrink-0 flex items-center justify-center opacity-80">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="fixed left-[82px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                  <div
                    className="text-white text-xs font-medium px-3 py-1.5 rounded-[8px] whitespace-nowrap animate-fade-in"
                    style={{ background: '#302A2B', boxShadow: '0 4px 12px rgba(50,25,35,0.30)' }}
                  >
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-3 h-px bg-white/10" />

        {/* ── Bottom: Profile, Settings, Logout ── */}
        <div
          className={clsx(
            'py-3 flex flex-col gap-0.5',
            isCollapsed ? 'px-2 items-center' : 'px-3'
          )}
        >
          {/* Profile */}
          <div className="relative group w-full flex justify-center">
            <NavLink
              to={profileUrl}
              className={({ isActive }) =>
                clsx(
                  'flex items-center text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-[#F7F1E8] border border-white/20'
                    : 'text-white/55 hover:text-white/85 hover:bg-white/08 border border-transparent',
                  isCollapsed
                    ? 'w-10 h-10 rounded-[10px] justify-center p-0'
                    : 'w-full gap-3 px-3.5 py-2.5 rounded-[10px]'
                )
              }
              onClick={onMobileClose}
            >
              <User className="w-4 h-4 flex-shrink-0 opacity-80" />
              {!isCollapsed && <span className="truncate">Profile</span>}
            </NavLink>
            {isCollapsed && (
              <div className="fixed left-[82px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="text-white text-xs font-medium px-3 py-1.5 rounded-[8px] whitespace-nowrap animate-fade-in" style={{ background: '#302A2B', boxShadow: '0 4px 12px rgba(50,25,35,0.30)' }}>
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
                  'flex items-center text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-[#F7F1E8] border border-white/20'
                    : 'text-white/55 hover:text-white/85 hover:bg-white/08 border border-transparent',
                  isCollapsed
                    ? 'w-10 h-10 rounded-[10px] justify-center p-0'
                    : 'w-full gap-3 px-3.5 py-2.5 rounded-[10px]'
                )
              }
              onClick={onMobileClose}
            >
              <Settings className="w-4 h-4 flex-shrink-0 opacity-80" />
              {!isCollapsed && <span className="truncate">Settings</span>}
            </NavLink>
            {isCollapsed && (
              <div className="fixed left-[82px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="text-white text-xs font-medium px-3 py-1.5 rounded-[8px] whitespace-nowrap animate-fade-in" style={{ background: '#302A2B', boxShadow: '0 4px 12px rgba(50,25,35,0.30)' }}>
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
                'flex items-center text-[13px] font-medium transition-all duration-150',
                'text-[#C58D98] hover:text-[#EEE3E0] hover:bg-white/08 border border-transparent',
                isCollapsed
                  ? 'w-10 h-10 rounded-[10px] justify-center p-0'
                  : 'w-full gap-3 px-3.5 py-2.5 rounded-[10px]'
              )}
            >
              <LogOut className="w-4 h-4 flex-shrink-0 opacity-80" />
              {!isCollapsed && <span className="truncate">Logout</span>}
            </button>
            {isCollapsed && (
              <div className="fixed left-[82px] z-50 pointer-events-none hidden md:group-hover:flex items-center">
                <div className="text-white text-xs font-medium px-3 py-1.5 rounded-[8px] whitespace-nowrap animate-fade-in" style={{ background: '#302A2B', boxShadow: '0 4px 12px rgba(50,25,35,0.30)' }}>
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
