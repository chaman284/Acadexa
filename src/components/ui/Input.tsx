import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  hint,
  className,
  id,
  ...rest
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#302A2B]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#79666A]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full bg-white text-[#302A2B] text-sm font-medium',
            'placeholder:text-[#a08a8e] outline-none transition-all duration-200',
            'border rounded-[10px]',
            'py-2.5',
            leftIcon ? 'pl-10 pr-4' : 'px-4',
            rightIcon ? 'pr-10' : '',
            error
              ? 'border-[#8b2c35] shadow-[0_0_0_3px_rgba(139,44,53,0.15)]'
              : 'border-[#E1D4CA] focus:border-[#542536] focus:shadow-[0_0_0_3px_rgba(84,37,54,0.15)]',
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#79666A]">
            {rightIcon}
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#79666A]">{hint}</p>}
      {error && <p className="text-xs text-[#8b2c35] font-semibold">{error}</p>}
    </div>
  );
};
