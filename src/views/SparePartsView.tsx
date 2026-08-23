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
  Layers
} from 'lucide-react';

export const SparePartsView: React.FC = () => {
  const {
    currentUser,
    spareParts,
    restockSparePart,
    addSparePart
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetPartForRestock, setTargetPartForRestock] = useState<SparePart | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Add Part Form
  const [formPart, setFormPart] = useState({
    sku: '',
    name: '',
    category: 'Mechanical' as MepCategory,
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
      part.locationRack.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || part.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = spareParts.filter((p) => p.stock <= p.minThreshold).length;

  const handleOpenRestock = (part: SparePart) => {
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
      category: 'Mechanical',
      stock: 10,
      minThreshold: 5,
      unit: 'Pcs',
      unitCost: 250000,
      locationRack: 'Rak M-03',
      supplier: 'PT Supplier MEP Nasional',
      compatibleAssetsText: 'Centrifugal Chiller, AHU'
    });
    setIsAddModalOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Inventaris & Stok Spare Part MEP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen persediaan suku cadang, threshold minimum, dan reorder point
          </p>
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

      {/* Filter Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari SKU (PRT-...), nama part, atau lokasi rak gudang..."
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
            <option value="Mechanical">Mechanical (Filter, Belt, Seal)</option>
            <option value="Electrical">Electrical (MCB, Trafo Oil, Relay)</option>
            <option value="Plumbing">Plumbing (Bearing, Valve, Gasket)</option>
          </select>
        </div>
      </div>

      {/* Spare Parts Table */}
      <div className="industrial-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">SKU Part</th>
                <th className="px-4 py-3">Nama Suku Cadang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Stok Saat Ini</th>
                <th className="px-4 py-3">Batas Minimum</th>
                <th className="px-4 py-3">Harga Satuan</th>
                <th className="px-4 py-3">Lokasi Rak</th>
                <th className="px-4 py-3">Kesesuaian Mesin</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Tidak ada suku cadang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isCritical = part.stock <= part.minThreshold;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {part.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{part.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Supplier: {part.supplier || '-'}
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
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                        {part.compatibleAssets.join(', ')}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenRestock(part)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer transition-all"
                          title="Restok suku cadang ini"
                        >
                          <PackagePlus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Restok</span>
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
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Tambahan yang Diterima Gudang ({targetPartForRestock.unit})
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-base focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
              <span className="font-bold">Estimasi Stok Akhir:</span>
              <p className="font-mono text-sm font-bold text-blue-700 mt-0.5">
                {targetPartForRestock.stock + Number(restockAmount)} {targetPartForRestock.unit}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Konfirmasi Restok
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Spare Part Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Suku Cadang MEP Baru"
        subtitle="Registrasi SKU baru pada katalog inventaris maintenance"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU / Kode Part (Wajib)</label>
              <input
                type="text"
                required
                value={formPart.sku}
                onChange={(e) => setFormPart({ ...formPart, sku: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. PRT-MEC-BRG01"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori MEP</label>
              <select
                value={formPart.category}
                onChange={(e) => setFormPart({ ...formPart, category: e.target.value as MepCategory })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Suku Cadang (Wajib)</label>
              <input
                type="text"
                required
                value={formPart.name}
                onChange={(e) => setFormPart({ ...formPart, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Mechanical Seal Type 21 Carbon/Ceramic"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Awal</label>
              <input
                type="number"
                min={0}
                required
                value={formPart.stock}
                onChange={(e) => setFormPart({ ...formPart, stock: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Minimum (Threshold Alert)</label>
              <input
                type="number"
                min={1}
                required
                value={formPart.minThreshold}
                onChange={(e) => setFormPart({ ...formPart, minThreshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
              <input
                type="text"
                value={formPart.unit}
                onChange={(e) => setFormPart({ ...formPart, unit: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="Pcs / Set / Liter / Meter"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harga Satuan (IDR)</label>
              <input
                type="number"
                min={0}
                value={formPart.unitCost}
                onChange={(e) => setFormPart({ ...formPart, unitCost: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak Gudang</label>
              <input
                type="text"
                value={formPart.locationRack}
                onChange={(e) => setFormPart({ ...formPart, locationRack: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="Rak M-02 (Baris B)"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supplier / Rekanan</label>
              <input
                type="text"
                value={formPart.supplier}
                onChange={(e) => setFormPart({ ...formPart, supplier: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="PT Mitra Teknik Utama"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Kompatibel untuk Mesin (Pisahkan koma)</label>
              <input
                type="text"
                value={formPart.compatibleAssetsText}
                onChange={(e) => setFormPart({ ...formPart, compatibleAssetsText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Pompa Booster, Chiller Daikin 500TR"
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
              Simpan Suku Cadang
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
