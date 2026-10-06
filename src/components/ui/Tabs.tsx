import React, { useState } from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, className }) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={clsx('flex gap-1 bg-[var(--color-muted)] p-1 rounded-[10px]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-150',
            active === tab.id
              ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Controlled tabs for pages that manage state externally
interface ControlledTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const ControlledTabs: React.FC<ControlledTabsProps> = ({ tabs, activeTab, onChange, className }) => (
  <div className={clsx('flex gap-1 bg-[var(--color-muted)] p-1 rounded-[10px]', className)}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-150',
          activeTab === tab.id
            ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
