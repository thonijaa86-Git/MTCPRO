import React from 'react';
import { WOStatus, AssetStatus } from '../../types';

interface StatusBadgeProps {
  status: WOStatus | AssetStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Work Order Statuses
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10';
      case 'Proses':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10';
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/10';
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10';
      case 'Disetujui':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-semibold ring-1 ring-teal-600/15';

      // Asset Statuses
      case 'Operasional':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Perbaikan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Kritis':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      case 'Non-Aktif':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      // Generic Statuses
      case 'Aktif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ditunda':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expired':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Open': return 'bg-blue-500';
      case 'Proses': return 'bg-amber-500 animate-pulse';
      case 'Pending': return 'bg-slate-400';
      case 'Selesai':
      case 'Disetujui':
      case 'Operasional':
      case 'Aktif': return 'bg-emerald-500';
      case 'Perbaikan': return 'bg-amber-500';
      case 'Kritis':
      case 'Expired': return 'bg-rose-500 animate-pulse';
      default: return 'bg-slate-400';
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getBadgeStyle()} ${sizeClass} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{status}</span>
    </span>
  );
};
