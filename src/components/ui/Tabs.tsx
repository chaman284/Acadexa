import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  useLayoutEffect(() => {
    const updateSlider = () => {
      const el = tabRefs.current.get(active);
      if (el && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setSliderStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
          opacity: 1,
        });
      }
    };
    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [active, tabs]);

  return (
    <div
      ref={containerRef}
      className={clsx('relative flex items-center p-1 rounded-[11px] overflow-hidden select-none', className)}
      style={{ background: '#EFE7DE', border: '1px solid #E1D4CA' }}
    >
      {/* Sliding indicator pill */}
      <div
        className="absolute top-1 bottom-1 rounded-[8px] bg-white transition-all duration-300 ease-out"
        style={{
          left: `${sliderStyle.left}px`,
          width: `${sliderStyle.width}px`,
          opacity: sliderStyle.opacity,
          boxShadow: '0 2px 6px rgba(84,37,54,0.08), 0 1px 2px rgba(84,37,54,0.04)',
        }}
      />

      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={el => {
            if (el) tabRefs.current.set(tab.id, el);
            else tabRefs.current.delete(tab.id);
          }}
          onClick={() => handleChange(tab.id)}
          className={clsx(
            'relative z-10 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors duration-200 cursor-pointer',
            active === tab.id
              ? 'text-[#302A2B] font-semibold'
              : 'text-[#79666A] hover:text-[#302A2B]'
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

export const ControlledTabs: React.FC<ControlledTabsProps> = ({ tabs, activeTab, onChange, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const updateSlider = () => {
      const el = tabRefs.current.get(activeTab);
      if (el && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setSliderStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
          opacity: 1,
        });
      }
    };
    updateSlider();
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={clsx('relative flex items-center p-1 rounded-[11px] select-none', className)}
      style={{ background: '#EFE7DE', border: '1px solid #E1D4CA' }}
    >
      {/* Sliding indicator pill */}
      <div
        className="absolute top-1 bottom-1 rounded-[8px] bg-white transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: `${sliderStyle.left}px`,
          width: `${sliderStyle.width}px`,
          opacity: sliderStyle.opacity,
          boxShadow: '0 2px 6px rgba(84,37,54,0.08), 0 1px 2px rgba(84,37,54,0.04)',
        }}
      />

      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={el => {
            if (el) tabRefs.current.set(tab.id, el);
            else tabRefs.current.delete(tab.id);
          }}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'relative z-10 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors duration-200 cursor-pointer',
            activeTab === tab.id
              ? 'text-[#302A2B] font-semibold'
              : 'text-[#79666A] hover:text-[#302A2B]'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
