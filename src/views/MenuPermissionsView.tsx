import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole, MenuPermission } from '../types';
import { INITIAL_MENU_PERMISSIONS } from '../services/mockData';
import { Modal } from '../components/common/Modal';
import {
  SlidersHorizontal,
  ShieldCheck,
  Check,
  X,
  Info,
  Wrench,
  UserCheck,
  Briefcase,
  Users2,
  Search,
  RotateCcw,
  Sparkles,
  Shield,
  Settings2,
  CheckCircle2,
  Filter,
  Building2,
  Boxes,
  LayoutDashboard,
  Cpu,
  ClipboardList,
  CalendarClock,
  BarChart3,
  Layers,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  CheckCheck
} from 'lucide-react';

export const MenuPermissionsView: React.FC = () => {
  const {
    menuPermissions,
    updateMenuPermission,
    currentUser,
    users,
    vendors,
    userMenuPermissions,
    updateUserMenuPermission,
    setUserMenuPermissions,
    getDefaultMenuKeysForRole,
    isMenuAccessibleForUser,
    approveUser,
    rejectUser,
    deleteUser,
    switchUserById
  } = useApp();

  // Active Tab: 'role' (Matriks Per Peran), 'user' (Hak Akses Per Username), 'approvals' (Database Pendaftaran User)
  const [activeTab, setActiveTab] = useState<'role' | 'user' | 'approvals'>('role');

  // Search & Filters for Per-User Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedCustomFilter, setSelectedCustomFilter] = useState<string>('ALL');

  // Search & Filters for Approvals Tab
  const [approvalSearchQuery, setApprovalSearchQuery] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('ALL');

  // Modal State for Quick Config per User (Tab 2)
  const [selectedUserForConfig, setSelectedUserForConfig] = useState<UserProfile | null>(null);
  const [modalTempPermissions, setModalTempPermissions] = useState<string[]>([]);
  const [isCustomModeInModal, setIsCustomModeInModal] = useState(false);

  // Modal State for Sign Up Approval (Tab 3)
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<UserProfile | null>(null);
  const [assignedApprovalRole, setAssignedApprovalRole] = useState<UserRole>('teknisi');
  const [assignedApprovalCompany, setAssignedApprovalCompany] = useState('PT DAHANA (Persero)');
  const [assignedApprovalPosition, setAssignedApprovalPosition] = useState('MEP Specialist');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hanya Administrator sistem yang memiliki wewenang untuk mengatur izin menu.
        </p>
      </div>
    );
  }

  const isUserPending = (u: UserProfile) => {
    const s = (u.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'menunggu approval' || s === 'menunggu persetujuan';
  };
  const isUserRejected = (u: UserProfile) => (u.status || '').toLowerCase().trim() === 'ditolak';
  const isUserActive = (u: UserProfile) => !isUserPending(u) && !isUserRejected(u);

  const pendingUsers = users.filter(isUserPending);
  const activeUsers = users.filter(isUserActive);
  const rejectedUsers = users.filter(isUserRejected);

  // Guaranteed full 10 menus list
  const all10Menus: MenuPermission[] = INITIAL_MENU_PERMISSIONS.map((im) => {
    const found = menuPermissions.find((m) => m.menuKey === im.menuKey);
    return found ? { ...im, rolesAllowed: { ...im.rolesAllowed, ...found.rolesAllowed } } : im;
  });

  // Filter users from Database Team (Tab 2)
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.company && u.company.toLowerCase().includes(query)) ||
      (u.position && u.position.toLowerCase().includes(query)) ||
      (u.department && u.department.toLowerCase().includes(query));

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const hasCustom = userMenuPermissions && userMenuPermissions[u.id] !== undefined;
    const matchesCustom =
      selectedCustomFilter === 'ALL' ||
      (selectedCustomFilter === 'CUSTOM' && hasCustom) ||
      (selectedCustomFilter === 'DEFAULT' && !hasCustom);

    return matchesSearch && matchesRole && matchesCustom;
  });

  // Filter users for Approvals Tab (Tab 3)
  const filteredApprovalUsers = users.filter((u) => {
    const query = approvalSearchQuery.toLowerCase();
    const isPending = isUserPending(u);
    const isRejected = isUserRejected(u);
    const userStatus = isPending ? 'Pending' : (isRejected ? 'Ditolak' : 'Aktif');

    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone && u.phone.toLowerCase().includes(query)) ||
      (u.company && u.company.toLowerCase().includes(query)) ||
      (u.position && u.position.toLowerCase().includes(query)) ||
      (u.specialization && u.specialization.toLowerCase().includes(query));

    const matchesStatus =
      approvalStatusFilter === 'ALL' || userStatus === approvalStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCustomUsers = Object.keys(userMenuPermissions || {}).length;

  const handleOpenConfigModal = (u: UserProfile) => {
    setSelectedUserForConfig(u);
    const hasCustom = userMenuPermissions && userMenuPermissions[u.id] !== undefined;
    setIsCustomModeInModal(hasCustom);
    if (hasCustom) {
      setModalTempPermissions(userMenuPermissions[u.id]);
    } else {
      setModalTempPermissions(getDefaultMenuKeysForRole(u.role));
    }
  };

  const handleSaveModalConfig = () => {
    if (!selectedUserForConfig) return;
    if (!isCustomModeInModal) {
      // Reset to default role
      setUserMenuPermissions(selectedUserForConfig.id, null);
    } else {
      // Save custom keys
      setUserMenuPermissions(selectedUserForConfig.id, modalTempPermissions);
    }
    setSelectedUserForConfig(null);
  };

  const handleToggleModalKey = (menuKey: string) => {
    setIsCustomModeInModal(true);
    setModalTempPermissions((prev) => {
      if (prev.includes(menuKey)) {
        return prev.filter((k) => k !== menuKey);
      } else {
        return [...prev, menuKey];
      }
    });
  };

  // Open Approval Modal
  const handleOpenApprovalModal = (u: UserProfile) => {
    setSelectedUserForApproval(u);
    setAssignedApprovalRole(u.role || 'teknisi');
    setAssignedApprovalCompany(u.company || u.department || vendors[0]?.name || 'PT DAHANA (Persero)');
    setAssignedApprovalPosition(u.position || u.specialization || 'MEP Specialist');
  };

  // Execute Approval
  const handleConfirmApproval = () => {
    if (!selectedUserForApproval) return;
    approveUser(
      selectedUserForApproval.id,
      assignedApprovalRole,
      assignedApprovalCompany,
      assignedApprovalCompany,
      assignedApprovalPosition
    );
    setSelectedUserForApproval(null);
  };

  // Quick Reject
  const handleQuickReject = (u: UserProfile) => {
    if (window.confirm(`Tolak pendaftaran akun ${u.name} (${u.email})?`)) {
      rejectUser(u.id);
    }
  };

  // Delete User
  const handleDeleteUser = (u: UserProfile) => {
    if (window.confirm(`Hapus permanen akun ${u.name} (${u.email}) dari database pendaftaran?`)) {
      deleteUser(u.id);
    }
  };

  const getMenuIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-3.5 h-3.5" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5" />;
      case 'ClipboardList': return <ClipboardList className="w-3.5 h-3.5" />;
      case 'CalendarClock': return <CalendarClock className="w-3.5 h-3.5" />;
      case 'Boxes': return <Boxes className="w-3.5 h-3.5" />;
      case 'Users2': return <Users2 className="w-3.5 h-3.5" />;
      case 'BarChart3': return <BarChart3 className="w-3.5 h-3.5" />;
      case 'Building2': return <Building2 className="w-3.5 h-3.5" />;
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-3.5 h-3.5" />;
      case 'CheckCheck': return <CheckCheck className="w-3.5 h-3.5" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadgeStyle = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'supervisor': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'teknisi': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager': return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Aktif':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-600" />
            <span>Pengaturan Hak Akses & Database User (Admin Master Controller)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>Admin Master Controller</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab('role')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'role'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>Matriks Hak Akses Per Peran (Role Matrix)</span>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab('user')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'user'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users2 className="w-4 h-4 text-blue-600" />
          <span>Hak Akses Per Personil / Username</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
            {users.length}
          </span>
          {totalCustomUsers > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
              {totalCustomUsers} Kustom
            </span>
          )}
        </button>

        {/* Tab 3: Database Pendaftaran User & Persetujuan */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>Database Pendaftaran User (Sign Up Approvals)</span>
          {pendingUsers.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold animate-pulse">
              {pendingUsers.length} Menunggu
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
              {users.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ROLE MATRIX */}
      {activeTab === 'role' && (
        <div className="space-y-4">
          {/* Info Notice Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950">Cara Kerja Pengaturan Hak Akses Peran:</h4>
              <p className="mt-0.5 leading-relaxed text-blue-900">
                Centang atau hapus centang pada kotak peran di bawah ini. Pengaturan ini berlaku sebagai <strong>standar bawaan (default)</strong> bagi seluruh personil dengan peran terkait yang belum dikustomisasi secara individual.
              </p>
            </div>
          </div>

          {/* Permissions Matrix Table */}
          <div className="industrial-panel overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4 w-16 text-center font-mono">No.</th>
                    <th className="px-5 py-4">Menu Aplikasi</th>
                    <th className="px-5 py-4">Deskripsi Modul</th>
                    <th className="px-5 py-4 text-center font-mono text-rose-300">
                      <div className="flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ADMIN</span>
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center font-mono text-blue-300">
                      <div className="flex items-center justify-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>TEKNISI</span>
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center font-mono text-amber-300">
                      <div className="flex items-center justify-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>SUPERVISOR</span>
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center font-mono text-purple-300">
                      <div className="flex items-center justify-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>MANAGER</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {all10Menus.map((menu) => (
                    <tr key={menu.menuKey} className="hover:bg-slate-50/80 transition-colors">
                      {/* Number */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                          {menu.menuNumber}
                        </span>
                      </td>

                      {/* Label */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          {menu.menuKey === 'vendors' ? 'Perusahaan' : menu.label}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">/{menu.menuKey}</span>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-slate-600 max-w-sm">
                        {menu.menuKey === 'vendors'
                          ? 'Mitra spesialis pihak ketiga, perusahaan internal, dan kontak darurat'
                          : menu.description}
                      </td>

                      {/* Admin (Always Checked) */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      </td>

                      {/* Teknisi Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => updateMenuPermission(menu.menuKey, 'teknisi', !menu.rolesAllowed?.teknisi)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
                            menu.rolesAllowed?.teknisi
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Klik untuk ${menu.rolesAllowed?.teknisi ? 'menonaktifkan' : 'mengaktifkan'} akses Teknisi`}
                        >
                          {menu.rolesAllowed?.teknisi ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Supervisor Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => updateMenuPermission(menu.menuKey, 'supervisor', !menu.rolesAllowed?.supervisor)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
                            menu.rolesAllowed?.supervisor
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/20'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Klik untuk ${menu.rolesAllowed?.supervisor ? 'menonaktifkan' : 'mengaktifkan'} akses Supervisor`}
                        >
                          {menu.rolesAllowed?.supervisor ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Manager Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => updateMenuPermission(menu.menuKey, 'manager', !menu.rolesAllowed?.manager)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
                            menu.rolesAllowed?.manager
                              ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-500/20'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Klik untuk ${menu.rolesAllowed?.manager ? 'menonaktifkan' : 'mengaktifkan'} akses Manager`}
                        >
                          {menu.rolesAllowed?.manager ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PER USER PERMISSIONS */}
      {activeTab === 'user' && (
        <div className="space-y-4">
          {/* Info Notice Banner */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-950">Pengaturan Hak Akses Spesifik Per Username / Personil:</h4>
              <p className="mt-0.5 leading-relaxed text-purple-900">
                Fitur ini memungkinkan Administrator memberikan hak akses menu khusus untuk <strong>masing-masing username</strong> dari database Tim. Klik langsung pada kotak centang menu di tabel, atau gunakan tombol <strong>Atur Detail</strong>. Pengaturan ini akan menimpa (override) aturan default peran pengguna tersebut.
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama personil, email / username, perusahaan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Peran (Role)</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="teknisi">Teknisi</option>
                <option value="manager">Manager</option>
              </select>

              <select
                value={selectedCustomFilter}
                onChange={(e) => setSelectedCustomFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Status Izin</option>
                <option value="CUSTOM">Khusus Kustom ({totalCustomUsers})</option>
                <option value="DEFAULT">Default Role</option>
              </select>
            </div>
          </div>

          {/* User Permissions Interactive Matrix Table */}
          <div className="industrial-panel overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center font-mono">No.</th>
                    <th className="px-4 py-3.5 min-w-[220px]">Personil & Username</th>
                    <th className="px-3 py-3.5 text-center font-mono text-slate-300">Peran</th>
                    <th className="px-3 py-3.5 text-center font-mono text-slate-300">Status Izin</th>

                    {/* Columns for each menu */}
                    {menuPermissions.map((m) => (
                      <th
                        key={m.menuKey}
                        className="px-2.5 py-3.5 text-center font-mono text-[11px] whitespace-nowrap"
                        title={m.label}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-slate-400 font-bold">{m.menuNumber}</span>
                          <span>{m.menuKey === 'vendors' ? 'Perusahaan' : m.menuKey === 'spare_parts' ? 'SparePart' : m.menuKey === 'work_orders' ? 'WorkOrder' : m.menuKey === 'schedules' ? 'Schedule' : m.label.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}

                    <th className="px-4 py-3.5 text-right font-mono">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={menuPermissions.length + 5} className="px-6 py-12 text-center text-slate-400">
                        <Users2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Tidak ada personil yang sesuai</p>
                        <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter peran.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => {
                      const isCustom = userMenuPermissions && userMenuPermissions[u.id] !== undefined;
                      const userAllowedKeys = isCustom
                        ? userMenuPermissions[u.id]
                        : getDefaultMenuKeysForRole(u.role);

                      const isAdmin = u.role === 'admin';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Number */}
                          <td className="px-4 py-3 text-center font-mono text-slate-500 text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Personil Info */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{u.name}</div>
                                <div className="font-mono text-[11px] text-slate-500 truncate">{u.email}</div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {u.company || u.department || 'Internal'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getRoleBadgeStyle(
                                u.role
                              )}`}
                            >
                              {u.role}
                            </span>
                          </td>

                          {/* Permission Status */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {isAdmin ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                Full Access
                              </span>
                            ) : isCustom ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                Kustom ({userAllowedKeys.length}/{menuPermissions.length})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                                Default Role
                              </span>
                            )}
                          </td>

                          {/* Checkboxes for each menu */}
                          {menuPermissions.map((m) => {
                            const isChecked = isAdmin || isMenuAccessibleForUser(m.menuKey, u);

                            return (
                              <td key={m.menuKey} className="px-2.5 py-3 text-center">
                                {isAdmin ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <label className="inline-flex items-center justify-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        updateUserMenuPermission(u.id, m.menuKey, e.target.checked)
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-6 h-6 rounded flex items-center justify-center transition-all border ${
                                        isChecked
                                          ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                                      }`}
                                    >
                                      {isChecked ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      ) : (
                                        <X className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                  </label>
                                )}
                              </td>
                            );
                          })}

                          {/* Actions */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenConfigModal(u)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                title="Atur Detail Izin Menu"
                              >
                                <Settings2 className="w-3.5 h-3.5" />
                                <span>Atur Detail</span>
                              </button>

                              {!isAdmin && isCustom && (
                                <button
                                  onClick={() => setUserMenuPermissions(u.id, null)}
                                  className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Reset ke Default Role"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE PENDAFTARAN USER & PERSETUJUAN (SIGN UP APPROVAL DATABASE) */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Info Notice Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Pusat Persetujuan Pendaftaran Akun (Sign Up Database):</h4>
              <p className="mt-0.5 leading-relaxed text-emerald-900">
                Setiap pengguna yang mendaftar melalui halaman Sign Up akan masuk ke dalam database ini dengan status <strong>Menunggu Persetujuan</strong>. Administrator dapat menentukan <strong>Role (Hak Akses)</strong> dan <strong>Perusahaan</strong> personil sebelum menyetujui. Setelah disetujui, akun otomatis menjadi aktif dan <strong>langsung terdaftar di tabel Team</strong>.
              </p>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div
              onClick={() => setApprovalStatusFilter('ALL')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                approvalStatusFilter === 'ALL'
                  ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Pendaftar</span>
                <Users2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{users.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Semua data registrasi</p>
            </div>

            <div
              onClick={() => setApprovalStatusFilter('Pending')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                approvalStatusFilter === 'Pending'
                  ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu Persetujuan</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-800 mt-2">{pendingUsers.length}</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Perlu approval admin</p>
            </div>

            <div
              onClick={() => setApprovalStatusFilter('Aktif')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                approvalStatusFilter === 'Aktif'
                  ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Disetujui & Aktif</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-2">{activeUsers.length}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Terdaftar di menu Team</p>
            </div>

            <div
              onClick={() => setApprovalStatusFilter('Ditolak')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                approvalStatusFilter === 'Ditolak'
                  ? 'bg-rose-50/60 border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Ditolak</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-rose-800 mt-2">{rejectedUsers.length}</p>
              <p className="text-[10px] text-rose-600 mt-0.5">Pendaftaran ditolak</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={approvalSearchQuery}
                onChange={(e) => setApprovalSearchQuery(e.target.value)}
                placeholder="Cari nama pemohon, email / username, no telp..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={approvalStatusFilter}
                onChange={(e) => setApprovalStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Status Pendaftaran</option>
                <option value="Pending">Menunggu Persetujuan ({pendingUsers.length})</option>
                <option value="Aktif">Disetujui / Aktif ({activeUsers.length})</option>
                <option value="Ditolak">Ditolak ({rejectedUsers.length})</option>
              </select>
            </div>
          </div>

          {/* Approval Records Table */}
          <div className="industrial-panel overflow-hidden bg-white">
            <div className="overflow-x-auto">
<table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center font-mono">No.</th>
                    <th className="px-4 py-3.5 min-w-[220px]">Nama & Akun Sign Up</th>
                    <th className="px-3 py-3.5 text-center font-mono">Kata Sandi</th>
                    <th className="px-4 py-3.5">Kontak & Telepon</th>
                    <th className="px-4 py-3.5">Perusahaan & Spesialisasi</th>
                    <th className="px-3 py-3.5 text-center font-mono">Peran Diajukan</th>
                    <th className="px-3 py-3.5 text-center font-mono">Tanggal Pengajuan</th>
                    <th className="px-3 py-3.5 text-center font-mono">Status Approval</th>
                    <th className="px-4 py-3.5 text-right font-mono">Aksi Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredApprovalUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Tidak ada data pendaftaran</p>
                        <p className="text-xs text-slate-400 mt-0.5">Belum ada pengajuan pendaftaran user yang sesuai filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApprovalUsers.map((u, idx) => {
                      const userStatus = u.status || 'Aktif';
                      const isPending = userStatus === 'Pending';
                      const isRejected = userStatus === 'Ditolak';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Number */}
                          <td className="px-4 py-3 text-center font-mono text-slate-500 text-[11px]">
                            {idx + 1}
                          </td>

                          {/* User Info */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{u.name}</div>
                                <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate">{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Password (Admin Only) */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>{visiblePasswords[u.id] ? (u.password || '—') : '••••••••'}</span>
                              {u.password && (
                                <button
                                  type="button"
                                  onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                  className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer ml-0.5"
                                  title={visiblePasswords[u.id] ? "Sembunyikan password" : "Lihat password"}
                                >
                                  {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone || '-'}</span>
                            </div>
                          </td>

                          {/* Company & Position */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800 truncate">{u.company || u.department || 'PT DAHANA (Persero)'}</div>
                            <div className="text-[10px] text-slate-400 truncate">{u.position || u.specialization || 'MEP Specialist'}</div>
                          </td>

                          {/* Role */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {isPending ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100/80 text-amber-800 border border-amber-300">
                                BELUM DISET
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getRoleBadgeStyle(
                                  u.role
                                )}`}
                              >
                                {u.role}
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="px-3 py-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{u.joinedDate || '-'}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                                userStatus
                              )}`}
                            >
                              {isPending ? (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                  <span>Menunggu Approval</span>
                                </>
                              ) : isRejected ? (
                                <>
                                  <X className="w-3 h-3 text-rose-600" />
                                  <span>Ditolak</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Disetujui & Aktif</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If Pending: Show Accept & Reject */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenApprovalModal(u)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm shadow-emerald-600/30 cursor-pointer transition-all"
                                    title="Setujui dan Tentukan Role"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui & Tentukan Role</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickReject(u)}
                                    className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all"
                                    title="Tolak Pendaftaran"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              )}

                              {/* If already active or rejected: Allow edit role / approval modal or delete */}
                              {!isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenApprovalModal(u)}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                    title="Ubah Role & Perusahaan"
                                  >
                                    <Settings2 className="w-3.5 h-3.5" />
                                    <span>Ubah Role</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Data Pendaftaran"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Persetujuan Pendaftaran Akun & Penentuan Role */}
      {selectedUserForApproval && (
        <Modal
          isOpen={!!selectedUserForApproval}
          onClose={() => setSelectedUserForApproval(null)}
          title={`Persetujuan Pendaftaran: ${selectedUserForApproval.name}`}
          maxWidth="md"
          zIndex={60}
        >
          <div className="space-y-4 text-xs">
            {/* User Profile Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
              <img
                src={selectedUserForApproval.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                alt={selectedUserForApproval.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm truncate">{selectedUserForApproval.name}</div>
                <div className="font-mono text-slate-500 text-[11px] truncate">{selectedUserForApproval.email}</div>
                <div className="text-[11px] text-slate-600 font-mono truncate mt-0.5">
                  Telp: {selectedUserForApproval.phone || '-'}
                </div>
                <div className="text-[11px] text-slate-700 truncate mt-0.5">
                  Perusahaan: <span className="font-semibold text-slate-900">{selectedUserForApproval.company || selectedUserForApproval.department || '-'}</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium truncate">
                  Jabatan: {selectedUserForApproval.position || selectedUserForApproval.specialization || '-'}
                </div>
                <div className="text-[11px] text-slate-700 truncate mt-1 flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Kata Sandi (Admin):</span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                    {selectedUserForApproval.password || '(Belum diset/Default)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950">Tentukan Role & Perusahaan Personil:</span>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  Setelah tombol disetujui ditekan, user ini akan langsung aktif dan otomatis masuk ke tabel menu <strong>Team</strong> dengan hak akses sesuai role yang dipilih.
                </p>
              </div>
            </div>

            {/* Field 1: Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tentukan Peran / Hak Akses (Role)
              </label>
              <select
                value={assignedApprovalRole}
                onChange={(e) => setAssignedApprovalRole(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500 text-xs"
              >
                <option value="teknisi">TEKNISI (Akses: Dashboard, WO, Schedule)</option>
                <option value="supervisor">SUPERVISOR (Akses: WO Approval, Tim, Aset, Schedule)</option>
                <option value="manager">MANAGER (Akses: Executive Dashboard, Report, Aset)</option>
                <option value="admin">ADMINISTRATOR (Full Akses Seluruh Fitur)</option>
              </select>
            </div>

            {/* Field 2: Company Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Perusahaan
              </label>
              {vendors.length > 0 ? (
                <select
                  value={assignedApprovalCompany}
                  onChange={(e) => setAssignedApprovalCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 text-xs text-slate-800"
                >
                  <option value="PT DAHANA (Persero)">PT DAHANA (Persero) (Internal)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={assignedApprovalCompany}
                  onChange={(e) => setAssignedApprovalCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                  placeholder="e.g. PT DAHANA (Persero)"
                />
              )}
            </div>

            {/* Field 3: Position / Specialization */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jabatan / Spesialisasi
              </label>
              <input
                type="text"
                value={assignedApprovalPosition}
                onChange={(e) => setAssignedApprovalPosition(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="e.g. MEP Specialist / Teknisi Lapangan"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForApproval(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui & Tambahkan ke Team</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Atur Detail Hak Akses Personil (Tab 2) */}
      {selectedUserForConfig && (
        <Modal
          isOpen={!!selectedUserForConfig}
          onClose={() => setSelectedUserForConfig(null)}
          title={`Pengaturan Hak Akses: ${selectedUserForConfig.name}`}
          maxWidth="lg"
          zIndex={60}
        >
          <div className="space-y-4 text-xs">
            {/* Personil Profile Summary Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
              <img
                src={selectedUserForConfig.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                alt={selectedUserForConfig.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{selectedUserForConfig.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getRoleBadgeStyle(
                      selectedUserForConfig.role
                    )}`}
                  >
                    {selectedUserForConfig.role}
                  </span>
                </div>
                <div className="font-mono text-slate-500 text-[11px] truncate">{selectedUserForConfig.email}</div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                  {selectedUserForConfig.company || 'PT DAHANA (Persero)'} &bull; {selectedUserForConfig.position || 'MEP Specialist'}
                </div>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-blue-950">Mode Hak Akses Pengguna</h5>
                <p className="text-[11px] text-blue-800">
                  {isCustomModeInModal
                    ? 'Akses Kustom diaktifkan (menimpa pengaturan peran bawaan).'
                    : `Menggunakan pengaturan standar peran ${selectedUserForConfig.role.toUpperCase()}.`}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModeInModal(false);
                    setModalTempPermissions(getDefaultMenuKeysForRole(selectedUserForConfig.role));
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    !isCustomModeInModal
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Standar Role
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomModeInModal(true)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    isCustomModeInModal
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Kustom
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            {isCustomModeInModal && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => setModalTempPermissions(all10Menus.map((m) => m.menuKey))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Semua Menu ({all10Menus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalTempPermissions(['dashboard', 'work_orders', 'schedules'])}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Hanya Lapangan (Dashboard, WO, Schedule)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTempPermissions([])}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Kosongkan Semua
                </button>
              </div>
            )}

            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {all10Menus.map((m) => {
                const isSelected = modalTempPermissions.includes(m.menuKey);

                return (
                  <div
                    key={m.menuKey}
                    onClick={() => handleToggleModalKey(m.menuKey)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {getMenuIcon(m.iconName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {m.menuNumber}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {m.menuKey === 'vendors' ? 'Perusahaan' : m.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          /{m.menuKey}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Total Menu Aktif: <strong className="text-slate-800 font-mono">{modalTempPermissions.length}</strong> dari {menuPermissions.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForConfig(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalConfig}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
                >
                  Simpan Izin Pengguna
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
