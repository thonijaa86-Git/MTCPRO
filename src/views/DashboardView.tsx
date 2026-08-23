import React from 'react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
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
  Plus
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
    setSelectedWOForDetail
  } = useApp();

  const role = currentUser?.role || 'admin';

  // Metrics
  const totalAssets = assets.length;
  const criticalAssets = assets.filter((a) => a.status === 'Kritis' || a.status === 'Perbaikan').length;
  const openWOs = workOrders.filter((w) => w.status === 'Open' || w.status === 'Proses');
  const criticalWOs = workOrders.filter((w) => w.priority === 'Kritis' && w.status !== 'Disetujui');
  const pendingApprovals = workOrders.filter((w) => w.status === 'Selesai');
  const activeSchedules = schedules.filter((s) => s.status === 'Aktif').length;
  const criticalSpareParts = spareParts.filter((p) => p.stock <= p.minThreshold);
  const activeTechnicians = users.filter((u) => u.role === 'teknisi');

  // Technician Specific:
  const myAssignedWOs = workOrders.filter(
    (w) => w.assignedToId === currentUser?.id && (w.status === 'Open' || w.status === 'Proses')
  );

  return (
    <div className="space-y-6">
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
              Selamat datang kembali, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {role === 'admin' && 'Pusat komando pemeliharaan fasilitas MEP. Pantau status aset, penugasan teknisi, dan stok suku cadang secara real-time.'}
              {role === 'supervisor' && 'Supervisi operasional tim teknis MEP. Tinjau progres instruksi kerja dan verifikasi approval pekerjaan selesai.'}
              {role === 'teknisi' && 'Daftar tugas lapangan Anda hari ini. Segera tindak lanjuti work order dan laporkan progres checklist perbaikan.'}
              {role === 'manager' && 'Ringkasan performa eksekutif fasilitas, metrik keandalan mesin MEP, dan kepatuhan jadwal preventif.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <button
                onClick={() => setCurrentView('work_orders')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Work Order</span>
              </button>
            )}
            {role === 'teknisi' && (
              <button
                onClick={() => setCurrentView('teknisi_tasks')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Buka Tugas Saya ({myAssignedWOs.length})</span>
              </button>
            )}
            {role === 'supervisor' && (
              <button
                onClick={() => setCurrentView('supervisor_approval')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Review Approval ({pendingApprovals.length})</span>
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
                  <p className="text-[11px] text-slate-500">
                    Daftar pekerjaan pemeliharaan yang sedang berjalan
                  </p>
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
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
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
    </div>
  );
};
