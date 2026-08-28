import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SparePart, MepCategory } from '../types';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  PackagePlus,
  CheckCircle2,
  DollarSign,
  MapPin,
  RefreshCw,
  Building,
  Layers,
  Eye,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export const SparePartsView: React.FC = () => {
  const {
    currentUser,
    spareParts,
    restockSparePart,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    deleteBulkSpareParts
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Multi-Select
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  // Modals
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [selectedPartForDetail, setSelectedPartForDetail] = useState<SparePart | null>(null);
  const [targetPartForRestock, setTargetPartForRestock] = useState<SparePart | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form State
  const [formPart, setFormPart] = useState({
    sku: '',
    name: '',
    category: 'HVAC' as MepCategory,
    stock: 10,
    minThreshold: 5,
    unit: 'Pcs',
    unitCost: 150000,
    locationRack: 'Rak M-01',
    supplier: '',
    compatibleAssetsText: 'AHU, Chiller'
  });

  const filteredParts = spareParts.filter((part) => {
    const matchesSearch =
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.locationRack.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.supplier && part.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || part.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = spareParts.filter((p) => p.stock <= p.minThreshold).length;

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedPartIds.length === filteredParts.length && filteredParts.length > 0) {
      setSelectedPartIds([]);
    } else {
      setSelectedPartIds(filteredParts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedPartIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedPartIds.length} spare part terpilih?`)) {
      deleteBulkSpareParts(selectedPartIds);
      setSelectedPartIds([]);
    }
  };

  const handleDeleteSingle = (part: SparePart, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus suku cadang ${part.name} [${part.sku}]?`)) {
      deleteSparePart(part.id);
      setSelectedPartIds((prev) => prev.filter((id) => id !== part.id));
    }
  };

  const handleOpenRestock = (part: SparePart, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetPartForRestock(part);
    setRestockAmount(10);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = () => {
    if (targetPartForRestock && restockAmount > 0) {
      restockSparePart(targetPartForRestock.id, Number(restockAmount));
      setIsRestockModalOpen(false);
      setTargetPartForRestock(null);
    }
  };

  const handleOpenAdd = () => {
    const count = spareParts.length + 1;
    setFormPart({
      sku: `PRT-MEC-${count.toString().padStart(2, '0')}`,
      name: '',
      category: 'HVAC',
      stock: 0,
      minThreshold: 5,
      unit: 'Pcs',
      unitCost: 0,
      locationRack: '',
      supplier: '',
      compatibleAssetsText: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (part: SparePart, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPartId(part.id);
    setFormPart({
      sku: part.sku,
      name: part.name,
      category: part.category,
      stock: part.stock,
      minThreshold: part.minThreshold,
      unit: part.unit,
      unitCost: part.unitCost,
      locationRack: part.locationRack,
      supplier: part.supplier || '',
      compatibleAssetsText: part.compatibleAssets ? part.compatibleAssets.join(', ') : ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPart.name.trim() || !formPart.sku.trim()) return;

    addSparePart({
      sku: formPart.sku,
      name: formPart.name,
      category: formPart.category,
      stock: Number(formPart.stock),
      minThreshold: Number(formPart.minThreshold),
      unit: formPart.unit,
      unitCost: Number(formPart.unitCost),
      locationRack: formPart.locationRack,
      supplier: formPart.supplier,
      compatibleAssets: formPart.compatibleAssetsText.split(',').map((s) => s.trim()).filter(Boolean),
      lastRestocked: new Date().toISOString().substring(0, 10)
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartId || !formPart.name.trim() || !formPart.sku.trim()) return;

    updateSparePart(editingPartId, {
      sku: formPart.sku,
      name: formPart.name,
      category: formPart.category,
      stock: Number(formPart.stock),
      minThreshold: Number(formPart.minThreshold),
      unit: formPart.unit,
      unitCost: Number(formPart.unitCost),
      locationRack: formPart.locationRack,
      supplier: formPart.supplier,
      compatibleAssets: formPart.compatibleAssetsText.split(',').map((s) => s.trim()).filter(Boolean)
    });

    setIsEditModalOpen(false);
    setEditingPartId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Inventaris & Stok Spare Part MEP</span>
          </h2>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Spare Part Baru</span>
          </button>
        )}
      </div>

      {/* Low Stock Warning Header if any */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">{lowStockCount} Suku Cadang Berada di Bawah Batas Minimum!</span>
              <p className="text-amber-800 mt-0.5">
                Segera lakukan Purchase Requisition (PR) atau restok untuk mencegah keterlambatan perbaikan mesin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Banner */}
      {selectedPartIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedPartIds.length}
            </span>
            <span className="font-semibold">Spare Part terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPartIds([])}
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
              <span>Hapus {selectedPartIds.length} Suku Cadang Terpilih</span>
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
            placeholder="Cari SKU (PRT-...), nama part, supplier, atau lokasi rak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori MEP</option>
            <option value="HVAC">HVAC</option>
            <option value="Kelistrikan">Kelistrikan</option>
            <option value="Genset">Genset</option>
            <option value="Air bersih">Air Bersih</option>
            <option value="IPAL">IPAL</option>
            <option value="Hydrant">Hydrant</option>
            <option value="Fire Alarm">Fire Alarm</option>
            <option value="CCTV">CCTV</option>
          </select>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Spare Parts Table */}
      <div className="industrial-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPartIds.length > 0 && selectedPartIds.length === filteredParts.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    title="Pilih Semua Suku Cadang"
                  />
                </th>
                <th className="px-4 py-3">SKU Part</th>
                <th className="px-4 py-3">Nama Suku Cadang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Stok Saat Ini</th>
                <th className="px-4 py-3">Batas Minimum</th>
                <th className="px-4 py-3">Harga Satuan</th>
                <th className="px-4 py-3">Lokasi Rak</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    Tidak ada suku cadang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isCritical = part.stock <= part.minThreshold;
                  const isSelected = selectedPartIds.includes(part.id);
                  return (
                    <tr
                      key={part.id}
                      onClick={() => setSelectedPartForDetail(part)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(part.id, e as any)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {part.sku}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">{part.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Kompatibel: {part.compatibleAssets?.join(', ') || '-'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <CategoryBadge category={part.category} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-500/20'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {part.stock} {part.unit}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-600">
                        {part.minThreshold} {part.unit}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-800 font-semibold">
                        Rp {part.unitCost.toLocaleString('id-ID')}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{part.locationRack}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap truncate max-w-[130px]">
                        {part.supplier || '-'}
                      </td>

                      {/* Action Column */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenRestock(part, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Restok Suku Cadang"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedPartForDetail(part)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={(e) => handleOpenEdit(part, e)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Spare Part"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteSingle(part, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Spare Part"
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

      {/* Detail Modal */}
      {selectedPartForDetail && (
        <Modal
          isOpen={!!selectedPartForDetail}
          onClose={() => setSelectedPartForDetail(null)}
          title={`${selectedPartForDetail.sku}: ${selectedPartForDetail.name}`}
          subtitle={`Kategori: ${selectedPartForDetail.category} • Lokasi: ${selectedPartForDetail.locationRack}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Stok Tersedia</span>
                <p className="font-mono font-bold text-sm text-blue-700 mt-0.5">
                  {selectedPartForDetail.stock} {selectedPartForDetail.unit}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Batas Minimum</span>
                <p className="font-mono font-bold text-sm text-slate-800 mt-0.5">
                  {selectedPartForDetail.minThreshold} {selectedPartForDetail.unit}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Harga Satuan</span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-0.5">
                  Rp {selectedPartForDetail.unitCost.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Restok Terakhir</span>
                <p className="font-mono text-slate-700 mt-0.5">{selectedPartForDetail.lastRestocked || '-'}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lokasi Rak Gudang:</span>
                <span className="font-bold text-slate-900">{selectedPartForDetail.locationRack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Vendor / Supplier:</span>
                <span className="font-semibold text-slate-800">{selectedPartForDetail.supplier || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Kompatibilitas Mesin:</span>
                <span className="font-semibold text-slate-800">{selectedPartForDetail.compatibleAssets?.join(', ') || '-'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = selectedPartForDetail;
                  setSelectedPartForDetail(null);
                  handleOpenRestock(target);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Restok Spare Part Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPartForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Restock Modal */}
      {isRestockModalOpen && targetPartForRestock && (
        <Modal
          isOpen={isRestockModalOpen}
          onClose={() => {
            setIsRestockModalOpen(false);
            setTargetPartForRestock(null);
          }}
          title={`Restok Suku Cadang: ${targetPartForRestock.name}`}
          subtitle={`SKU: ${targetPartForRestock.sku} • Stok Sekarang: ${targetPartForRestock.stock} ${targetPartForRestock.unit}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Jumlah Tambahan yang Diterima Gudang ({targetPartForRestock.unit})
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>

            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900">
              <span className="font-bold text-[11px]">Estimasi Stok Akhir:</span>
              <p className="font-mono text-sm font-bold text-blue-700 mt-0.5">
                {targetPartForRestock.stock + Number(restockAmount)} {targetPartForRestock.unit}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
              >
                Konfirmasi Restok
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add & Edit Spare Part Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingPartId(null);
        }}
        title={isEditModalOpen ? 'Edit Suku Cadang MEP' : 'Tambah Suku Cadang MEP Baru'}
        subtitle="Kelola data katalog inventaris suku cadang fasilitas"
        maxWidth="2xl"
      >
        <form onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">SKU / Kode Part (Wajib)</label>
              <input
                type="text"
                required
                value={formPart.sku}
                onChange={(e) => setFormPart({ ...formPart, sku: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. PRT-MEC-BRG01"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Kategori MEP</label>
              <select
                value={formPart.category}
                onChange={(e) => setFormPart({ ...formPart, category: e.target.value as MepCategory })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              >
                <option value="HVAC">HVAC</option>
                <option value="Kelistrikan">Kelistrikan</option>
                <option value="Genset">Genset</option>
                <option value="Air bersih">Air Bersih</option>
                <option value="IPAL">IPAL</option>
                <option value="Hydrant">Hydrant</option>
                <option value="Fire Alarm">Fire Alarm</option>
                <option value="CCTV">CCTV</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Suku Cadang (Wajib)</label>
              <input
                type="text"
                required
                value={formPart.name}
                onChange={(e) => setFormPart({ ...formPart, name: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. Mechanical Seal Type 21 Carbon/Ceramic"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Stok Unit</label>
              <input
                type="number"
                min={0}
                required
                value={formPart.stock}
                onChange={(e) => setFormPart({ ...formPart, stock: Number(e.target.value) })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Batas Minimum (Threshold Alert)</label>
              <input
                type="number"
                min={1}
                required
                value={formPart.minThreshold}
                onChange={(e) => setFormPart({ ...formPart, minThreshold: Number(e.target.value) })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Satuan</label>
              <input
                type="text"
                value={formPart.unit}
                onChange={(e) => setFormPart({ ...formPart, unit: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="Pcs / Set / Liter / Meter"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Harga Satuan (IDR)</label>
              <input
                type="number"
                min={0}
                value={formPart.unitCost}
                onChange={(e) => setFormPart({ ...formPart, unitCost: Number(e.target.value) })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Lokasi Rak Gudang</label>
              <input
                type="text"
                value={formPart.locationRack}
                onChange={(e) => setFormPart({ ...formPart, locationRack: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="Rak M-02 (Baris B)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Supplier / Rekanan</label>
              <input
                type="text"
                value={formPart.supplier}
                onChange={(e) => setFormPart({ ...formPart, supplier: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="PT Mitra Teknik Utama"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Kompatibel untuk Mesin (Pisahkan koma)</label>
              <input
                type="text"
                value={formPart.compatibleAssetsText}
                onChange={(e) => setFormPart({ ...formPart, compatibleAssetsText: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. Pompa Booster, Chiller Daikin 500TR"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingPartId(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              {isEditModalOpen ? 'Simpan Perubahan' : 'Simpan Suku Cadang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
