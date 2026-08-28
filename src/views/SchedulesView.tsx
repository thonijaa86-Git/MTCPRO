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
  Play,
  ListFilter,
  LayoutGrid,
  Eye,
  Edit2,
  Trash2,
  X,
  FileText
} from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const {
    currentUser,
    schedules,
    assets,
    users,
    vendors,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    deleteBulkSchedules,
    toggleScheduleStatus,
    generateWOFromSchedule,
    setCurrentView
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');

  // Multi-Select
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] = useState<MaintenanceSchedule | null>(null);

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

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedScheduleIds.length === filteredSchedules.length && filteredSchedules.length > 0) {
      setSelectedScheduleIds([]);
    } else {
      setSelectedScheduleIds(filteredSchedules.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScheduleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedScheduleIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedScheduleIds.length} jadwal terpilih?`)) {
      deleteBulkSchedules(selectedScheduleIds);
      setSelectedScheduleIds([]);
    }
  };

  const handleDeleteSingle = (sch: MaintenanceSchedule, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal ${sch.scheduleCode} (${sch.title})?`)) {
      deleteSchedule(sch.id);
      setSelectedScheduleIds((prev) => prev.filter((id) => id !== sch.id));
    }
  };

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
      estimatedDuration: '',
      checklistText: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sch: MaintenanceSchedule, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingScheduleId(sch.id);
    const techUsers = users.filter((u) => u.role === 'teknisi');
    const matchedTech = techUsers.find((t) => t.id === sch.assignedToId || t.name === sch.assignedToName);
    const matchedVendor = vendors.find((v) => v.id === sch.vendorId || v.name === sch.vendorName);

    setFormSchedule({
      title: sch.title,
      assetId: sch.assetId,
      frequency: sch.frequency,
      nextDueDate: sch.nextDueDate,
      assignedType: sch.assignedType || 'internal',
      assignedToId: matchedTech?.id || (techUsers[0]?.id || ''),
      vendorId: matchedVendor?.id || (vendors[0]?.id || ''),
      estimatedDuration: sch.estimatedDuration || '3 Jam',
      checklistText: (sch.checklistItems && sch.checklistItems.length > 0)
        ? sch.checklistItems.join('\n')
        : '1. Pembersihan filter dan strainer\n2. Pengukuran arus motor'
    });
    setIsEditModalOpen(true);
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleId || !formSchedule.title.trim()) return;

    const matchedTech = users.find((u) => u.id === formSchedule.assignedToId);
    const matchedVendor = vendors.find((v) => v.id === formSchedule.vendorId);
    const checklist = formSchedule.checklistText.split('\n').map((s) => s.trim()).filter(Boolean);

    updateSchedule(editingScheduleId, {
      title: formSchedule.title,
      frequency: formSchedule.frequency,
      nextDueDate: formSchedule.nextDueDate,
      assignedType: formSchedule.assignedType,
      assignedToId: formSchedule.assignedType === 'internal' ? matchedTech?.id : undefined,
      assignedToName: formSchedule.assignedType === 'internal' ? matchedTech?.name : undefined,
      vendorId: formSchedule.assignedType === 'vendor' ? matchedVendor?.id : undefined,
      vendorName: formSchedule.assignedType === 'vendor' ? matchedVendor?.name : undefined,
      checklistItems: checklist,
      estimatedDuration: formSchedule.estimatedDuration
    });

    setIsEditModalOpen(false);
    setEditingScheduleId(null);
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
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Jadwal Preventif Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedScheduleIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedScheduleIds.length}
            </span>
            <span className="font-semibold">Jadwal terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedScheduleIds([])}
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
              <span>Hapus {selectedScheduleIds.length} Jadwal Terpilih</span>
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

          {(searchQuery || selectedFrequency !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFrequency('ALL');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedScheduleIds.length > 0 && selectedScheduleIds.length === filteredSchedules.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      title="Pilih Semua Jadwal"
                    />
                  </th>
                  <th className="px-4 py-3">Kode Jadwal</th>
                  <th className="px-4 py-3">Nama Jadwal & Aset</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Frekuensi</th>
                  <th className="px-4 py-3">Jatuh Tempo</th>
                  <th className="px-4 py-3">Pelaksana</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Tidak ada jadwal yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((sch) => {
                    const isSelected = selectedScheduleIds.includes(sch.id);
                    return (
                      <tr
                        key={sch.id}
                        onClick={() => setSelectedScheduleForDetail(sch)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(sch.id, e as any)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {sch.scheduleCode}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 max-w-[220px]">
                          <div className="font-bold text-slate-900 truncate">{sch.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{sch.assetName}</div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CategoryBadge category={sch.category} />
                        </td>

                        <td className="px-4 py-3.5 font-bold text-blue-600 whitespace-nowrap">
                          {sch.frequency}
                        </td>

                        <td className="px-4 py-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {sch.nextDueDate}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-slate-800 font-semibold truncate max-w-[140px]">
                            {sch.assignedType === 'vendor' ? sch.vendorName : sch.assignedToName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sch.assignedType === 'vendor' ? 'Mitra Vendor' : 'Teknisi Internal'}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              sch.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {sch.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => generateWOFromSchedule(sch.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Terbitkan WO Otomatis"
                            >
                              <Sparkles className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => setSelectedScheduleForDetail(sch)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(sch, e)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Jadwal"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSingle(sch, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Jadwal"
                                >
                                  <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Schedule Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.map((sch) => {
            const isSelected = selectedScheduleIds.includes(sch.id);
            return (
              <div
                key={sch.id}
                onClick={() => setSelectedScheduleForDetail(sch)}
                className={`industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(sch.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[11px]">
                        {sch.scheduleCode}
                      </span>
                    </div>
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

                {/* Footer with Due Date & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jatuh Tempo:</span>
                    <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {sch.nextDueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => generateWOFromSchedule(sch.id)}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Buat Work Order otomatis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Auto WO</span>
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={(e) => handleOpenEdit(sch, e)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Jadwal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSingle(sch, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScheduleForDetail && (
        <Modal
          isOpen={!!selectedScheduleForDetail}
          onClose={() => setSelectedScheduleForDetail(null)}
          title={`${selectedScheduleForDetail.scheduleCode}: ${selectedScheduleForDetail.title}`}
          subtitle={`Aset: ${selectedScheduleForDetail.assetName} • Frekuensi: ${selectedScheduleForDetail.frequency}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Frekuensi</span>
                <p className="font-bold text-blue-700 text-xs mt-0.5">{selectedScheduleForDetail.frequency}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Jatuh Tempo</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedScheduleForDetail.nextDueDate}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimasi Durasi</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedScheduleForDetail.estimatedDuration || '3 Jam'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pelaksana</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">
                  {selectedScheduleForDetail.assignedType === 'vendor' ? selectedScheduleForDetail.vendorName : selectedScheduleForDetail.assignedToName}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                Checklist Item Pekerjaan Standar ({selectedScheduleForDetail.checklistItems.length} Langkah):
              </span>
              <div className="space-y-1.5 p-3 bg-white border border-slate-200 rounded-xl">
                {selectedScheduleForDetail.checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = selectedScheduleForDetail;
                  setSelectedScheduleForDetail(null);
                  generateWOFromSchedule(target.id);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terbitkan Work Order Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedScheduleForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add & Edit Schedule Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingScheduleId(null);
        }}
        title={isEditModalOpen ? 'Edit Jadwal Maintenance' : 'Buat Jadwal Maintenance Baru'}
        subtitle="Rencanakan preventive maintenance berkala untuk menjaga keandalan fasilitas"
        maxWidth="2xl"
      >
        <form onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {!isEditModalOpen && (
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Pilih Aset MEP (Wajib)
                </label>
                <select
                  required
                  value={formSchedule.assetId}
                  onChange={(e) => setFormSchedule({ ...formSchedule, assetId: e.target.value })}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.assetTag}] {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Jadwal Pemeliharaan (Wajib)
              </label>
              <input
                type="text"
                required
                value={formSchedule.title}
                onChange={(e) => setFormSchedule({ ...formSchedule, title: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. Servis Rutin Bulanan Chiller Plant #01"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Frekuensi Pelaksanaan</label>
              <select
                value={formSchedule.frequency}
                onChange={(e) => setFormSchedule({ ...formSchedule, frequency: e.target.value as ScheduleFrequency })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
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
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tanggal Jatuh Tempo</label>
              <input
                type="date"
                required
                value={formSchedule.nextDueDate}
                onChange={(e) => setFormSchedule({ ...formSchedule, nextDueDate: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tipe Pelaksana</label>
              <select
                value={formSchedule.assignedType}
                onChange={(e) => setFormSchedule({ ...formSchedule, assignedType: e.target.value as 'internal' | 'vendor' })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                <option value="internal">Tim Teknisi Internal</option>
                <option value="vendor">Perusahaan / Mitra Spesialis</option>
              </select>
            </div>

            <div>
              {formSchedule.assignedType === 'internal' ? (
                <>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Teknisi Penanggung Jawab</label>
                  <select
                    value={formSchedule.assignedToId}
                    onChange={(e) => setFormSchedule({ ...formSchedule, assignedToId: e.target.value })}
                    className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Pilih Perusahaan Pelaksana</label>
                  <select
                    value={formSchedule.vendorId}
                    onChange={(e) => setFormSchedule({ ...formSchedule, vendorId: e.target.value })}
                    className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
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
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Checklist Item Pekerjaan (1 baris per langkah)
              </label>
              <textarea
                rows={2}
                value={formSchedule.checklistText}
                onChange={(e) => setFormSchedule({ ...formSchedule, checklistText: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. 1. Pembersihan fisik & saringan filter&#10;2. Pengecekan parameter tekanan & suhu&#10;3. Pengujian proteksi switch otomatis"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingScheduleId(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              {isEditModalOpen ? 'Simpan Perubahan' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
