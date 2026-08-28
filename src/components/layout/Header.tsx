import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Menu,
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCheck,
  Shield,
  Wrench,
  UserCheck2,
  Briefcase
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard Operasional MEP';
      case 'assets': return 'Pengelolaan Aset';
      case 'work_orders': return 'Manajemen Work Order (WO)';
      case 'schedules': return 'Jadwal Pemeliharaan Preventif';
      case 'spare_parts': return 'Inventaris & Stok Suku Cadang';
      case 'team': return 'Manajemen Tim & Kompetensi';
      case 'reports': return 'Laporan & Analitik Performa MEP';
      case 'vendors': return 'Direktori Perusahaan';
      case 'menu_permissions': return 'Pengaturan Hak Akses Menu';
      case 'teknisi_tasks': return 'Portal Tugas & Eksekusi Teknisi';
      case 'supervisor_approval': return 'Pusat Otorisasi & Approval Pendaftaran Akun';
      default: return 'Sistem Maintenance MEP';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {getViewTitle()}
            </h1>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              v1.0.4 PRO
            </span>
          </div>
        </div>
      </div>

      {/* Right: Authenticated User Info & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Authenticated User Status Display */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : currentUser.role === 'supervisor'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : currentUser.role === 'manager'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {currentUser.company || 'PT DAHANA (Persero)'}
              </p>
            </div>
          </div>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Notifikasi Sistem"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-center rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white ring-2 ring-white animate-pulse shadow-sm">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Notifikasi
                    </span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                        {unreadNotifs.length} baru
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Tandai Semua</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi saat ini.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkMenu) setCurrentView(n.linkMenu);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.type === 'critical'
                              ? 'bg-rose-500'
                              : n.type === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                            {n.timestamp}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
