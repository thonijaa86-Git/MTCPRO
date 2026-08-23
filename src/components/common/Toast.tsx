import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-slate-900 text-white border-emerald-500/50',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
                accent: 'bg-emerald-500'
              };
            case 'error':
              return {
                bg: 'bg-slate-900 text-white border-rose-500/50',
                icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
                accent: 'bg-rose-500'
              };
            case 'warning':
              return {
                bg: 'bg-slate-900 text-white border-amber-500/50',
                icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
                accent: 'bg-amber-500'
              };
            case 'info':
            default:
              return {
                bg: 'bg-slate-900 text-white border-blue-500/50',
                icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
                accent: 'bg-blue-500'
              };
          }
        };

        const s = getStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border ${s.bg} relative overflow-hidden animate-in slide-in-from-right duration-200`}
          >
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${s.accent}`} />
            {s.icon}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-semibold tracking-tight text-white">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
