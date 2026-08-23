import React from 'react';
import { MepCategory } from '../../types';
import { Wrench, Zap, Droplets } from 'lucide-react';

interface CategoryBadgeProps {
  category: MepCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIcon = true }) => {
  const getCategoryDetails = () => {
    switch (category) {
      case 'Mechanical':
        return {
          label: 'Mechanical',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Wrench className="w-3.5 h-3.5 text-sky-600" />
        };
      case 'Electrical':
        return {
          label: 'Electrical',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Zap className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'Plumbing':
        return {
          label: 'Plumbing',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Droplets className="w-3.5 h-3.5 text-emerald-600" />
        };
      default:
        return {
          label: category,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null
        };
    }
  };

  const details = getCategoryDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${details.bg}`}>
      {showIcon && details.icon}
      <span>{details.label}</span>
    </span>
  );
};
