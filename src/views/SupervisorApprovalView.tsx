import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  UserPlus,
  Mail,
  Check,
  X,
  Building2,
  Briefcase,
  Phone,
  Calendar,
  AlertCircle,
  Users,
  Search,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export const SupervisorApprovalView: React.FC = () => {
  const {
    currentUser,
    users,
    vendors,
    approveUser,
    rejectUser,
    updateUserRole,
    showToast
  } = useApp();

  const role = currentUser?.role || 'teknisi';

  // Helper for pending check
  const isUserPending = (u: UserProfile) => {
    const s = (u.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'menunggu approval' || s === 'menunggu persetujuan';
  };

  const isUserRejected = (u: UserProfile) => (u.status || '').toLowerCase().trim() === 'ditolak';
  const isUserActive = (u: UserProfile) => !isUserPending(u) && !isUserRejected(u);

  const pendingUsers = users.filter(isUserPending);
  const activeUsers = users.filter(isUserActive);
  const rejectedUsers = users.filter(isUserRejected);

  // Search & Filter State
  const [historySearch, setHistorySearch] = useState('');

  // User Approval Modal State
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<UserProfile | null>(null);
  const [assignedRole, setAssignedRole] = useState<UserRole>('teknisi');
  const [assignedCompany, setAssignedCompany] = useState('PT DAHANA (Persero)');
  const [assignedPosition, setAssignedPosition] = useState('MEP Specialist');
  const [assignedDepartment, setAssignedDepartment] = useState('Mechanical & Electrical Maintenance');

  // Handlers
  const handleOpenApproveUser = (u: UserProfile) => {
    setSelectedUserForApproval(u);
    setAssignedRole(u.role || 'teknisi');
    setAssignedCompany(u.company || vendors[0]?.name || 'PT DAHANA (Persero)');
    setAssignedPosition(u.position || u.specialization || 'MEP Specialist');
    setAssignedDepartment(u.department || 'Mechanical & Electrical Maintenance');
  };

  const handleConfirmApproveUser = () => {
    if (selectedUserForApproval) {
      approveUser(
        selectedUserForApproval.id,
        assignedRole,
        assignedDepartment,
        assignedCompany,
        assignedPosition
      );
      setSelectedUserForApproval(null);
    }
  };

  const handleQuickRejectUser = (u: UserProfile) => {
    if (window.confirm(`Apakah Anda yakin ingin menolak pendaftaran akun ${u.name} (${u.email})?`)) {
      rejectUser(u.id);
    }
  };

  // Filtered History
  const filteredHistory = users
    .filter((u) => !isUserPending(u))
    .filter((u) => {
      const q = historySearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.position && u.position.toLowerCase().includes(q))
      );
    });

  const getRoleBadgeStyle = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'supervisor':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'teknisi':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <span>Pusat Otorisasi & Approval Pendaftaran Akun</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi dan penetapan Role & Hak Akses pengguna baru yang mendaftar ke sistem MTCPRO.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono font-bold">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Otoritas: {currentUser?.name} ({role.toUpperCase()})</span>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="industrial-panel p-4 bg-amber-50/50 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Menunggu Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900 mt-2">{pendingUsers.length}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {pendingUsers.length > 0 ? 'Perlu tindakan verifikasi' : 'Semua pendaftar telah diproses'}
          </span>
        </div>

        <div className="industrial-panel p-4 bg-emerald-50/50 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Akun Aktif (Disetujui)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900 mt-2">{activeUsers.length}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Dapat login ke sistem</span>
        </div>

        <div className="industrial-panel p-4 bg-rose-50/50 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Pendaftaran Ditolak</span>
            <X className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2">{rejectedUsers.length}</p>
          <span className="text-[11px] text-rose-700 mt-1 block">Akses diblokir</span>
        </div>
      </div>

      {/* SECTION 1: ANTREAN PERSETUJUAN PENDAFTARAN AKUN */}
      <div className="industrial-panel p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <UserPlus className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Antrean Pendaftaran Akun ({pendingUsers.length} Pengguna)
              </h3>
              <p className="text-xs text-slate-500">
                Pemohon akun yang telah mendaftar dan menunggu verifikasi serta penetapan Role & Hak Akses
              </p>
            </div>
          </div>
          {pendingUsers.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-white animate-pulse">
              {pendingUsers.length} Menunggu Otorisasi
            </span>
          )}
        </div>

        {pendingUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada pendaftaran akun baru yang tertunda.</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Semua akun personil yang mendaftar telah diproses dan aktif di dalam sistem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/30 hover:bg-amber-50/60 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Mail className="w-3 h-3" />
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 border border-amber-300">
                      PENDING
                    </span>
                  </div>

                  <div className="p-3 bg-white/95 border border-amber-200/80 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-500">No. Telepon / WhatsApp:</span>
                      <span className="font-mono font-semibold text-slate-800">{u.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-500">Perusahaan:</span>
                      <span className="font-semibold text-slate-900">{u.company || u.department || 'PT DAHANA (Persero)'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-500">Jabatan Diajukan:</span>
                      <span className="font-semibold text-blue-700">{u.position || u.specialization || 'MEP Specialist'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Tgl Pendaftaran:</span>
                      <span className="font-mono text-slate-600">{u.joinedDate || 'Hari ini'}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => handleQuickRejectUser(u)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenApproveUser(u)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui & Tentukan Role</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: RIWAYAT / ARSIP AKUN PENGGUNA TERPROSES */}
      <div className="industrial-panel p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Database Akun Pengguna Terverifikasi ({filteredHistory.length})
              </h3>
              <p className="text-xs text-slate-500">
                Daftar akun yang telah diproses oleh Administrator
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, email, perusahaan..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Nama & Profil Pengguna</th>
                <th className="px-4 py-3">Email & Kontak</th>
                <th className="px-4 py-3">Perusahaan & Jabatan</th>
                <th className="px-4 py-3">Role Akses</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada akun yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((u) => {
                  const isRejected = isUserRejected(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800 text-[11px]">{u.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.phone || '-'}</div>
                      </td>

                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate">
                          {u.position || u.specialization || 'MEP Specialist'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.company || u.department || 'PT DAHANA (Persero)'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {isRejected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                            <X className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <Check className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenApproveUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Ubah Role / Otoritas
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Setujui & Tentukan Role Akun User Baru */}
      {selectedUserForApproval && (
        <Modal
          isOpen={!!selectedUserForApproval}
          onClose={() => setSelectedUserForApproval(null)}
          title={`Persetujuan Akun: ${selectedUserForApproval.name}`}
          maxWidth="md"
          zIndex={60}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{selectedUserForApproval.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>No. Telepon:</span>
                <span className="font-mono text-slate-800">{selectedUserForApproval.phone || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Alamat Email:</span>
                <span className="font-mono text-slate-800">{selectedUserForApproval.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Perusahaan:</span>
                <span className="font-semibold text-slate-900">{selectedUserForApproval.company || selectedUserForApproval.department || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Jabatan Diajukan:</span>
                <span className="font-semibold text-blue-700">{selectedUserForApproval.position || selectedUserForApproval.specialization || '-'}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Tetapkan Hak Akses & Profil Pengguna:</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Setelah disetujui, akun ini akan langsung aktif dan pengguna dapat login dengan hak akses sesuai peran yang Anda pilih.
                </p>
              </div>
            </div>

            {/* Field 1: Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tentukan Role / Peran Sistem
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500 text-xs"
              >
                <option value="teknisi">TEKNISI (Akses: Dashboard, Work Orders, Schedules)</option>
                <option value="supervisor">SUPERVISOR (Akses: Approval, Tim, Aset, Jadwal)</option>
                <option value="manager">MANAGER (Akses: Executive Dashboard, Report, Aset)</option>
                <option value="admin">ADMINISTRATOR (Full Akses Seluruh Fitur)</option>
              </select>
            </div>

            {/* Field 2: Company Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Perusahaan / Vendor
              </label>
              {vendors.length > 0 ? (
                <select
                  value={assignedCompany}
                  onChange={(e) => setAssignedCompany(e.target.value)}
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
                  value={assignedCompany}
                  onChange={(e) => setAssignedCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                  placeholder="e.g. PT DAHANA (Persero)"
                />
              )}
            </div>

            {/* Field 3: Position */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jabatan / Spesialisasi
              </label>
              <input
                type="text"
                value={assignedPosition}
                onChange={(e) => setAssignedPosition(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="e.g. MEP Specialist / HVAC Technician"
              />
            </div>

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
                onClick={handleConfirmApproveUser}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui & Aktifkan Pengguna</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
