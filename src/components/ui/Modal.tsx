import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  backdropBlur?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  backdropBlur = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in transition-all",
        backdropBlur && "backdrop-blur-[6px]"
      )}
      style={{
        backgroundColor: 'rgba(32, 16, 24, 0.45)',
        backdropFilter: backdropBlur ? 'blur(6px)' : undefined,
        WebkitBackdropFilter: backdropBlur ? 'blur(6px)' : undefined,
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={clsx(
          'bg-white rounded-[18px] w-full animate-bounce-in relative z-10',
          'border border-[#E1D4CA]',
          sizeClasses[size]
        )}
        style={{ boxShadow: '0 24px 64px rgba(50,25,35,0.24), 0 8px 24px rgba(50,25,35,0.12)' }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E1D4CA]">
            <h2 className="font-semibold text-[#302A2B] text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-[#EEE3E0] text-[#79666A] hover:text-[#302A2B] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 pb-5 pt-0 flex items-center justify-end gap-3 border-t border-[#E1D4CA]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
