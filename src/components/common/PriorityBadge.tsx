import React from 'react';
import { WOPriority } from '../../types';
import { Flame, AlertTriangle, Clock, ArrowDownCircle, AlertCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: WOPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getStyle = () => {
    switch (priority) {
      case 'Emergency':
      case 'Kritis':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-500/20',
          icon: <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
          label: 'Emergency'
        };
      case 'High':
      case 'Tinggi':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
          label: 'High'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Medium'
        };
      case 'Low':
      case 'Rendah':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Low'
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
