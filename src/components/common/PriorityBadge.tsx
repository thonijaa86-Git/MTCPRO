import React from 'react';
import { WOPriority } from '../../types';
import { AlertCircle, AlertTriangle, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: WOPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getStyle = () => {
    switch (priority) {
      case 'Kritis':
        return {
          bg: 'bg-rose-500/10 text-rose-700 border-rose-300 ring-1 ring-rose-500/20',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />,
          label: 'Kritis'
        };
      case 'Tinggi':
        return {
          bg: 'bg-orange-500/10 text-orange-700 border-orange-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
          label: 'Tinggi'
        };
      case 'Medium':
        return {
          bg: 'bg-blue-500/10 text-blue-700 border-blue-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Medium'
        };
      case 'Rendah':
        return {
          bg: 'bg-slate-500/10 text-slate-700 border-slate-300',
          icon: <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Rendah'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null,
          label: priority
        };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.bg}`}>
      {showIcon && style.icon}
      <span>{style.label}</span>
    </span>
  );
};
