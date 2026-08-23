import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Users2,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Wrench,
  Briefcase,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  Calendar,
  Trash2,
  Eye,
  ListFilter,
  LayoutGrid,
  Clock,
  Check,
  X,
  ShieldAlert,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const {
    currentUser,
    users,
    workOrders,
    updateUserRole,
    addUser,
    updateUser,
    approveUser,
    rejectUser,
    deleteUser,
    deleteBulkUsers,
    switchUserById
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const isAdmin = role === 'admin';
  const canManage = role === 'admin' || role === 'supervisor';

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Multi-Select
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserProfile | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  // Edit / Approve Role State
  const [newRoleSelection, setNewRoleSelection] = useState<UserRole>('teknisi');
  const [newDepartment, setNewDepartment] = useState('Mechanical & Electrical Maintenance');

  // Add User Form
  const [formUser, setFormUser] = useState({
    name: '',
    email: '',
    role: 'teknisi' as UserRole,
    phone: '+62 812-0000-0000',
    specialization: 'MEP Specialist',
    department: 'Maintenance & Operations'
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.specialization && u.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    const userStatus = u.status || 'Aktif';
    const matchesStatus =
      selectedStatusFilter === 'ALL' || userStatus === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Counters
  const pendingUsers = users.filter((u) => u.status === 'Pending');
  const activeUsers = users.filter((u) => (u.status || 'Aktif') === 'Aktif');
  const rejectedUsers = users.filter((u) => u.status === 'Ditolak');
  const technicianUsers = users.filter((u) => u.role === 'teknisi' && (u.status || 'Aktif') === 'Aktif');

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedUserIds.length} personil terpilih?`)) {
      deleteBulkUsers(selectedUserIds);
      setSelectedUserIds([]);
    }
  };

  const handleDeleteSingle = (u: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus anggota tim ${u.name} (${u.email}) dari sistem?`)) {
      deleteUser(u.id);
      setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
    }
  };

  const handleOpenApproveModal = (u: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetUser(u);
    setNewRoleSelection(u.role || 'teknisi');
    setNewDepartment(u.department || 'Mechanical & Electrical Maintenance');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (targetUser) {
      approveUser(targetUser.id, newRoleSelection, newDepartment);
      setIsApproveModalOpen(false);
      setTargetUser(null);
    }
  };

  const handleQuickReject = (u: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tolak pendaftaran akun ${u.name} (${u.email})?`)) {
      rejectUser(u.id);
    }
  };

  const handleOpenEditRole = (u: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetUser(u);
    setNewRoleSelection(u.role);
    setNewDepartment(u.department || 'Maintenance & Operations');
    setIsEditRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (targetUser) {
      updateUserRole(targetUser.id, newRoleSelection);
      if (newDepartment !== targetUser.department) {
        updateUser(targetUser.id, { department: newDepartment });
      }
      setIsEditRoleModalOpen(false);
      setTargetUser(null);
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser.name.trim() || !formUser.email.trim()) return;

    addUser({
      name: formUser.name,
      email: formUser.email,
      role: formUser.role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      phone: formUser.phone,
      specialization: formUser.specialization,
      department: formUser.department,
      joinedDate: new Date().toISOString().substring(0, 10),
      status: 'Aktif'
    });

    setIsAddUserModalOpen(false);
  };

  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin': return <Shield className="w-3.5 h-3.5 text-rose-600" />;
      case 'supervisor': return <UserCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'teknisi': return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'manager': return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
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

  const getStatusBadge = (status?: string) => {
    const s = status || 'Aktif';
    if (s === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Menunggu Approval</span>
        </span>
      );
    }
    if (s === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
          <X className="w-3 h-3" />
          <span>Ditolak</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
        <Check className="w-3 h-3" />
        <span>Aktif</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Manajemen Tim & Penentuan Role Pengguna</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar personil, verifikasi persetujuan pendaftaran akun baru, dan konfigurasi hak akses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
          </div>

          {canManage && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota Tim</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats & Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedStatusFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'ALL'
              ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Personil</span>
            <Users2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{users.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua data terdaftar</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Pending'
              ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu Approval</span>
            <Clock className={`w-4 h-4 text-amber-600 ${pendingUsers.length > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-2">{pendingUsers.length}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
            {pendingUsers.length > 0 ? 'Perlu tindakan verifikasi admin' : 'Tidak ada pendaftaran tertunda'}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Aktif')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Aktif'
              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Personil Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">{activeUsers.length}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{technicianUsers.length} Teknisi Lapangan</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Ditolak')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Ditolak'
              ? 'bg-rose-50/60 border-rose-500 shadow-sm ring-1 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Ditolak</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-2">{rejectedUsers.length}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Pendaftaran ditolak</p>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedUserIds.length}
            </span>
            <span className="font-semibold">Personil terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedUserIds([])}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium cursor-pointer transition-colors"
            >
              Batal Pilihan
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedUserIds.length} Personil Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama personil, email, atau keahlian spesialisasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Status Akun</option>
            <option value="Pending">Menunggu Approval</option>
            <option value="Aktif">Aktif</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Peran (Role)</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="teknisi">Teknisi</option>
            <option value="manager">Manager</option>
          </select>

          {(searchQuery || selectedRoleFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content: Table View or Cards View */}
      {viewMode === 'table' ? (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      title="Pilih Semua Anggota"
                    />
                  </th>
                  <th className="px-4 py-3">Nama & Profil Personil</th>
                  <th className="px-4 py-3">Kontak & Email</th>
                  <th className="px-4 py-3">Spesialisasi & Departemen</th>
                  <th className="px-4 py-3">Peran (Role)</th>
                  <th className="px-4 py-3">Status Akun</th>
                  <th className="px-4 py-3">Terdaftar</th>
                  <th className="px-4 py-3 text-right">Aksi & Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Tidak ada anggota tim yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    const isCurrent = currentUser?.id === u.id;
                    const isPending = u.status === 'Pending';
                    const activeTasks = workOrders.filter(
                      (w) => w.assignedToId === u.id && (w.status === 'Open' || w.status === 'Proses')
                    ).length;

                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserForDetail(u)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isPending ? 'bg-amber-50/30' : isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(u.id, e as any)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="truncate">{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold font-mono">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate">{u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-slate-700 text-[11px]">{u.email}</div>
                          <div className="text-[11px] font-mono text-slate-500">{u.phone || '-'}</div>
                        </td>

                        <td className="px-4 py-3.5 max-w-[180px]">
                          <div className="font-semibold text-slate-800 truncate">{u.specialization || 'MEP Specialist'}</div>
                          <div className="text-[11px] text-slate-500 truncate">{u.department || 'Maintenance Dept.'}</div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {isAdmin ? (
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                              className="text-[11px] font-mono font-bold py-1 px-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="admin">ADMIN</option>
                              <option value="supervisor">SUPERVISOR</option>
                              <option value="teknisi">TEKNISI</option>
                              <option value="manager">MANAGER</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                                u.role
                              )}`}
                            >
                              {getRoleIcon(u.role)}
                              <span>{u.role}</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(u.status)}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {u.joinedDate || '-'}
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If Pending: Show Accept & Reject buttons */}
                            {isPending && isAdmin && (
                              <>
                                <button
                                  onClick={(e) => handleOpenApproveModal(u, e)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-sm shadow-emerald-600/30 cursor-pointer transition-all"
                                  title="Setujui Pendaftaran Akun"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={(e) => handleQuickReject(u, e)}
                                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                                  title="Tolak Pendaftaran Akun"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {/* View Detail */}
                            <button
                              onClick={() => setSelectedUserForDetail(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Profil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Role / Dept */}
                            {isAdmin && (
                              <button
                                onClick={(e) => handleOpenEditRole(u, e)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Ubah Role & Departemen"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Switch to this user */}
                            {!isPending && (
                              <button
                                onClick={() => switchUserById(u.id)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Beralih ke Akun Ini"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete User */}
                            {isAdmin && (
                              <button
                                onClick={(e) => handleDeleteSingle(u, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => {
            const isSelected = selectedUserIds.includes(u.id);
            const isCurrent = currentUser?.id === u.id;
            const isPending = u.status === 'Pending';
            const activeTasks = workOrders.filter(
              (w) => w.assignedToId === u.id && (w.status === 'Open' || w.status === 'Proses')
            ).length;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUserForDetail(u)}
                className={`industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative cursor-pointer ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20'
                    : isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-50/20'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(u.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{u.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold font-mono">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase flex items-center gap-1 ${getRoleBadgeStyle(
                          u.role
                        )}`}
                      >
                        {getRoleIcon(u.role)}
                        <span>{u.role}</span>
                      </span>
                      {getStatusBadge(u.status)}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Keahlian & Dept</span>
                      <p className="font-semibold text-slate-800 line-clamp-1">{u.specialization || 'MEP Specialist'}</p>
                      <p className="text-[11px] text-slate-500">{u.department || 'Maintenance & Operations'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{u.phone || '-'}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{u.joinedDate || '-'}</span>
                      </span>
                    </div>

                    {u.role === 'teknisi' && (
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Beban Tugas Aktif:</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {activeTasks} Work Order
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPending && isAdmin ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleOpenApproveModal(u, e)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/30 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Akun</span>
                      </button>
                      <button
                        onClick={(e) => handleQuickReject(u, e)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => switchUserById(u.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Beralih ke Akun Ini
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEditRole(u, e)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Role & Departemen"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSingle(u, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Setujui Pendaftaran Akun & Tentukan Role */}
      {isApproveModalOpen && targetUser && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => {
            setIsApproveModalOpen(false);
            setTargetUser(null);
          }}
          title={`Setujui Pendaftaran: ${targetUser.name}`}
          subtitle={`Email: ${targetUser.email} • Tentukan peran (role) dan divisi sebelum mengaktifkan akun.`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Permintaan Pendaftaran Akun Baru</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Pengguna ini mendaftar dari halaman registrasi. Sebagai Administrator, tentukan role hak akses dan divisi resmi sebelum menyetujui akun aktif.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tentukan Hak Akses / Role (Wajib)
              </label>
              <select
                value={newRoleSelection}
                onChange={(e) => setNewRoleSelection(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500"
              >
                <option value="teknisi">TEKNISI (Eksekusi Work Order & Maintenance)</option>
                <option value="supervisor">SUPERVISOR (Penugasan & Verifikasi Approval)</option>
                <option value="manager">MANAGER (Executive KPI & Reporting)</option>
                <option value="admin">ADMINISTRATOR (Full Akses Sistem)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Departemen / Unit Kerja
              </label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="e.g. Mechanical Maintenance, Electrical Division"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setTargetUser(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Setujui & Aktifkan Akun</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Ubah Role & Departemen Personil */}
      {isEditRoleModalOpen && targetUser && (
        <Modal
          isOpen={isEditRoleModalOpen}
          onClose={() => {
            setIsEditRoleModalOpen(false);
            setTargetUser(null);
          }}
          title={`Ubah Role: ${targetUser.name}`}
          subtitle={`Konfigurasi hak akses modul dan struktur organisasi untuk ${targetUser.email}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pilih Peran Baru</label>
              <select
                value={newRoleSelection}
                onChange={(e) => setNewRoleSelection(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500"
              >
                <option value="teknisi">TEKNISI (Akses: Dashboard, WO, Schedule)</option>
                <option value="supervisor">SUPERVISOR (Akses: WO Approval, Tim, Aset, Schedule)</option>
                <option value="manager">MANAGER (Akses: Executive Dashboard, Report, Aset)</option>
                <option value="admin">ADMINISTRATOR (Full Akses Seluruh Fitur)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Departemen / Unit Kerja</label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditRoleModalOpen(false);
                  setTargetUser(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Tambah Anggota Tim Baru */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Tambah Anggota Tim MEP Baru"
        subtitle="Registrasi profil personil, penentuan role hak akses, dan divisi kerja"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Lengkap (Wajib)</label>
            <input
              type="text"
              required
              value={formUser.name}
              onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 text-xs"
              placeholder="e.g. Ir. Anton Wijaya"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Email Resmi</label>
              <input
                type="email"
                required
                value={formUser.email}
                onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="nama@mtcpro.co.id"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">No. Telepon / WhatsApp</label>
              <input
                type="text"
                required
                value={formUser.phone}
                onChange={(e) => setFormUser({ ...formUser, phone: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="+62 8..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Penentuan Role Hak Akses</label>
              <select
                value={formUser.role}
                onChange={(e) => setFormUser({ ...formUser, role: e.target.value as UserRole })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500 text-xs"
              >
                <option value="teknisi">TEKNISI</option>
                <option value="supervisor">SUPERVISOR</option>
                <option value="manager">MANAGER</option>
                <option value="admin">ADMINISTRATOR</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Divisi / Departemen</label>
              <input
                type="text"
                value={formUser.department}
                onChange={(e) => setFormUser({ ...formUser, department: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="e.g. Mechanical Maintenance"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Spesialisasi Teknis MEP</label>
            <input
              type="text"
              value={formUser.specialization}
              onChange={(e) => setFormUser({ ...formUser, specialization: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
              placeholder="e.g. Chiller Water Cooled, Trafo 20kV, Fire Alarm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              Simpan Anggota Tim
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detail Profil Personil & Beban Kerja */}
      {selectedUserForDetail && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Profil: ${selectedUserForDetail.name}`}
          subtitle={`ID: ${selectedUserForDetail.id} • ${selectedUserForDetail.email}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <img
                src={selectedUserForDetail.avatar}
                alt={selectedUserForDetail.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedUserForDetail.name}</h4>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                      selectedUserForDetail.role
                    )}`}
                  >
                    {selectedUserForDetail.role}
                  </span>
                </div>
                <p className="text-slate-500 text-xs">{selectedUserForDetail.specialization || 'MEP Specialist'}</p>
                <div className="pt-0.5">
                  {getStatusBadge(selectedUserForDetail.status)}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono font-bold text-slate-900">{selectedUserForDetail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">No. Telepon / WhatsApp:</span>
                <span className="font-mono text-slate-800">{selectedUserForDetail.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Divisi / Departemen:</span>
                <span className="text-slate-800 font-semibold">{selectedUserForDetail.department || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tanggal Bergabung:</span>
                <span className="font-mono text-slate-700">{selectedUserForDetail.joinedDate || '-'}</span>
              </div>
            </div>

            {selectedUserForDetail.status === 'Pending' && isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold">Pendaftaran akun ini masih menunggu persetujuan Anda</span>
                </div>
                <button
                  onClick={() => {
                    handleOpenApproveModal(selectedUserForDetail);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-sm cursor-pointer"
                >
                  Setujui Sekarang
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
