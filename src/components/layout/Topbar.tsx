import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { NotificationPopover } from './NotificationPopover';
import { authService, type AuthUser } from '../../services/authService';

interface TopbarProps {
  user: AuthUser | null;
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuToggle }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.clearCurrentUser();
    navigate('/login');
  };

  const profilePath = user?.role === 'student' ? '/student/profile' : '/profile';
  const settingsPath = user?.role === 'student' ? '/student/settings' : '/settings';

  return (
    <header
      className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
    >
      {/* Left: hamburger only on mobile & academic portal label */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* Right: notifications + profile menu */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
        {/* Real interactive Notifications Popover */}
        <NotificationPopover />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 hover:bg-[var(--color-muted)] rounded-[10px] px-2 py-1.5 transition-colors cursor-pointer"
            aria-expanded={profileDropdownOpen}
          >
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-none mb-0.5">
                {user?.name?.split(' ')[0] || 'User'}
              </p>
              <Badge color="indigo" className="text-[10px] py-0 px-1.5 font-medium">
                {user?.role === 'faculty' ? 'Faculty' : '5th Sem · CS'}
              </Badge>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] hidden md:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--color-border)] py-1.5 z-50 animate-fade-in"
              >
                <div className="px-3 py-2 border-b border-[var(--color-border)]">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate(profilePath);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate(settingsPath);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>

                <div className="border-t border-[var(--color-border)] my-1" />

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
