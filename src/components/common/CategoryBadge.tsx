import React from 'react';
import { MepCategory } from '../../types';
import {
  Zap,
  Cpu,
  Wind,
  Droplets,
  ShieldAlert,
  Camera,
  Flame,
  Bell,
  Waves,
  Tv,
  Building,
  Trees,
  Wrench
} from 'lucide-react';

interface CategoryBadgeProps {
  category?: MepCategory | string;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category = 'Mechanical', showIcon = true }) => {
  const getCategoryDetails = () => {
    switch (category) {
      case 'Kelistrikan':
      case 'Electrical':
        return {
          label: 'Kelistrikan',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Zap className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'Genset':
        return {
          label: 'Genset',
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: <Cpu className="w-3.5 h-3.5 text-orange-600" />
        };
      case 'HVAC':
      case 'Mechanical':
        return {
          label: 'HVAC',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Wind className="w-3.5 h-3.5 text-sky-600" />
        };
      case 'Air bersih':
      case 'Plumbing':
        return {
          label: 'Air Bersih',
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          icon: <Droplets className="w-3.5 h-3.5 text-cyan-600" />
        };
      case 'Grounding & Penyalur Petir':
        return {
          label: 'Grounding & Petir',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'CCTV':
        return {
          label: 'CCTV',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Camera className="w-3.5 h-3.5 text-purple-600" />
        };
      case 'Hydrant':
        return {
          label: 'Hydrant',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <Flame className="w-3.5 h-3.5 text-rose-600" />
        };
      case 'Fire Alarm':
        return {
          label: 'Fire Alarm',
          bg: 'bg-red-50 text-red-800 border-red-200',
          icon: <Bell className="w-3.5 h-3.5 text-red-600" />
        };
      case 'IPAL':
        return {
          label: 'IPAL',
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: <Waves className="w-3.5 h-3.5 text-teal-600" />
        };
      case 'Video Audio':
        return {
          label: 'Video Audio',
          bg: 'bg-violet-50 text-violet-800 border-violet-200',
          icon: <Tv className="w-3.5 h-3.5 text-violet-600" />
        };
      case 'Bangunan':
        return {
          label: 'Bangunan',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <Building className="w-3.5 h-3.5 text-slate-600" />
        };
      case 'Landscape':
        return {
          label: 'Landscape',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Trees className="w-3.5 h-3.5 text-emerald-600" />
        };
      default:
        return {
          label: category,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Wrench className="w-3.5 h-3.5 text-slate-500" />
        };
    }
  };

  const details = getCategoryDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${details.bg}`}>
      {showIcon && details.icon}
      <span>{details.label}</span>
    </span>
  );
};
