import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  WorkOrder,
  WOPriority,
  WOStatus,
  WOCategory,
  JobType,
  MaterialItem
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
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
  UserPlus,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Building,
  HardHat,
  X,
  FileText
} from 'lucide-react';

export const WO_PRIORITY_OPTIONS: WOPriority[] = ['Emergency', 'High', 'Medium', 'Low'];
export const WO_CATEGORY_OPTIONS: WOCategory[] = ['Corrective', 'Preventive', 'Inspection', 'Operation', 'Supervise'];
export const JOB_TYPE_OPTIONS: JobType[] = ['Mechanical', 'Electrical', 'Sipil', 'Others'];

export const WorkOrdersView: React.FC = () => {
  const {
    currentUser,
    workOrders,
    assets,
    users,
    vendors,
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

  // File / Camera upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form Create State with EXACT required fields:
  // - NO WO
  // - Tanggal WO
  // - Prioritas: Emergency, High, Medium, Low
  // - Kategori WO: Corrective, Preventive, Inspection, Operation, Supervise
  // - Jenis Pekerjaan: Mechanical, Electrical, Sipil, Others
  // - Vendor Pelaksana
  // - Nama Pelaksana
  // - Lokasi
  // - Nama Aset
  // - Deskripsi
  // - Part/Material/Mesin: | NO | Nama Part/Material/Mesin | QTY | Unit |
  // - Dokumentasi: upload foto / camera
  const [formWO, setFormWO] = useState({
    woNumber: '',
    woDate: new Date().toISOString().substring(0, 10),
    priority: 'Medium' as WOPriority,
    woCategory: 'Corrective' as WOCategory,
    jobType: 'Mechanical' as JobType,
    vendorName: 'Internal Facilities Team',
    assignedToName: '',
    assignedToId: '',
    location: '',
    assetName: '',
    assetId: '',
    description: '',
    materials: [
      { id: 'mat-1', name: '', qty: 1, unit: 'Pcs' }
    ] as MaterialItem[],
    photos: [] as string[]
  });

  const filteredWOs = workOrders.filter((wo) => {
    const matchesSearch =
      wo.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.location && wo.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (wo.assignedToName && wo.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || (wo.woCategory ? wo.woCategory === selectedCategory : true);

    const matchesPriority =
      selectedPriority === 'ALL' || wo.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === 'ALL' || wo.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleOpenCreate = () => {
    const nextCount = workOrders.length + 1;
    const generatedWONumber = `WO-${new Date().getFullYear()}-${nextCount.toString().padStart(4, '0')}`;
    const defaultAsset = assets[0];
    const defaultTech = technicians[0];

    setFormWO({
      woNumber: generatedWONumber,
      woDate: new Date().toISOString().substring(0, 10),
      priority: 'Medium',
      woCategory: 'Corrective',
      jobType: 'Mechanical',
      vendorName: 'Internal Facilities Team',
      assignedToName: defaultTech ? defaultTech.name : 'Tim Teknisi MEP',
      assignedToId: defaultTech ? defaultTech.id : '',
      location: defaultAsset ? defaultAsset.location : 'Basement 1 — Machine Room',
      assetName: defaultAsset ? defaultAsset.name : '',
      assetId: defaultAsset ? defaultAsset.id : '',
      description: '',
      materials: [
        { id: 'mat-1', name: '', qty: 1, unit: 'Pcs' }
      ],
      photos: []
    });
    setIsCreateModalOpen(true);
  };

  const handleAssetSelectChange = (assetId: string) => {
    const matched = assets.find((a) => a.id === assetId);
    if (matched) {
      setFormWO((prev) => ({
        ...prev,
        assetId: matched.id,
        assetName: matched.name,
        location: matched.location,
        jobType: matched.category === 'Kelistrikan' || matched.category === 'Genset'
          ? 'Electrical'
          : matched.category === 'Bangunan' || matched.category === 'Landscape'
          ? 'Sipil'
          : 'Mechanical'
      }));
    }
  };

  // Material Table Row Actions
  const handleAddMaterialRow = () => {
    setFormWO((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { id: 'mat-' + Date.now(), name: '', qty: 1, unit: 'Pcs' }
      ]
    }));
  };

  const handleRemoveMaterialRow = (id: string) => {
    setFormWO((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id)
    }));
  };

  const handleUpdateMaterialRow = (id: string, field: keyof MaterialItem, value: any) => {
    setFormWO((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    }));
  };

  // Photo Upload & Camera Capture
  const handlePhotoFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFormWO((prev) => ({
            ...prev,
            photos: [...prev.photos, loadEvt.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    setFormWO((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWO.woNumber.trim() || !formWO.assetName.trim()) return;

    // Filter valid materials
    const validMaterials = formWO.materials.filter((m) => m.name.trim().length > 0);

    createWorkOrder({
      woNumber: formWO.woNumber,
      woDate: formWO.woDate,
      title: `[${formWO.woCategory}] ${formWO.assetName}`,
      description: formWO.description || `Pekerjaan ${formWO.jobType} pada aset ${formWO.assetName}.`,
      assetId: formWO.assetId,
      assetName: formWO.assetName,
      location: formWO.location,
      priority: formWO.priority,
      woCategory: formWO.woCategory,
      jobType: formWO.jobType,
      vendorName: formWO.vendorName,
      assignedToId: formWO.assignedToId,
      assignedToName: formWO.assignedToName,
      materials: validMaterials,
      photos: formWO.photos,
      status: 'Open',
      createdById: currentUser?.id || 'admin',
      createdByName: currentUser?.name || 'Admin MTCPRO',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
      estimatedHours: 4,
      stepsCompleted: [],
      sparePartsUsed: validMaterials.map((m) => ({
        partId: m.id,
        partName: m.name,
        quantity: m.qty,
        sku: m.unit
      }))
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
    if (!targetWOForAssign || !selectedTechId) return;
    assignWorkOrder(targetWOForAssign.id, selectedTechId);
    setIsAssignModalOpen(false);
    setTargetWOForAssign(null);
  };

  const kanbanColumns: { status: WOStatus; label: string; bg: string }[] = [
    { status: 'Open', label: '1. Antrean Tiket (Open)', bg: 'border-t-blue-500' },
    { status: 'Proses', label: '2. Sedang Dikerjakan (In Progress)', bg: 'border-t-amber-500' },
    { status: 'Pending', label: '3. Pending Sparepart / Vendor', bg: 'border-t-purple-500' },
    { status: 'Selesai', label: '4. Selesai (Menunggu SPV)', bg: 'border-t-emerald-500' },
    { status: 'Disetujui', label: '5. Disetujui & Closed', bg: 'border-t-slate-400' }
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
            Pelacakan instruksi kerja, corrective maintenance, penugasan teknisi, dan dokumentasi foto lapangan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {(role === 'admin' || role === 'supervisor') && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan WO Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor WO, nama aset, lokasi, atau nama pelaksana..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-medium text-slate-700"
          >
            <option value="ALL">Semua Prioritas</option>
            {WO_PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-medium text-slate-700"
          >
            <option value="ALL">Semua Kategori WO</option>
            {WO_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Open">Open</option>
            <option value="Proses">Proses</option>
            <option value="Pending">Pending</option>
            <option value="Selesai">Selesai</option>
            <option value="Disetujui">Disetujui</option>
          </select>

          {(searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedPriority('ALL');
                setSelectedStatus('ALL');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: List or Kanban */}
      {viewMode === 'list' ? (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">No. WO</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Nama Aset & Lokasi</th>
                  <th className="px-4 py-3">Kategori & Jenis</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pelaksana</th>
                  <th className="px-4 py-3 text-center">Part</th>
                  <th className="px-4 py-3 text-center">Foto</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWOs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400">
                      Tidak ada Work Order yang sesuai dengan filter.
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
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {wo.woNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {wo.woDate || (wo.createdAt ? wo.createdAt.substring(0, 10) : '-')}
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">{wo.assetName || wo.title}</div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{wo.location || '-'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {wo.woCategory || 'Corrective'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {wo.jobType || 'Mechanical'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <PriorityBadge priority={wo.priority} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={wo.status} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-slate-800 font-semibold">{wo.assignedToName || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{wo.vendorName || 'Internal'}</div>
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                        {wo.materials && wo.materials.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                            {wo.materials.length} item
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {wo.photos && wo.photos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <ImageIcon className="w-3 h-3" />
                            <span>{wo.photos.length}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
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
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-800 truncate">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {columnWOs.length}
                  </span>
                </div>

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
                          {wo.assetName || wo.title}
                        </h4>

                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{wo.location || '-'}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                          <span className="truncate max-w-[100px] font-medium">
                            {wo.assignedToName || 'Unassigned'}
                          </span>
                          <span className="font-mono text-slate-400">{wo.woDate || (wo.createdAt ? wo.createdAt.substring(0, 10) : '')}</span>
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
          title={`${selectedWOForDetail.woNumber}: ${selectedWOForDetail.assetName || selectedWOForDetail.title}`}
          subtitle={`Tanggal WO: ${selectedWOForDetail.woDate || selectedWOForDetail.createdAt.substring(0, 10)} • Kategori: ${selectedWOForDetail.woCategory || 'Corrective'}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status, Priority & Meta Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedWOForDetail.status} size="md" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Prioritas</span>
                <div className="mt-1">
                  <PriorityBadge priority={selectedWOForDetail.priority} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Jenis Pekerjaan</span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {selectedWOForDetail.jobType || 'Mechanical'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pelaksana</span>
                <p className="text-xs font-bold text-blue-700 mt-1">
                  {selectedWOForDetail.assignedToName || 'Belum Ditugaskan'}
                </p>
              </div>
            </div>

            {/* Parameter Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Aset:</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedWOForDetail.assetName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lokasi:</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedWOForDetail.location}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vendor Pelaksana:</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{selectedWOForDetail.vendorName || 'Internal Facilities Team'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Diterbitkan Oleh:</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{selectedWOForDetail.createdByName || 'Admin'}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Deskripsi Pekerjaan:</span>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 leading-relaxed font-mono text-xs">
                {selectedWOForDetail.description}
              </div>
            </div>

            {/* Part/Material/Mesin Table */}
            {selectedWOForDetail.materials && selectedWOForDetail.materials.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Daftar Part / Material / Mesin yang Digunakan:
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 w-12 text-center">NO</th>
                        <th className="px-3 py-2">Nama Part/Material/Mesin</th>
                        <th className="px-3 py-2 w-20 text-center">QTY</th>
                        <th className="px-3 py-2 w-24">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedWOForDetail.materials.map((m, idx) => (
                        <tr key={m.id || idx}>
                          <td className="px-3 py-2 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{m.name}</td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-blue-700">{m.qty}</td>
                          <td className="px-3 py-2 text-slate-600">{m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documentation Photos Gallery */}
            {selectedWOForDetail.photos && selectedWOForDetail.photos.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Dokumentasi Foto Lapangan ({selectedWOForDetail.photos.length} Foto):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {selectedWOForDetail.photos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={photo} alt={`Dokumentasi ${pIdx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedWOForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
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
          onClose={() => setIsAssignModalOpen(false)}
          title={`Tugaskan Teknisi: ${targetWOForAssign.woNumber}`}
          subtitle={`Aset: ${targetWOForAssign.assetName}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Pilih Teknisi Penanggung Jawab
              </label>
              <div className="space-y-2">
                {technicians.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedTechId === t.id
                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tech_assign"
                      value={t.id}
                      checked={selectedTechId === t.id}
                      onChange={() => setSelectedTechId(t.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-xs">{t.name}</p>
                      <p className="text-[10px] text-slate-500">{t.specialization}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hidden file inputs for Camera & Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFiles}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handlePhotoFiles}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* REVISED: Create New Work Order Modal with EXACT requested form fields */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Terbitkan Work Order Baru"
        subtitle="Formulir penerbitan tiket pemeliharaan, alokasi material & dokumentasi foto"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveCreate} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {/* 1. NO WO */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                NO WO <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formWO.woNumber}
                onChange={(e) => setFormWO({ ...formWO, woNumber: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                placeholder="e.g. WO-2026-0001"
              />
            </div>

            {/* 2. Tanggal WO */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Tanggal WO <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formWO.woDate}
                onChange={(e) => setFormWO({ ...formWO, woDate: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* 3. Prioritas (Emergency, High, Medium, Low) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Prioritas <span className="text-rose-500">*</span>
              </label>
              <select
                value={formWO.priority}
                onChange={(e) => setFormWO({ ...formWO, priority: e.target.value as WOPriority })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                {WO_PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Kategori WO (Corrective, Preventive, Inspection, Operation, Supervise) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Kategori WO <span className="text-rose-500">*</span>
              </label>
              <select
                value={formWO.woCategory}
                onChange={(e) => setFormWO({ ...formWO, woCategory: e.target.value as WOCategory })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                {WO_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Jenis Pekerjaan (Mechanical, Electrical, Sipil, Others) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Jenis Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formWO.jobType}
                onChange={(e) => setFormWO({ ...formWO, jobType: e.target.value as JobType })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                {JOB_TYPE_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Vendor Pelaksana */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Vendor Pelaksana
              </label>
              <select
                value={formWO.vendorName}
                onChange={(e) => setFormWO({ ...formWO, vendorName: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                <option value="Internal Facilities Team">Internal Facilities Team</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Nama Pelaksana */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Pelaksana
              </label>
              <select
                value={formWO.assignedToId}
                onChange={(e) => {
                  const tech = technicians.find((t) => t.id === e.target.value);
                  setFormWO({
                    ...formWO,
                    assignedToId: e.target.value,
                    assignedToName: tech ? tech.name : 'Tim Teknisi'
                  });
                }}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                <option value="">-- Pilih Teknisi / Pelaksana --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* 8. Nama Aset */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Aset <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formWO.assetId}
                onChange={(e) => handleAssetSelectChange(e.target.value)}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-900"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name} — {a.location}
                  </option>
                ))}
              </select>
            </div>

            {/* 9. Lokasi */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formWO.location}
                onChange={(e) => setFormWO({ ...formWO, location: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                placeholder="e.g. Lantai 12 — Ruang AHU Sayap Barat"
              />
            </div>

            {/* 10. Deskripsi */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Deskripsi Detail Masalah / Instruksi Kerja <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formWO.description}
                onChange={(e) => setFormWO({ ...formWO, description: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                placeholder="Jelaskan detail temuan masalah, kebocoran, error code, atau lingkup perbaikan yang harus dilakukan..."
              />
            </div>
          </div>

          {/* 11. Part/Material/Mesin Table */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                <span>Part / Material / Mesin yang Dibutuhkan:</span>
              </label>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Baris Part</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-3 py-1.5 w-12 text-center">NO</th>
                    <th className="px-3 py-1.5">Nama Part / Material / Mesin</th>
                    <th className="px-3 py-1.5 w-24 text-center">QTY</th>
                    <th className="px-3 py-1.5 w-28">Unit</th>
                    <th className="px-2 py-1.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 bg-white">
                  {formWO.materials.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="px-3 py-1.5 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateMaterialRow(item.id, 'name', e.target.value)}
                          placeholder="e.g. Mechanical Seal / Freon R-134a / V-Belt B-68"
                          className="w-full py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleUpdateMaterialRow(item.id, 'qty', Number(e.target.value))}
                          className="w-full py-1 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-center focus:outline-hidden focus:border-blue-500 focus:bg-white text-blue-700"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateMaterialRow(item.id, 'unit', e.target.value)}
                          className="w-full py-1 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Set">Set</option>
                          <option value="Liter">Liter</option>
                          <option value="Meter">Meter</option>
                          <option value="Roll">Roll</option>
                          <option value="Batang">Batang</option>
                          <option value="Box">Box</option>
                          <option value="Unit">Unit</option>
                        </select>
                      </td>
                      <td className="px-2 py-1 text-center">
                        {formWO.materials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 12. Dokumentasi (Camera & Photo Upload) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Dokumentasi Foto Lapangan:</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  <span>Ambil Foto (Kamera)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {formWO.photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                {formWO.photos.map((photo, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-300 aspect-video group bg-white shadow-2xs">
                    <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-opacity shadow-xs"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 bg-slate-50/50 text-[11px] flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-300" />
                <span>Belum ada foto dokumentasi diunggah. Klik tombol kamera atau upload di atas.</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
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
