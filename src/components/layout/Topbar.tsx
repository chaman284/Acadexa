import React, { useState } from 'react';
import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import type { AuthUser } from '../../services/authService';

interface TopbarProps {
  user: AuthUser | null;
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuToggle }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header
      className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Left: hamburger + greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0 hidden sm:block">
          <p className="text-[var(--color-text-secondary)] text-sm truncate">
            {getGreeting()},{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {user?.name?.split(' ')[0] || 'there'}
            </span>
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div
        className={`flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2 transition-all duration-200 max-w-xs w-full ${
          searchFocused ? 'ring-2 ring-[var(--color-accent)]/30' : ''
        }`}
      >
        <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search courses, topics..."
          className="bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 hover:bg-[var(--color-muted)] rounded-[10px] px-2 py-1.5 transition-colors">
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-none mb-0.5">
              {user?.name?.split(' ')[0] || 'User'}
            </p>
            <Badge color="indigo" className="text-[10px] py-0 px-1.5">
              {user?.role === 'faculty' ? 'Faculty' : '5th Sem'}
            </Badge>
          </div>
          <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)] hidden md:block" />
        </button>
      </div>
    </header>
  );
};
