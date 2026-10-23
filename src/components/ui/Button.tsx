import React from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'forest' | 'brass' | 'rose' | 'sage';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-[#542536] text-[#F7F1E8] border-[#321923] shadow-[0_2px_6px_rgba(84,37,54,0.25)] hover:bg-[#321923] hover:shadow-[0_4px_14px_rgba(84,37,54,0.32)]',
  secondary: 'bg-[#302A2B] text-[#F7F1E8] border-[#1a1416] shadow-[0_2px_6px_rgba(48,42,43,0.22)] hover:bg-[#1a1416]',
  ghost:     'bg-transparent text-[#302A2B] border-transparent shadow-none hover:bg-[#EEE3E0] hover:!shadow-none hover:!translate-y-0',
  danger:    'bg-[#8b2c35] text-white border-[#6b1f26] shadow-[0_2px_6px_rgba(139,44,53,0.25)] hover:bg-[#6b1f26]',
  outline:   'bg-white text-[#542536] border-[#E1D4CA] shadow-[0_1px_3px_rgba(84,37,54,0.08)] hover:border-[#542536] hover:bg-[#EEE3E0]',
  forest:    'bg-[#34483A] text-[#F7F1E8] border-[#243129] shadow-[0_2px_6px_rgba(52,72,58,0.25)] hover:bg-[#243129]',
  brass:     'bg-[#B69A69] text-[#302A2B] border-[#9a7f52] shadow-[0_2px_6px_rgba(182,154,105,0.25)] hover:bg-[#9a7f52] hover:text-white',
  rose:      'bg-[#EEE3E0] text-[#542536] border-[#E1D4CA] shadow-[0_1px_4px_rgba(84,37,54,0.10)] hover:bg-[#C58D98] hover:text-white hover:border-[#b07585]',
  sage:      'bg-[#687B62] text-white border-[#50614b] shadow-[0_2px_6px_rgba(104,123,98,0.25)] hover:bg-[#50614b]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-[8px] gap-1.5',
  md: 'px-4.5 py-2.5 text-[13.5px] rounded-[10px] gap-2',
  lg: 'px-6 py-3 text-sm rounded-[11px] gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        'nb-btn select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
