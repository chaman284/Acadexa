import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-[#a08a8e]" />}
                <span
                  onClick={() => {
                    if (crumb.to) window.location.hash = '';
                    if (crumb.href) window.location.href = crumb.href;
                  }}
                  className={
                    i === breadcrumbs.length - 1
                      ? 'text-xs font-medium text-[#a08a8e]'
                      : 'text-xs font-semibold text-[#542536] hover:underline cursor-pointer'
                  }
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1
          className="text-[22px] font-normal text-[#302A2B] tracking-tight leading-snug"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#79666A] font-medium mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
};
