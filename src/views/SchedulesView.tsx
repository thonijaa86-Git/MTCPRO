import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceSchedule, ScheduleFrequency, MepCategory } from '../types';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  CalendarClock,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Calendar,
  AlertTriangle,
  Play
} from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const {
    currentUser,
    schedules,
    assets,
    users,
    vendors,
    addSchedule,
    toggleScheduleStatus,
    generateWOFromSchedule,
    setCurrentView
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formSchedule, setFormSchedule] = useState({
    title: '',
    assetId: '',
    frequency: 'Bulanan' as ScheduleFrequency,
    nextDueDate: '',
    assignedType: 'internal' as 'internal' | 'vendor',
    assignedToId: '',
    vendorId: '',
    estimatedDuration: '3 Jam',
    checklistText: '1. Pembersihan filter dan strainer\n2. Pengukuran arus motor dan temperatur operasi\n3. Pemeriksaan kebocoran dan getaran abnormal'
  });

  const filteredSchedules = schedules.filter((sch) => {
    const matchesSearch =
      sch.scheduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.assetName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreq =
      selectedFrequency === 'ALL' || sch.frequency === selectedFrequency;

    return matchesSearch && matchesFreq;
  });

  const handleOpenAdd = () => {
    const firstAsset = assets[0];
    const techUsers = users.filter((u) => u.role === 'teknisi');
    setFormSchedule({
      title: '',
      assetId: firstAsset?.id || '',
      frequency: 'Bulanan',
      nextDueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      assignedType: 'internal',
      assignedToId: techUsers[0]?.id || '',
      vendorId: vendors[0]?.id || '',
      estimatedDuration: '4 Jam',
      checklistText: '1. Pembersihan fisik & saringan filter\n2. Pengecekan parameter tekanan & suhu\n3. Pengujian proteksi switch otomatis'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSchedule.title.trim() || !formSchedule.assetId) return;

    const matchedAsset = assets.find((a) => a.id === formSchedule.assetId);
    if (!matchedAsset) return;

    const matchedTech = users.find((u) => u.id === formSchedule.assignedToId);
    const matchedVendor = vendors.find((v) => v.id === formSchedule.vendorId);
    const checklist = formSchedule.checklistText.split('\n').map((s) => s.trim()).filter(Boolean);

    addSchedule({
      title: formSchedule.title,
      assetId: matchedAsset.id,
      assetName: matchedAsset.name,
      assetTag: matchedAsset.assetTag,
      category: matchedAsset.category,
      frequency: formSchedule.frequency,
      nextDueDate: formSchedule.nextDueDate,
      assignedType: formSchedule.assignedType,
      assignedToId: formSchedule.assignedType === 'internal' ? matchedTech?.id : undefined,
      assignedToName: formSchedule.assignedType === 'internal' ? matchedTech?.name : undefined,
      vendorId: formSchedule.assignedType === 'vendor' ? matchedVendor?.id : undefined,
      vendorName: formSchedule.assignedType === 'vendor' ? matchedVendor?.name : undefined,
      checklistItems: checklist,
      estimatedDuration: formSchedule.estimatedDuration,
      status: 'Aktif'
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <span>Maintenance Schedule (Preventive PM)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Otomatisasi jadwal pemeliharaan berkala untuk menjaga keandalan mesin MEP
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Jadwal Preventif Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari kode jadwal (SCH-PM-...), judul, atau nama aset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Frekuensi</option>
            <option value="Harian">Harian</option>
            <option value="Mingguan">Mingguan</option>
            <option value="Bulanan">Bulanan</option>
            <option value="Triwulan">Triwulan (3 Bulan)</option>
            <option value="Semester">Semester (6 Bulan)</option>
            <option value="Tahunan">Tahunan</option>
          </select>
        </div>
      </div>

      {/* Schedule Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchedules.map((sch) => {
          const isOverdue = new Date(sch.nextDueDate) < new Date();
          return (
            <div
              key={sch.id}
              className="industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[11px]">
                    {sch.scheduleCode}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      sch.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {sch.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                  {sch.title}
                </h3>

                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Aset:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {sch.assetName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Frekuensi:</span>
                    <span className="font-bold text-blue-600">{sch.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Pelaksana:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      {sch.assignedType === 'vendor' ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span className="truncate max-w-[130px]">{sch.vendorName}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{sch.assignedToName}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Checklist preview */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Checklist Tindakan ({sch.checklistItems.length} Langkah):
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {sch.checklistItems.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                    {sch.checklistItems.length > 2 && (
                      <li className="text-[10px] text-slate-400 italic">
                        +{sch.checklistItems.length - 2} langkah lainnya...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Footer with Due Date & Auto-generate WO */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Jatuh Tempo:</span>
                  <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {sch.nextDueDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => generateWOFromSchedule(sch.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Buat Work Order otomatis dari jadwal ini"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto WO</span>
                  </button>
                  {canManage && (
                    <button
                      onClick={() => toggleScheduleStatus(sch.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Ubah Status Jadwal"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Jadwal Preventive Maintenance Baru"
        subtitle="Otomatisasi siklus inspeksi dan pemeliharaan berkala"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Aset MEP (Wajib)
              </label>
              <select
                required
                value={formSchedule.assetId}
                onChange={(e) => setFormSchedule({ ...formSchedule, assetId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Jadwal Pemeliharaan (Wajib)
              </label>
              <input
                type="text"
                required
                value={formSchedule.title}
                onChange={(e) => setFormSchedule({ ...formSchedule, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Servis Rutin Bulanan Chiller Plant #01"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frekuensi Pelaksanaan</label>
              <select
                value={formSchedule.frequency}
                onChange={(e) => setFormSchedule({ ...formSchedule, frequency: e.target.value as ScheduleFrequency })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="Harian">Harian</option>
                <option value="Mingguan">Mingguan</option>
                <option value="Bulanan">Bulanan</option>
                <option value="Triwulan">Triwulan (3 Bulan Sekali)</option>
                <option value="Semester">Semester (6 Bulan Sekali)</option>
                <option value="Tahunan">Tahunan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo Pertama</label>
              <input
                type="date"
                required
                value={formSchedule.nextDueDate}
                onChange={(e) => setFormSchedule({ ...formSchedule, nextDueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Pelaksana</label>
              <select
                value={formSchedule.assignedType}
                onChange={(e) => setFormSchedule({ ...formSchedule, assignedType: e.target.value as 'internal' | 'vendor' })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="internal">Tim Teknisi Internal</option>
                <option value="vendor">Vendor Rekanan Spesialis</option>
              </select>
            </div>

            <div>
              {formSchedule.assignedType === 'internal' ? (
                <>
                  <label className="block font-semibold text-slate-700 mb-1">Teknisi Penanggung Jawab</label>
                  <select
                    value={formSchedule.assignedToId}
                    onChange={(e) => setFormSchedule({ ...formSchedule, assignedToId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    {users.filter((u) => u.role === 'teknisi').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Vendor Rekanan</label>
                  <select
                    value={formSchedule.vendorId}
                    onChange={(e) => setFormSchedule({ ...formSchedule, vendorId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Checklist Item Pekerjaan (1 baris per langkah)
              </label>
              <textarea
                rows={3}
                value={formSchedule.checklistText}
                onChange={(e) => setFormSchedule({ ...formSchedule, checklistText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
