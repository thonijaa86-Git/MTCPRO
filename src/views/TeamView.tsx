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
  Wrench,
  Briefcase,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const {
    currentUser,
    users,
    workOrders,
    updateUserRole,
    addUser,
    switchUserById
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'manager';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [newRoleSelection, setNewRoleSelection] = useState<UserRole>('teknisi');

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

    return matchesSearch && matchesRole;
  });

  const handleOpenEditRole = (u: UserProfile) => {
    setTargetUser(u);
    setNewRoleSelection(u.role);
    setIsEditRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (targetUser) {
      updateUserRole(targetUser.id, newRoleSelection);
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
      joinedDate: new Date().toISOString().substring(0, 10)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Manajemen Tim & Pengaturan Role Pengguna</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar personil teknisi, supervisor, manajer, dan konfigurasi hak akses
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota Tim</span>
          </button>
        )}
      </div>

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
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u) => {
          const assignedWOs = workOrders.filter(
            (w) => w.assignedToId === u.id && w.status !== 'Disetujui'
          );
          const isMe = currentUser?.id === u.id;

          return (
            <div
              key={u.id}
              className="industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {u.name}
                        </h3>
                        {isMe && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                      u.role
                    )}`}
                  >
                    {getRoleIcon(u.role)}
                    <span>{u.role}</span>
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Spesialisasi Teknis:
                    </span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {u.specialization || 'MEP Generalist'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{u.phone || '-'}</span>
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Sejak {u.joinedDate || '2023'}</span>
                    </span>
                  </div>

                  {u.role === 'teknisi' && (
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Beban Tugas Aktif:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          assignedWOs.length > 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : assignedWOs.length > 0
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {assignedWOs.length} Work Order
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => switchUserById(u.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Beralih ke Akun Ini
                </button>

                {canManage && (
                  <button
                    onClick={() => handleOpenEditRole(u)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
                    title="Ubah Role Pengguna"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Role</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Role Modal */}
      {isEditRoleModalOpen && targetUser && (
        <Modal
          isOpen={isEditRoleModalOpen}
          onClose={() => {
            setIsEditRoleModalOpen(false);
            setTargetUser(null);
          }}
          title={`Ubah Role: ${targetUser.name}`}
          subtitle={`Email: ${targetUser.email}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Pilih Tingkat Hak Akses (Role)
              </label>
              <div className="space-y-2">
                {(['admin', 'supervisor', 'teknisi', 'manager'] as UserRole[]).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newRoleSelection === r
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-bold text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleOption"
                      value={r}
                      checked={newRoleSelection === r}
                      onChange={() => setNewRoleSelection(r)}
                      className="sr-only"
                    />
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getRoleIcon(r)}
                    </div>
                    <div className="flex-1 uppercase font-mono tracking-wider text-xs">
                      {r}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
              >
                Simpan Perubahan Role
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Tambah Personil Tim Baru"
        subtitle="Daftarkan akun staf teknis atau manajemen fasilitas"
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
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="e.g. Ir. Dimas Anggara"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Email Kerja (Wajib)</label>
            <input
              type="email"
              required
              value={formUser.email}
              onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="dimas@mtcpro.co.id"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role Awal</label>
              <select
                value={formUser.role}
                onChange={(e) => setFormUser({ ...formUser, role: e.target.value as UserRole })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                <option value="teknisi">Teknisi</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">No. Telepon / WhatsApp</label>
              <input
                type="text"
                value={formUser.phone}
                onChange={(e) => setFormUser({ ...formUser, phone: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="+62 812-..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Spesialisasi / Keahlian</label>
            <input
              type="text"
              value={formUser.specialization}
              onChange={(e) => setFormUser({ ...formUser, specialization: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="e.g. Electrical Power Distribution & Trafo"
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
              Tambahkan Anggota
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
