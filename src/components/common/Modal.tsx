import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '3xl': return 'max-w-3xl';
      case '4xl': return 'max-w-4xl';
      case '2xl':
      default:
        return 'max-w-2xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-full flex items-center justify-center p-2 sm:p-4 text-center">
        <div
          className={`relative bg-white rounded-xl sm:rounded-2xl text-left shadow-2xl transform transition-all w-full ${getMaxWidthClass()} border border-slate-200/90 max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto`}
        >
          {/* Header (Fixed height, no shrink) */}
          <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="pr-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Body (Scrollable with smooth scrollbar) */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 overflow-y-auto flex-1 text-xs">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
