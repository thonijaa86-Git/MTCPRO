import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Asset, MepCategory, AssetStatus, AssetCondition } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const AssetsView: React.FC = () => {
  const {
    currentUser,
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    selectedAssetForDetail,
    setSelectedAssetForDetail,
    setCurrentView
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'Mechanical' as MepCategory,
    location: '',
    status: 'Operasional' as AssetStatus,
    condition: 'Baik' as AssetCondition,
    manufacturer: '',
    model: '',
    serialNumber: '',
    capacity: '',
    powerRating: '',
    notes: ''
  });

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || asset.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    const count = assets.length + 1;
    setFormData({
      assetTag: `MEP-MEC-${count.toString().padStart(3, '0')}`,
      name: '',
      category: 'Mechanical',
      location: 'Basement 1 — Machine Room',
      status: 'Operasional',
      condition: 'Sangat Baik',
      manufacturer: '',
      model: '',
      serialNumber: '',
      capacity: '',
      powerRating: '',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAsset(asset);
    setFormData({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      status: asset.status,
      condition: asset.condition,
      manufacturer: asset.manufacturer || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      capacity: asset.capacity || '',
      powerRating: asset.powerRating || '',
      notes: asset.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.assetTag.trim()) return;

    addAsset({
      ...formData,
      installDate: new Date().toISOString().substring(0, 10),
      lastMaintenance: new Date().toISOString().substring(0, 10),
      nextMaintenance: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    updateAsset(editingAsset.id, formData);
    setIsEditModalOpen(false);
    setEditingAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Pengelolaan Aset MEP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaris komprehensif sistem Mechanical, Electrical, dan Plumbing
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset MEP Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama aset, kode tag (MEP-MEC-...), atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="ALL">Semua Kategori MEP</option>
            <option value="Mechanical">Mechanical (HVAC, Pompa, Hydrant)</option>
            <option value="Electrical">Electrical (Genset, Panel, Trafo)</option>
            <option value="Plumbing">Plumbing (Booster, STP, Drainage)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Operasional">Operasional</option>
            <option value="Perbaikan">Perbaikan</option>
            <option value="Kritis">Kritis</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>

          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
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

      {/* Asset Table */}
      <div className="industrial-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Tag Aset</th>
                <th className="px-4 py-3">Nama Mesin / Peralatan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Lokasi Fasilitas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Kondisi</th>
                <th className="px-4 py-3">Jadwal Servis Berikutnya</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Tidak ada aset MEP yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetForDetail(asset)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {asset.manufacturer} {asset.model && `• ${asset.model}`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <CategoryBadge category={asset.category} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{asset.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold">{asset.condition}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {asset.nextMaintenance || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedAssetForDetail(asset)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Detail Aset & QR Tag"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={(e) => handleOpenEdit(asset, e)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Yakin ingin menghapus aset ${asset.name}?`)) {
                                  deleteAsset(asset.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail & QR Tag Modal */}
      {selectedAssetForDetail && (
        <Modal
          isOpen={!!selectedAssetForDetail}
          onClose={() => setSelectedAssetForDetail(null)}
          title={`Detail Aset: ${selectedAssetForDetail.name}`}
          subtitle={`Tag: ${selectedAssetForDetail.assetTag} • Kategori: ${selectedAssetForDetail.category}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Status Operasi</span>
                <div className="mt-1">
                  <StatusBadge status={selectedAssetForDetail.status} size="md" />
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Kondisi Fisik</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedAssetForDetail.condition}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Lokasi Penempatan</span>
                <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAssetForDetail.location}
                </p>
              </div>
            </div>

            {/* Technical Specifications & QR Mock */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Specs (8 cols) */}
              <div className="md:col-span-8 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Spesifikasi Teknis
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Manufaktur / Merk:</span>
                    <p className="font-bold text-slate-800">{selectedAssetForDetail.manufacturer || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Model & Tipe:</span>
                    <p className="font-bold text-slate-800">{selectedAssetForDetail.model || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Serial Number:</span>
                    <p className="font-mono font-bold text-slate-800">{selectedAssetForDetail.serialNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Kapasitas Output:</span>
                    <p className="font-bold text-slate-800">{selectedAssetForDetail.capacity || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Rating Daya Kelistrikan:</span>
                    <p className="font-bold text-slate-800">{selectedAssetForDetail.powerRating || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Tanggal Instalasi:</span>
                    <p className="font-mono text-slate-800">{selectedAssetForDetail.installDate || '-'}</p>
                  </div>
                </div>

                {selectedAssetForDetail.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="font-bold text-blue-900 text-[11px] uppercase">Catatan Pemeliharaan:</span>
                    <p className="text-blue-950 mt-0.5">{selectedAssetForDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* QR Tag Simulation (4 cols) */}
              <div className="md:col-span-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-lg border border-slate-300 shadow-xs mb-2">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-28 h-28 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h30v30H0zm5 5h20v20H5zm5 5h10v10H10zM70 0h30v30H70zm5 5h20v20H75zm5 5h10v10H80zM0 70h30v30H0zm5 5h20v20H5zm5 5h10v10H10zM40 10h10v10H40zm10 10h10v10H50zm-10 20h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm-30 10h10v10H40zm20 0h10v10H60zm10 10h10v10H70zm10 10h10v10H80zm-40 10h10v10H40zm20 0h10v10H60z" />
                  </svg>
                </div>
                <span className="font-mono font-bold text-xs text-slate-900">{selectedAssetForDetail.assetTag}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Industrial QR Asset Tag</span>
                <button
                  onClick={() => alert(`Cetak Label QR untuk Aset ${selectedAssetForDetail.assetTag}`)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                >
                  Cetak QR Label
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedAssetForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Asset Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingAsset(null);
        }}
        title={isAddModalOpen ? 'Tambah Aset MEP Baru' : `Edit Data Aset: ${editingAsset?.assetTag}`}
        subtitle="Masukkan parameter spesifikasi peralatan dan lokasi fasilitas"
        maxWidth="2xl"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tag / Kode Aset (Wajib)</label>
              <input
                type="text"
                required
                value={formData.assetTag}
                onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. MEP-MEC-009"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori MEP</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as MepCategory })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="Mechanical">Mechanical (HVAC, Pompa, Chiller)</option>
                <option value="Electrical">Electrical (Genset, Panel, Trafo)</option>
                <option value="Plumbing">Plumbing (Booster, STP, Piping)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Mesin / Peralatan (Wajib)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
                placeholder="e.g. Primary Chilled Water Pump (PCWP #02)"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Penempatan</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Basement 2 — Ruang Pompa"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Operasional</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="Operasional">Operasional</option>
                <option value="Perbaikan">Perbaikan</option>
                <option value="Kritis">Kritis</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kondisi Fisik</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Perlu Perhatian">Perlu Perhatian</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufaktur / Merk</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Grundfos / Daikin / Cummins"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model / Tipe & Serial</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. CRE 20-5 (SN: GF-2024-991)"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rating Daya / Kapasitas</label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. 500 TR / 15 kW / 45 m³/h"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="Catatan inspeksi berkala, histori part, dll."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Simpan Aset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
