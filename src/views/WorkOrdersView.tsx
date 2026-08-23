import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, WOPriority, WOStatus, MepCategory } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Kanban,
  ListFilter,
  UserCheck,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  CheckCheck,
  AlertCircle,
  Boxes,
  MapPin,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export const WorkOrdersView: React.FC = () => {
  const {
    currentUser,
    workOrders,
    assets,
    users,
    createWorkOrder,
    updateWorkOrderStatus,
    updateWorkOrderPriority,
    assignWorkOrder,
    selectedWOForDetail,
    setSelectedWOForDetail
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const technicians = users.filter((u) => u.role === 'teknisi');

  // View & Filter states
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetWOForAssign, setTargetWOForAssign] = useState<WorkOrder | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>('');

  // Form Create State
  const [newWO, setNewWO] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'Medium' as WOPriority,
    assignedToId: '',
    dueDate: '',
    estimatedHours: 4,
    stepInputs: 'Pemeriksaan awal fisik mesin\nPengujian komponen & perbaikan\nRunning test & verifikasi keselamatan'
  });

  const filteredWOs = workOrders.filter((wo) => {
    const matchesSearch =
      wo.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.assignedToName && wo.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || wo.category === selectedCategory;

    const matchesPriority =
      selectedPriority === 'ALL' || wo.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === 'ALL' || wo.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleOpenCreate = () => {
    const firstAsset = assets[0];
    setNewWO({
      title: '',
      description: '',
      assetId: firstAsset?.id || '',
      priority: 'Medium',
      assignedToId: technicians[0]?.id || '',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().substring(0, 10),
      estimatedHours: 4,
      stepInputs: '1. Lockout Tagout (LOTO) & Safety check\n2. Pemeriksaan dan penggantian komponen aus\n3. Uji coba operasional & pengukuran vibrasi/arus'
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWO.title.trim() || !newWO.assetId) return;

    const matchedAsset = assets.find((a) => a.id === newWO.assetId);
    if (!matchedAsset) return;

    const matchedTech = users.find((u) => u.id === newWO.assignedToId);
    const steps = newWO.stepInputs.split('\n').map((s) => s.trim()).filter(Boolean);

    createWorkOrder({
      title: newWO.title,
      description: newWO.description,
      assetId: matchedAsset.id,
      assetName: matchedAsset.name,
      assetTag: matchedAsset.assetTag,
      category: matchedAsset.category,
      location: matchedAsset.location,
      priority: newWO.priority,
      status: 'Open',
      assignedToId: matchedTech?.id,
      assignedToName: matchedTech?.name,
      createdById: currentUser?.id || 'usr-admin-01',
      createdByName: currentUser?.name || 'Admin',
      dueDate: newWO.dueDate,
      estimatedHours: Number(newWO.estimatedHours) || 4,
      totalSteps: steps,
      stepsCompleted: [],
      sparePartsUsed: []
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenAssign = (wo: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetWOForAssign(wo);
    setSelectedTechId(wo.assignedToId || technicians[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (targetWOForAssign && selectedTechId) {
      assignWorkOrder(targetWOForAssign.id, selectedTechId);
      setIsAssignModalOpen(false);
      setTargetWOForAssign(null);
    }
  };

  const kanbanColumns: { status: WOStatus; label: string; bg: string }[] = [
    { status: 'Open', label: 'Open (Menunggu)', bg: 'border-t-blue-500' },
    { status: 'Proses', label: 'Sedang Dikerjakan', bg: 'border-t-amber-500' },
    { status: 'Pending', label: 'Pending (Material/Vendor)', bg: 'border-t-slate-400' },
    { status: 'Selesai', label: 'Selesai (Menunggu Approval)', bg: 'border-t-emerald-500' },
    { status: 'Disetujui', label: 'Disetujui & Closed', bg: 'border-t-teal-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Manajemen Work Order (WO)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan siklus instruksi kerja perbaikan dan pemeliharaan teknis MEP
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
              }`}
              title="Tampilan Tabel List"
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
              }`}
              title="Tampilan Kanban Board"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          {(role === 'admin' || role === 'supervisor') && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan WO Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor WO (WO-2026-...), judul, aset, atau nama teknisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="Kritis">Kritis</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Medium">Medium</option>
            <option value="Rendah">Rendah</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Status</option>
            <option value="Open">Open</option>
            <option value="Proses">Proses</option>
            <option value="Pending">Pending</option>
            <option value="Selesai">Selesai</option>
            <option value="Disetujui">Disetujui</option>
          </select>
        </div>
      </div>

      {/* View Content: List vs Kanban */}
      {viewMode === 'list' ? (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">No. WO</th>
                  <th className="px-4 py-3">Judul Instruksi Kerja</th>
                  <th className="px-4 py-3">Aset Terkait</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Teknisi PIC</th>
                  <th className="px-4 py-3">Batas Waktu</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWOs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Tidak ada data Work Order yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredWOs.map((wo) => (
                    <tr
                      key={wo.id}
                      onClick={() => setSelectedWOForDetail(wo)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {wo.woNumber}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{wo.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{wo.description}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{wo.assetName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{wo.assetTag}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <CategoryBadge category={wo.category} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <PriorityBadge priority={wo.priority} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {wo.assignedToName ? (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{wo.assignedToName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {wo.dueDate || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {(role === 'admin' || role === 'supervisor') && (
                            <button
                              onClick={(e) => handleOpenAssign(wo, e)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Assign Teknisi"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedWOForDetail(wo)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Buka Detail"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const columnWOs = filteredWOs.filter((w) => w.status === col.status);
            return (
              <div
                key={col.status}
                className={`bg-slate-100/70 rounded-xl border border-slate-200 border-t-4 ${col.bg} p-3 flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-800 truncate">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {columnWOs.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {columnWOs.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 italic">
                      Kosong
                    </div>
                  ) : (
                    columnWOs.map((wo) => (
                      <div
                        key={wo.id}
                        onClick={() => setSelectedWOForDetail(wo)}
                        className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[11px] text-slate-900">
                            {wo.woNumber}
                          </span>
                          <PriorityBadge priority={wo.priority} showIcon={false} />
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                          {wo.title}
                        </h4>

                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{wo.assetName}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                          <span className="truncate max-w-[100px] font-medium">
                            {wo.assignedToName || 'Unassigned'}
                          </span>
                          <span className="font-mono text-slate-400">{wo.dueDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work Order Detail Modal */}
      {selectedWOForDetail && (
        <Modal
          isOpen={!!selectedWOForDetail}
          onClose={() => setSelectedWOForDetail(null)}
          title={`${selectedWOForDetail.woNumber}: ${selectedWOForDetail.title}`}
          subtitle={`Aset: ${selectedWOForDetail.assetName} [${selectedWOForDetail.assetTag}]`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status & Priority Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedWOForDetail.status} size="md" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Prioritas</span>
                <div className="mt-1">
                  <PriorityBadge priority={selectedWOForDetail.priority} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Teknisi Bertugas</span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {selectedWOForDetail.assignedToName || 'Belum Ditugaskan'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Deadline</span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                  {selectedWOForDetail.dueDate || '-'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Deskripsi Kerusakan / Tugas</h4>
              <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
                {selectedWOForDetail.description}
              </p>
            </div>

            {/* Execution Checklist Steps */}
            {selectedWOForDetail.totalSteps && selectedWOForDetail.totalSteps.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Tahapan Checklist Perbaikan</span>
                  <span className="text-xs text-slate-500 font-mono font-normal">
                    {selectedWOForDetail.stepsCompleted?.length || 0} / {selectedWOForDetail.totalSteps.length} Selesai
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {selectedWOForDetail.totalSteps.map((step, idx) => {
                    const isDone = selectedWOForDetail.stepsCompleted?.includes(step);
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isDone ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span className={`text-xs ${isDone ? 'line-through text-slate-500' : 'font-medium'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spare Parts Used */}
            {selectedWOForDetail.sparePartsUsed && selectedWOForDetail.sparePartsUsed.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>Suku Cadang Digunakan</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Nama Suku Cadang</th>
                        <th className="px-3 py-2 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedWOForDetail.sparePartsUsed.map((p, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono text-slate-600">{p.sku}</td>
                          <td className="px-3 py-2 text-slate-900 font-semibold">{p.partName}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-blue-600">
                            {p.quantity} Unit
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Technician & Supervisor Notes */}
            {selectedWOForDetail.technicianNotes && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider block mb-1">
                  Catatan Teknisi / Supervisor:
                </span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedWOForDetail.technicianNotes}
                </p>
              </div>
            )}

            {/* Quick Status Modifiers */}
            {(role === 'admin' || role === 'supervisor') && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-slate-700">Ubah Status Cepat:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['Open', 'Proses', 'Pending', 'Selesai', 'Disetujui'] as WOStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateWorkOrderStatus(selectedWOForDetail.id, st);
                        setSelectedWOForDetail({ ...selectedWOForDetail, status: st });
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedWOForDetail.status === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedWOForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Technician Modal */}
      {isAssignModalOpen && targetWOForAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setTargetWOForAssign(null);
          }}
          title={`Tugaskan Teknisi: ${targetWOForAssign.woNumber}`}
          subtitle={targetWOForAssign.title}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Pilih Teknisi Penanggung Jawab
              </label>
              <div className="space-y-2">
                {technicians.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTechId === t.id
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="techAssign"
                      value={t.id}
                      checked={selectedTechId === t.id}
                      onChange={() => setSelectedTechId(t.id)}
                      className="sr-only"
                    />
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.specialization}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create New Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Terbitkan Work Order Baru"
        subtitle="Buat instruksi penanganan kerusakan atau preventive maintenance"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveCreate} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Pilih Aset MEP yang Bermasalah / Diservis <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newWO.assetId}
                onChange={(e) => setNewWO({ ...newWO, assetId: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name} — {a.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Judul Instruksi Kerja <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newWO.title}
                onChange={(e) => setNewWO({ ...newWO, title: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium text-xs"
                placeholder="e.g. Overhaul & Penggantian Seal Pompa Booster #01"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Deskripsi Detail Masalah & Temuan Lapangan
              </label>
              <textarea
                rows={2}
                required
                value={newWO.description}
                onChange={(e) => setNewWO({ ...newWO, description: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="Jelaskan kronologi, indikasi suara/getaran, error display kode, dsb."
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tingkat Prioritas</label>
              <select
                value={newWO.priority}
                onChange={(e) => setNewWO({ ...newWO, priority: e.target.value as WOPriority })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                <option value="Kritis">Kritis (Operasional Gedung Terganggu)</option>
                <option value="Tinggi">Tinggi (Segera dalam 24 Jam)</option>
                <option value="Medium">Medium (Standar 3 Hari)</option>
                <option value="Rendah">Rendah (Pekerjaan Rutin / Non-Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tugaskan ke Teknisi</label>
              <select
                value={newWO.assignedToId}
                onChange={(e) => setNewWO({ ...newWO, assignedToId: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                <option value="">-- Tugaskan Nanti --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Target Batas Waktu (Due Date)</label>
              <input
                type="date"
                required
                value={newWO.dueDate}
                onChange={(e) => setNewWO({ ...newWO, dueDate: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Estimasi Durasi Kerja (Jam)</label>
              <input
                type="number"
                min={1}
                max={48}
                value={newWO.estimatedHours}
                onChange={(e) => setNewWO({ ...newWO, estimatedHours: Number(e.target.value) })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Tahapan Checklist Pengerjaan (1 baris per langkah)
              </label>
              <textarea
                rows={2}
                value={newWO.stepInputs}
                onChange={(e) => setNewWO({ ...newWO, stepInputs: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-mono text-xs"
                placeholder="Tulis setiap checklist di baris baru..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              Terbitkan Work Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
