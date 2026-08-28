import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  Cpu,
  ClipboardList,
  CalendarClock,
  Boxes,
  Users2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Wrench,
  CheckCheck,
  Zap,
  Activity,
  Plus,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Check,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    assets,
    workOrders,
    schedules,
    spareParts,
    users,
    vendors,
    setCurrentView,
    setSelectedWOForDetail,
    approveUser,
    rejectUser
  } = useApp();

  const role = currentUser?.role || 'admin';

  // Modal State for Quick User Approval from Dashboard
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<UserProfile | null>(null);
  const [assignedRole, setAssignedRole] = useState<UserRole>('teknisi');
  const [assignedCompany, setAssignedCompany] = useState('PT DAHANA (Persero)');
  const [assignedPosition, setAssignedPosition] = useState('MEP Specialist');
  const [assignedDepartment, setAssignedDepartment] = useState('Mechanical & Electrical Maintenance');

  // Pending user check
  const isUserPending = (u: UserProfile) => {
    const s = (u.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'menunggu approval' || s === 'menunggu persetujuan';
  };

  // Metrics
  const totalAssets = assets.length;
  const criticalAssets = assets.filter((a) => a.status === 'Kritis' || a.status === 'Perbaikan').length;
  const openWOs = workOrders.filter((w) => w.status === 'Open' || w.status === 'Proses');
  const criticalWOs = workOrders.filter((w) => w.priority === 'Kritis' && w.status !== 'Disetujui');
  const pendingApprovals = workOrders.filter((w) => w.status === 'Selesai');
  const pendingUsers = users.filter(isUserPending);
  const totalPendingApproval = pendingApprovals.length + pendingUsers.length;
  const activeSchedules = schedules.filter((s) => s.status === 'Aktif').length;
  const criticalSpareParts = spareParts.filter((p) => p.stock <= p.minThreshold);
  const activeTechnicians = users.filter((u) => u.role === 'teknisi');

  // Technician Specific:
  const myAssignedWOs = workOrders.filter((w) => {
    if (!currentUser) return false;
    const matchId = w.assignedToId && (w.assignedToId === currentUser.id);
    const matchName = w.assignedToName && currentUser.name && (
      w.assignedToName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      currentUser.name.toLowerCase().includes(w.assignedToName.toLowerCase()) ||
      w.assignedToName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
    const isUnassigned = !w.assignedToId || w.assignedToName === 'Tim Teknisi' || w.assignedToName === 'Unassigned';
    return (matchId || matchName || isUnassigned) && (w.status === 'Open' || w.status === 'Proses');
  });

  const handleOpenApproveUser = (u: UserProfile) => {
    setSelectedUserForApproval(u);
    setAssignedRole(u.role || 'teknisi');
    setAssignedCompany(u.company || vendors[0]?.name || 'PT DAHANA (Persero)');
    setAssignedPosition(u.position || u.specialization || 'MEP Specialist');
    setAssignedDepartment(u.department || 'Mechanical & Electrical Maintenance');
  };

  const handleConfirmApproveUser = () => {
    if (selectedUserForApproval) {
      approveUser(selectedUserForApproval.id, assignedRole, assignedDepartment, assignedCompany, assignedPosition);
      setSelectedUserForApproval(null);
    }
  };

  const handleQuickRejectUser = (u: UserProfile) => {
    if (window.confirm(`Tolak pendaftaran akun ${u.name} (${u.email})?`)) {
      rejectUser(u.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending User Registrations Interactive Widget for Admin */}
      {pendingUsers.length > 0 && (role === 'admin' || role === 'supervisor') && (
        <div className="industrial-panel p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-white border-2 border-amber-400 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                <UserPlus className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-950">
                    Antrean Pendaftaran Akun Pengguna Baru ({pendingUsers.length} Pemohon)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                    Action Needed
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
                  Pengguna baru berikut telah mendaftar dan menunggu verifikasi serta penentuan role oleh Administrator.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('supervisor_approval')}
              className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>Buka Menu Approval Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards of Pending Applicants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-white border border-amber-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                    />
                    <div className="truncate">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{u.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px]">Telepon/WA:</span>
                      <span className="font-mono font-semibold text-slate-800 text-[11px]">{u.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px]">Perusahaan:</span>
                      <span className="font-semibold text-slate-900 text-[11px] truncate max-w-[140px]">{u.company || u.department || 'PT DAHANA (Persero)'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px]">Jabatan:</span>
                      <span className="font-semibold text-blue-700 text-[11px] truncate max-w-[140px]">{u.position || u.specialization || 'MEP Specialist'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleQuickRejectUser(u)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenApproveUser(u)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui & Tetapkan Role</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                PORTAL {role}
              </span>
              <span className="text-xs text-slate-400">
                • Gedung Utama & Powerhouse MEP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Halo, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {role === 'teknisi'
                ? `Anda memiliki ${myAssignedWOs.length} Work Order aktif yang perlu ditangani hari ini.`
                : role === 'supervisor'
                ? `Terdapat ${totalPendingApproval} item yang menunggu verifikasi dan approval Anda.`
                : 'Sistem operasional pemeliharaan MEP berjalan normal dengan pemantauan otomatis.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {role === 'teknisi' ? (
              <button
                onClick={() => setCurrentView('teknisi_tasks')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Buka Portal Teknisi ({myAssignedWOs.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('work_orders')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Lihat Work Order</span>
              </button>
            )}
            {(role === 'supervisor' || role === 'admin') && (
              <button
                onClick={() => setCurrentView('supervisor_approval')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Review Approval ({totalPendingApproval})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Aset MEP"
          value={totalAssets}
          subtitle={`${criticalAssets} butuh perbaikan / kritis`}
          icon={<Cpu className="w-6 h-6 text-blue-600" />}
          accentColor="blue"
          trend={{ value: '100%', isPositive: true, label: 'Terdata di sistem' }}
          onClick={() => setCurrentView('assets')}
        />
        <KpiCard
          title="Work Order Aktif"
          value={openWOs.length}
          subtitle={`${criticalWOs.length} prioritas Kritis`}
          icon={<ClipboardList className="w-6 h-6 text-rose-600" />}
          accentColor={criticalWOs.length > 0 ? 'rose' : 'blue'}
          trend={{ value: `${criticalWOs.length} darurat`, isPositive: criticalWOs.length === 0, label: 'perlu respon cepat' }}
          onClick={() => setCurrentView('work_orders')}
        />
        <KpiCard
          title="Jadwal Preventif"
          value={activeSchedules}
          subtitle="Jadwal PM berkala aktif"
          icon={<CalendarClock className="w-6 h-6 text-emerald-600" />}
          accentColor="emerald"
          trend={{ value: '96.4%', isPositive: true, label: 'Kepatuhan jadwal' }}
          onClick={() => setCurrentView('schedules')}
        />
        <KpiCard
          title="Stok Suku Cadang"
          value={spareParts.length}
          subtitle={`${criticalSpareParts.length} item di bawah threshold`}
          icon={<Boxes className="w-6 h-6 text-amber-600" />}
          accentColor={criticalSpareParts.length > 0 ? 'amber' : 'emerald'}
          trend={{ value: `${criticalSpareParts.length} kritis`, isPositive: criticalSpareParts.length === 0, label: 'perlu restok' }}
          onClick={() => setCurrentView('spare_parts')}
        />
      </div>

      {/* Main Grid: Priority WOs & Quick PM Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Work Orders (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="industrial-panel">
            <div className="industrial-panel-header">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Work Order Terkini & Prioritas
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('work_orders')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua ({workOrders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">No. WO</th>
                    <th className="px-4 py-3">Aset & Deskripsi</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Prioritas</th>
                    <th className="px-4 py-3">Teknisi PIC</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {workOrders.slice(0, 5).map((wo) => (
                    <tr
                      key={wo.id}
                      onClick={() => {
                        setSelectedWOForDetail(wo);
                        setCurrentView('work_orders');
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {wo.woNumber}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {wo.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {wo.assetName}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <CategoryBadge category={wo.category} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={wo.priority} />
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {wo.assignedToName || <span className="text-slate-400 italic">Belum di-assign</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={wo.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Spare Part Warning Banner if any */}
          {criticalSpareParts.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Peringatan Ketersediaan Suku Cadang MEP ({criticalSpareParts.length} Item Menipis)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {criticalSpareParts.map((p) => `${p.name} (Sisa: ${p.stock} ${p.unit})`).join(', ')}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('spare_parts')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                Cek & Restok
              </button>
            </div>
          )}
        </div>

        {/* Right: Upcoming Schedules & Team Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming PM Schedule */}
          <div className="industrial-panel">
            <div className="industrial-panel-header">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Jadwal Preventif Terdekat
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('schedules')}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                Kalender
              </button>
            </div>

            <div className="p-4 space-y-3">
              {schedules.slice(0, 4).map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {sch.frequency}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      Due: {sch.nextDueDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {sch.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{sch.assetTag}</span>
                    <span className="font-medium text-slate-700">
                      {sch.assignedType === 'vendor' ? sch.vendorName : sch.assignedToName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Team Status */}
          <div className="industrial-panel">
            <div className="industrial-panel-header">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Tim Teknisi On-Duty
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('team')}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                Kelola
              </button>
            </div>

            <div className="p-4 space-y-3">
              {activeTechnicians.map((tech) => {
                const assignedCount = workOrders.filter(
                  (w) => w.assignedToId === tech.id && w.status !== 'Disetujui'
                ).length;

                return (
                  <div
                    key={tech.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {tech.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {tech.specialization}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        assignedCount > 0
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {assignedCount} WO Aktif
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Setujui & Tentukan Role Akun User Baru dari Dashboard */}
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
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 text-xs"
              >
                <option value="teknisi">TEKNISI (Akses Tiket WO, Checklist, Preventive)</option>
                <option value="supervisor">SUPERVISOR (Akses Verifikasi Approval, Jadwal, Monitoring)</option>
                <option value="manager">MANAGER (Akses Laporan, KPI, Analitik Eksekutif)</option>
                <option value="admin">ADMINISTRATOR (Akses Penuh Semua Modul & Konfigurasi)</option>
              </select>
            </div>

            {/* Field 2: Company Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Perusahaan / Organisasi
              </label>
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
                placeholder="e.g. MEP Specialist / Chief Engineer"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedUserForApproval(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveUser}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Konfirmasi & Aktifkan Akun</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
