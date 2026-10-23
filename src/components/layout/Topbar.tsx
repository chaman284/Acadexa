import React from 'react';
import { Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { NotificationPopover } from './NotificationPopover';
import type { AuthUser } from '../../services/authService';

interface TopbarProps {
  user: AuthUser | null;
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuToggle }) => {
  const roleBadgeColor = user?.role === 'admin' ? 'oxblood' : user?.role === 'faculty' ? 'forest' : 'rose';

  return (
    <header
      className="h-16 bg-white border-b border-[#E1D4CA] flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30"
      style={{ boxShadow: '0 2px 12px rgba(84,37,54,0.06)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-[9px] flex items-center justify-center border border-[#E1D4CA] bg-[#F7F1E8] text-[#302A2B] transition-all hover:bg-[#EEE3E0]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-[11px] font-semibold text-[#79666A] uppercase tracking-widest">
            {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
        <NotificationPopover />

        {/* User Info (no dropdown) */}
        <div className="flex items-center gap-2.5 px-2 py-1 select-none">
          <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-[#302A2B] leading-none mb-1">
              {user?.name?.split(' ')[0] || 'User'}
            </p>
            <Badge color={roleBadgeColor} className="text-[10px] py-0 px-1.5">
              {user?.role === 'admin' ? 'Admin' : user?.role === 'faculty' ? 'Faculty' : 'Student'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
