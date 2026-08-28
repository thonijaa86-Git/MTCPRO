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
  FileText,
  ShieldCheck,
  CalendarRange,
  Eye,
  Edit2,
  CheckSquare,
  Square
} from 'lucide-react';

export const WO_PRIORITY_OPTIONS: WOPriority[] = ['Emergency', 'High', 'Medium', 'Low'];
export const WO_CATEGORY_OPTIONS: WOCategory[] = ['Corrective', 'Preventive', 'Installation', 'Inspection', 'Operation', 'Supervise'];
export const JOB_TYPE_OPTIONS: JobType[] = ['Mechanical', 'Electrical', 'Sipil', 'Others'];

export const WorkOrdersView: React.FC = () => {
  const {
    currentUser,
    workOrders,
    assets,
    users,
    vendors,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    deleteBulkWorkOrders,
    updateWorkOrderStatus,
    updateWorkOrderPriority,
    assignWorkOrder,
    selectedWOForDetail,
    setSelectedWOForDetail
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const technicians = users.filter((u) => u.role === 'teknisi');
  const supervisors = users.filter((u) => u.role === 'supervisor' || u.role === 'manager' || u.role === 'admin');

  // View & Filter states
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Multi-select state
  const [selectedWOIds, setSelectedWOIds] = useState<string[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWOId, setEditingWOId] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetWOForAssign, setTargetWOForAssign] = useState<WorkOrder | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>('');

  // File / Camera upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formWO, setFormWO] = useState({
    woNumber: '',
    woDate: new Date().toISOString().substring(0, 10),
    priority: 'Medium' as WOPriority,
    woCategory: 'Corrective' as WOCategory,
    jobType: 'Mechanical' as JobType,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 2 * 86400000).toISOString().substring(0, 10),
    vendorName: 'Internal Facilities Team',
    assignedToName: '',
    assignedToId: '',
    supervisorName: '',
    supervisorId: '',
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
      (wo.assignedToName && wo.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (wo.supervisorName && wo.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || (wo.woCategory ? wo.woCategory === selectedCategory : true);

    const matchesPriority =
      selectedPriority === 'ALL' || wo.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === 'ALL' || wo.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedWOIds.length === filteredWOs.length && filteredWOs.length > 0) {
      setSelectedWOIds([]);
    } else {
      setSelectedWOIds(filteredWOs.map((w) => w.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWOIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedWOIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedWOIds.length} Work Order terpilih?`)) {
      deleteBulkWorkOrders(selectedWOIds);
      setSelectedWOIds([]);
    }
  };

  const handleDeleteSingle = (wo: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus Work Order ${wo.woNumber} (${wo.assetName})?`)) {
      deleteWorkOrder(wo.id);
      setSelectedWOIds((prev) => prev.filter((id) => id !== wo.id));
    }
  };

  const handleOpenCreate = () => {
    const nextCount = workOrders.length + 1;
    const generatedWONumber = `WO-${new Date().getFullYear()}-${nextCount.toString().padStart(4, '0')}`;
    const defaultAsset = assets[0];
    const defaultTech = technicians[0];
    const defaultSpv = supervisors.find((u) => u.role === 'supervisor') || supervisors[0];

    const todayStr = new Date().toISOString().substring(0, 10);
    const endStr = new Date(Date.now() + 2 * 86400000).toISOString().substring(0, 10);

    setFormWO({
      woNumber: generatedWONumber,
      woDate: todayStr,
      priority: 'Medium',
      woCategory: 'Corrective',
      jobType: 'Mechanical',
      startDate: todayStr,
      endDate: endStr,
      vendorName: 'Internal Facilities Team',
      assignedToName: defaultTech ? defaultTech.name : '',
      assignedToId: defaultTech ? defaultTech.id : '',
      supervisorName: defaultSpv ? defaultSpv.name : '',
      supervisorId: defaultSpv ? defaultSpv.id : '',
      location: defaultAsset ? defaultAsset.location : '',
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

  const handleOpenEdit = (wo: WorkOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingWOId(wo.id);

    const defaultTech = technicians.find((t) => t.id === wo.assignedToId || t.name === wo.assignedToName);
    const defaultSpv = supervisors.find((s) => s.id === wo.supervisorId || s.name === wo.supervisorName);

    setFormWO({
      woNumber: wo.woNumber,
      woDate: wo.woDate || (wo.createdAt ? wo.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10)),
      priority: wo.priority || 'Medium',
      woCategory: (wo.woCategory as WOCategory) || 'Corrective',
      jobType: (wo.jobType as JobType) || 'Mechanical',
      startDate: wo.startDate || (wo.createdAt ? wo.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10)),
      endDate: wo.endDate || wo.dueDate || new Date(Date.now() + 2 * 86400000).toISOString().substring(0, 10),
      vendorName: wo.vendorName || 'Internal Facilities Team',
      assignedToName: wo.assignedToName || (defaultTech ? defaultTech.name : ''),
      assignedToId: wo.assignedToId || (defaultTech ? defaultTech.id : ''),
      supervisorName: wo.supervisorName || (defaultSpv ? defaultSpv.name : ''),
      supervisorId: wo.supervisorId || (defaultSpv ? defaultSpv.id : ''),
      location: wo.location || '',
      assetName: wo.assetName || '',
      assetId: wo.assetId || '',
      description: wo.description || '',
      materials: (wo.materials && wo.materials.length > 0)
        ? wo.materials
        : [{ id: 'mat-1', name: '', qty: 1, unit: 'Pcs' }],
      photos: wo.photos || []
    });
    setIsEditModalOpen(true);
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

    // Auto-resolve asset info
    let selectedAsset = assets.find((a) => a.id === formWO.assetId);
    if (!selectedAsset && assets.length > 0) {
      selectedAsset = assets[0];
    }
    const finalAssetName = formWO.assetName.trim() || selectedAsset?.name || 'Aset Fasilitas';
    const finalAssetId = formWO.assetId || selectedAsset?.id || '';
    const finalLocation = formWO.location.trim() || selectedAsset?.location || 'Fasilitas Dahana';
    const finalWONumber = formWO.woNumber.trim() || `WO-${new Date().getFullYear()}-${(workOrders.length + 1).toString().padStart(4, '0')}`;

    // Resolve technician info
    let techName = formWO.assignedToName;
    if (formWO.assignedToId && !techName) {
      const t = users.find((u) => u.id === formWO.assignedToId);
      if (t) techName = t.name;
    }

    // Resolve supervisor info
    let spvName = formWO.supervisorName;
    if (formWO.supervisorId && !spvName) {
      const s = users.find((u) => u.id === formWO.supervisorId);
      if (s) spvName = s.name;
    }

    const validMaterials = formWO.materials.filter((m) => m.name && m.name.trim().length > 0);

    createWorkOrder({
      woNumber: finalWONumber,
      woDate: formWO.woDate,
      title: `[${formWO.woCategory}] ${finalAssetName}`,
      description: formWO.description.trim() || `Pekerjaan ${formWO.jobType} pada ${finalAssetName} di lokasi ${finalLocation}.`,
      assetId: finalAssetId,
      assetName: finalAssetName,
      location: finalLocation,
      priority: formWO.priority,
      woCategory: formWO.woCategory,
      jobType: formWO.jobType,
      startDate: formWO.startDate,
      endDate: formWO.endDate,
      dueDate: formWO.endDate,
      vendorName: formWO.vendorName,
      assignedToId: formWO.assignedToId,
      assignedToName: techName,
      supervisorId: formWO.supervisorId,
      supervisorName: spvName,
      materials: validMaterials,
      photos: formWO.photos,
      status: 'Open',
      createdById: currentUser?.id || 'admin',
      createdByName: currentUser?.name || 'Admin MTCPRO',
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWOId) return;

    // Resolve asset info
    let selectedAsset = assets.find((a) => a.id === formWO.assetId);
    const finalAssetName = formWO.assetName.trim() || selectedAsset?.name || 'Aset Fasilitas';
    const finalAssetId = formWO.assetId || selectedAsset?.id || '';
    const finalLocation = formWO.location.trim() || selectedAsset?.location || 'Fasilitas Dahana';

    // Resolve technician info
    let techName = formWO.assignedToName;
    if (formWO.assignedToId && !techName) {
      const t = users.find((u) => u.id === formWO.assignedToId);
      if (t) techName = t.name;
    }

    // Resolve supervisor info
    let spvName = formWO.supervisorName;
    if (formWO.supervisorId && !spvName) {
      const s = users.find((u) => u.id === formWO.supervisorId);
      if (s) spvName = s.name;
    }

    const validMaterials = formWO.materials.filter((m) => m.name && m.name.trim().length > 0);

    updateWorkOrder(editingWOId, {
      woNumber: formWO.woNumber,
      woDate: formWO.woDate,
      title: `[${formWO.woCategory}] ${finalAssetName}`,
      description: formWO.description.trim() || `Pekerjaan ${formWO.jobType} pada ${finalAssetName}.`,
      assetId: finalAssetId,
      assetName: finalAssetName,
      location: finalLocation,
      priority: formWO.priority,
      woCategory: formWO.woCategory,
      jobType: formWO.jobType,
      startDate: formWO.startDate,
      endDate: formWO.endDate,
      dueDate: formWO.endDate,
      vendorName: formWO.vendorName,
      assignedToId: formWO.assignedToId,
      assignedToName: techName,
      supervisorId: formWO.supervisorId,
      supervisorName: spvName,
      materials: validMaterials,
      photos: formWO.photos
    });

    setIsEditModalOpen(false);
    setEditingWOId(null);
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
    { status: 'Pending', label: '3. Pending Sparepart / Perusahaan', bg: 'border-t-purple-500' },
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

      {/* Bulk Action Banner */}
      {selectedWOIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedWOIds.length}
            </span>
            <span className="font-semibold">Work Order terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedWOIds([])}
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
              <span>Hapus {selectedWOIds.length} Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor WO, nama aset, lokasi, pelaksana, atau supervisor..."
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
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedWOIds.length > 0 && selectedWOIds.length === filteredWOs.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      title="Pilih Semua Baris"
                    />
                  </th>
                  <th className="px-4 py-3">No. WO</th>
                  <th className="px-4 py-3">Tanggal WO</th>
                  <th className="px-4 py-3">Nama Aset & Lokasi</th>
                  <th className="px-4 py-3">Kategori & Jenis</th>
                  <th className="px-4 py-3">Jadwal Pekerjaan</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pelaksana</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3 text-center">Part</th>
                  <th className="px-4 py-3 text-center">Foto</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWOs.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-slate-400">
                      Tidak ada Work Order yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredWOs.map((wo) => {
                    const isSelected = selectedWOIds.includes(wo.id);
                    return (
                      <tr
                        key={wo.id}
                        onClick={() => setSelectedWOForDetail(wo)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(wo.id, e as any)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

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
                          <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1">
                            <CalendarRange className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{wo.startDate || wo.createdAt?.substring(0, 10) || '-'}</span>
                            <span className="text-slate-400">s/d</span>
                            <span>{wo.endDate || wo.dueDate || '-'}</span>
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

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-slate-800 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{wo.supervisorName || wo.approvedByName || '-'}</span>
                          </div>
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

                        {/* Action Column: Lihat (Detail), Edit, Delete, Assign */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedWOForDetail(wo)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Work Order"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {(role === 'admin' || role === 'supervisor') && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(wo, e)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Work Order"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenAssign(wo, e)}
                                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                  title="Assign Teknisi"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSingle(wo, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Work Order"
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleOpenEdit(wo, e)}
                              className="p-1 text-slate-300 hover:text-amber-600 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <PriorityBadge priority={wo.priority} showIcon={false} />
                          </div>
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
                          <span className="font-mono text-slate-400">{wo.endDate || wo.dueDate || (wo.createdAt ? wo.createdAt.substring(0, 10) : '')}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-xl">
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Supervisor Pengawas:</span>
                <p className="font-semibold text-blue-800 text-xs mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedWOForDetail.supervisorName || selectedWOForDetail.approvedByName || '-'}</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Jadwal Pekerjaan:</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5 font-mono flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedWOForDetail.startDate || selectedWOForDetail.createdAt?.substring(0, 10)} s/d {selectedWOForDetail.endDate || selectedWOForDetail.dueDate || '-'}</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Perusahaan Pelaksana:</span>
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
                    <thead className="bg-slate-900 text-white font-semibold">
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
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {(role === 'admin' || role === 'supervisor') && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedWOForDetail;
                    setSelectedWOForDetail(null);
                    handleOpenEdit(target);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data WO</span>
                </button>
              )}
              <button
                onClick={() => setSelectedWOForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs ml-auto"
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

      {/* REVISED: Create / Edit Work Order Modal with EXACT requested form fields & clean intuitive layout */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setEditingWOId(null);
        }}
        title={isEditModalOpen ? `Edit Work Order: ${formWO.woNumber}` : 'Terbitkan Work Order Baru'}
        subtitle="Formulir penerbitan tiket pemeliharaan, jadwal pengerjaan & alokasi material"
        maxWidth="3xl"
      >
        <form onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveCreate} className="space-y-3 text-xs">
          {/* BARIS 1: IDENTIFIKASI DOKUMEN & PRIORITAS (3 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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

            {/* 3. Prioritas */}
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
          </div>

          {/* BARIS 2: KLASIFIKASI & JADWAL PEKERJAAN (4 Kolom Terintegrasi) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 4. Kategori WO */}
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

            {/* 5. Jenis Pekerjaan */}
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

            {/* 6. Jadwal Pekerjaan: Mulai Tanggal */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-700 mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span>Mulai Tanggal <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={formWO.startDate}
                onChange={(e) => setFormWO({ ...formWO, startDate: e.target.value })}
                className="w-full py-1.5 px-3 bg-blue-50/40 border border-blue-200 rounded-lg font-mono text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* 7. Jadwal Pekerjaan: Selesai Tanggal */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-700 mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span>Selesai Tanggal <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={formWO.endDate}
                onChange={(e) => setFormWO({ ...formWO, endDate: e.target.value })}
                className="w-full py-1.5 px-3 bg-blue-50/40 border border-blue-200 rounded-lg font-mono text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* BARIS 3: PERUSAHAAN PELAKSANA & TIM PENANGGUNG JAWAB (3 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* 8. Perusahaan Pelaksana */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Perusahaan Pelaksana
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

            {/* 9. Nama Pelaksana */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Pelaksana (Teknisi)
              </label>
              <select
                value={formWO.assignedToId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const tech = users.find((t) => t.id === selectedId);
                  setFormWO({
                    ...formWO,
                    assignedToId: selectedId,
                    assignedToName: tech ? tech.name : (selectedId ? 'Tim Teknisi' : '')
                  });
                }}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                <option value="">-- Pilih Teknisi / Pelaksana --</option>
                {users.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.position || t.specialization || t.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* 10. Nama Supervisor */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Supervisor (Pengawas)
              </label>
              <select
                value={formWO.supervisorId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const spv = users.find((s) => s.id === selectedId);
                  setFormWO({
                    ...formWO,
                    supervisorId: selectedId,
                    supervisorName: spv ? spv.name : (selectedId ? 'Supervisor MEP' : '')
                  });
                }}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-800"
              >
                <option value="">-- Pilih Supervisor Pengawas --</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.position || s.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BARIS 4: OBJEK ASET & LOKASI DETAIL (2 Kolom Berdampingan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* 11. Nama Aset */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Nama Aset <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formWO.assetId}
                onChange={(e) => handleAssetSelectChange(e.target.value)}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white text-slate-900"
              >
                <option value="" disabled>-- Pilih Objek Aset --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 12. Lokasi */}
            <div>
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
          </div>

          {/* BARIS 5: DESKRIPSI MASALAH / INSTRUKSI (Full Width) */}
          <div>
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

          {/* BARIS 6: TABEL PART / MATERIAL / MESIN */}
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
                <thead className="bg-slate-900 text-white font-semibold text-[11px]">
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

          {/* BARIS 7: DOKUMENTASI FOTO */}
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
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditingWOId(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              {isEditModalOpen ? 'Simpan Perubahan' : 'Terbitkan Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
