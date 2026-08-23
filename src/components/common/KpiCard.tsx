import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
  onClick
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          indicator: 'border-l-rose-500',
          glow: 'group-hover:border-rose-300'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          indicator: 'border-l-amber-500',
          glow: 'group-hover:border-amber-300'
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          indicator: 'border-l-emerald-500',
          glow: 'group-hover:border-emerald-300'
        };
      case 'purple':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          indicator: 'border-l-indigo-500',
          glow: 'group-hover:border-indigo-300'
        };
      case 'blue':
      default:
        return {
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          indicator: 'border-l-blue-500',
          glow: 'group-hover:border-blue-300'
        };
    }
  };

  const accent = getAccentStyles();

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${accent.glow} relative overflow-hidden`}
    >
      {/* Subtle top indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        accentColor === 'rose' ? 'from-rose-500 to-rose-400' :
        accentColor === 'amber' ? 'from-amber-500 to-amber-400' :
        accentColor === 'emerald' ? 'from-emerald-500 to-emerald-400' :
        accentColor === 'purple' ? 'from-indigo-500 to-indigo-400' :
        'from-blue-600 to-blue-400'
      }`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-mono-num text-slate-900 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${accent.iconBg} shadow-xs transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && <span className="text-slate-500">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
