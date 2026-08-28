import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Cpu,
  ClipboardList,
  CalendarClock,
  Boxes,
  Users2,
  BarChart3,
  Building2,
  ShieldCheck,
  Wrench,
  CheckCheck,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  HardHat
} from 'lucide-react';

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentUser,
    menuPermissions,
    currentView,
    setCurrentView,
    logout,
    workOrders,
    users,
    isMenuAccessibleForUser
  } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Map icon strings to Lucide components
  const getMenuIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4 shrink-0" />;
      case 'Cpu': return <Cpu className="w-4 h-4 shrink-0" />;
      case 'ClipboardList': return <ClipboardList className="w-4 h-4 shrink-0" />;
      case 'CalendarClock': return <CalendarClock className="w-4 h-4 shrink-0" />;
      case 'Boxes': return <Boxes className="w-4 h-4 shrink-0" />;
      case 'Users2': return <Users2 className="w-4 h-4 shrink-0" />;
      case 'BarChart3': return <BarChart3 className="w-4 h-4 shrink-0" />;
      case 'Building2': return <Building2 className="w-4 h-4 shrink-0" />;
      default: return <Activity className="w-4 h-4 shrink-0" />;
    }
  };

  // Filter main navigation menus (01 to 08), 09 and 10 are placed in Pengaturan Sistem section
  const accessibleMenus = menuPermissions
    .filter((menu) => menu.menuKey !== 'menu_permissions' && menu.menuKey !== 'supervisor_approval')
    .filter((menu) => isMenuAccessibleForUser(menu.menuKey, currentUser));

  // Calculate badges
  const pendingUsersCount = users.filter((u) => (u.status || '').toLowerCase().trim() === 'pending' || (u.status || '').toLowerCase().trim() === 'menunggu approval').length;
  const totalApprovalCount = pendingUsersCount;

  const myTasksCount = workOrders.filter((w) => {
    if (!currentUser) return false;
    const matchId = w.assignedToId && (w.assignedToId === currentUser.id);
    const matchName = w.assignedToName && currentUser.name && (
      w.assignedToName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      currentUser.name.toLowerCase().includes(w.assignedToName.toLowerCase()) ||
      w.assignedToName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
    const isUnassigned = !w.assignedToId || w.assignedToName === 'Tim Teknisi' || w.assignedToName === 'Unassigned';
    return (matchId || matchName || isUnassigned) && (w.status === 'Open' || w.status === 'Proses');
  }).length;

  const handleNavClick = (viewKey: string) => {
    setCurrentView(viewKey);
    setIsMobileOpen(false);
  };

  const getRoleBadgeStyle = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'supervisor':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'teknisi':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'manager':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center p-1 shadow-lg shadow-blue-500/10">
              <img src="/logo.png" alt="MTCPRO" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold tracking-tight text-white text-base">
                  MTCPRO
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MEP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                Maintenance Systems
              </p>
            </div>
          </div>
        </div>

        {/* Role Quick Status Banner */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Mode Portal:</span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(
                role
              )}`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Menus List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Menu Navigasi
          </div>

          {/* Dynamic Accessible Menus (Clean sequential numbering 01, 02, 03...) */}
          {accessibleMenus.map((menu, idx) => {
            const isActive = currentView === menu.menuKey;
            const displayNumber = (idx + 1).toString().padStart(2, '0');
            const showUserBadge = (menu.menuKey === 'team' || menu.menuKey === 'menu_permissions') && pendingUsersCount > 0;
            return (
              <button
                key={menu.menuKey}
                onClick={() => handleNavClick(menu.menuKey)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`font-mono text-[11px] font-semibold tracking-wider transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {displayNumber}
                  </span>
                  <div className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}>
                    {getMenuIcon(menu.iconName)}
                  </div>
                  <span className="truncate">{menu.menuKey === 'vendors' ? 'Perusahaan' : menu.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {showUserBadge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 animate-pulse">
                      {pendingUsersCount}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${
                      isActive ? 'opacity-100 text-blue-400 translate-x-0.5' : 'text-slate-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}

          {/* Admin / Supervisor / Dynamic System Settings: Menu Permissions & Approval Center */}
          {(isMenuAccessibleForUser('menu_permissions', currentUser) || isMenuAccessibleForUser('supervisor_approval', currentUser)) && (
            <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Pengaturan Sistem</span>
              </div>

              {/* 09. Pengaturan Akses Menu */}
              {isMenuAccessibleForUser('menu_permissions', currentUser) && (
                <button
                  onClick={() => handleNavClick('menu_permissions')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all group cursor-pointer ${
                    currentView === 'menu_permissions'
                      ? 'bg-rose-950/50 text-rose-200 font-semibold border border-rose-700/50 shadow-sm'
                      : 'text-rose-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-bold text-rose-400">09</span>
                    <SlidersHorizontal className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">Pengaturan Akses Menu</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    Admin
                  </span>
                </button>
              )}

              {/* 10. Verifikasi & Approval */}
              {isMenuAccessibleForUser('supervisor_approval', currentUser) && (
                <button
                  onClick={() => handleNavClick('supervisor_approval')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all group cursor-pointer ${
                    currentView === 'supervisor_approval'
                      ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/30'
                      : 'text-amber-300 hover:bg-slate-800/60 bg-amber-950/20 border border-amber-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {isMenuAccessibleForUser('menu_permissions', currentUser) ? '10' : '09'}
                    </span>
                    <CheckCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Verifikasi & Approval</span>
                  </div>
                  {totalApprovalCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                      {totalApprovalCount}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${
                        currentView === 'supervisor_approval' ? 'opacity-100 text-amber-400 translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
