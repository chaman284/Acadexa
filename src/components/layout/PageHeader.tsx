import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
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
          <div className="flex items-center gap-1 mb-1.5">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? 'text-xs text-[var(--color-text-muted)]'
                      : 'text-xs text-[var(--color-accent)] hover:underline cursor-pointer'
                  }
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
};
