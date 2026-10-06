import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { AuthUser } from '../../services/authService';

interface DashboardLayoutProps {
  role: 'student' | 'faculty';
  user: AuthUser | null;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, user, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Sidebar
        role={role}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(prev => !prev)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main content area */}
      <div
        className={clsx(
          'transition-all duration-300 min-h-screen',
          'md:ml-[256px]',
          isCollapsed && 'md:!ml-[72px]'
        )}
      >
        <Topbar user={user} onMenuToggle={() => setIsMobileOpen(prev => !prev)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
