import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vendor } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Layers,
  Wrench,
  Eye,
  ListFilter,
  LayoutGrid,
  X
} from 'lucide-react';

export const VendorsView: React.FC = () => {
  const { currentUser, vendors, addVendor, updateVendor, deleteVendor, deleteBulkVendors } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Multi-Select
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<Vendor | null>(null);

  // Form State
  const [formVendor, setFormVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    specializationText: 'HVAC, Chiller, Air Ducting',
    contractStatus: 'Aktif' as 'Aktif' | 'Review' | 'Expired',
    rating: 4.8,
    address: 'Jakarta, Indonesia',
    contractExpiry: '2027-12-31'
  });

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'ALL' || v.contractStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedVendorIds.length === filteredVendors.length && filteredVendors.length > 0) {
      setSelectedVendorIds([]);
    } else {
      setSelectedVendorIds(filteredVendors.map((v) => v.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedVendorIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedVendorIds.length} perusahaan terpilih?`)) {
      deleteBulkVendors(selectedVendorIds);
      setSelectedVendorIds([]);
    }
  };

  const handleDeleteSingle = (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus perusahaan ${v.name}?`)) {
      deleteVendor(v.id);
      setSelectedVendorIds((prev) => prev.filter((id) => id !== v.id));
    }
  };

  const handleOpenAdd = () => {
    setFormVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      specializationText: '',
      contractStatus: 'Aktif',
      rating: 4.8,
      address: '',
      contractExpiry: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10)
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVendor(v);
    setFormVendor({
      name: v.name,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      specializationText: v.specialization.join(', '),
      contractStatus: v.contractStatus,
      rating: v.rating,
      address: v.address,
      contractExpiry: v.contractExpiry
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendor.name.trim()) return;

    addVendor({
      name: formVendor.name,
      contactPerson: formVendor.contactPerson,
      email: formVendor.email,
      phone: formVendor.phone,
      specialization: formVendor.specializationText.split(',').map((s) => s.trim()).filter(Boolean),
      contractStatus: formVendor.contractStatus,
      rating: Number(formVendor.rating),
      address: formVendor.address,
      activeJobsCount: 1,
      contractExpiry: formVendor.contractExpiry
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    updateVendor(editingVendor.id, {
      name: formVendor.name,
      contactPerson: formVendor.contactPerson,
      email: formVendor.email,
      phone: formVendor.phone,
      specialization: formVendor.specializationText.split(',').map((s) => s.trim()).filter(Boolean),
      contractStatus: formVendor.contractStatus,
      rating: Number(formVendor.rating),
      address: formVendor.address,
      contractExpiry: formVendor.contractExpiry
    });

    setIsEditModalOpen(false);
    setEditingVendor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Pengelolaan Perusahaan</span>
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
              <span>Tambah Perusahaan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedVendorIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedVendorIds.length}
            </span>
            <span className="font-semibold">Perusahaan terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedVendorIds([])}
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
              <span>Hapus {selectedVendorIds.length} Perusahaan Terpilih</span>
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
            placeholder="Cari nama perusahaan, kontak PIC, atau spesialisasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Status Kontrak</option>
            <option value="Aktif">Aktif</option>
            <option value="Review">Dalam Review</option>
            <option value="Expired">Expired</option>
          </select>
          {(searchQuery || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
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

      {/* Content: Table View or Cards View */}
      {viewMode === 'table' ? (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedVendorIds.length > 0 && selectedVendorIds.length === filteredVendors.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      title="Pilih Semua Perusahaan"
                    />
                  </th>
                  <th className="px-4 py-3">Nama Perusahaan</th>
                  <th className="px-4 py-3">Contact Person (PIC)</th>
                  <th className="px-4 py-3">Telepon & Email</th>
                  <th className="px-4 py-3">Spesialisasi</th>
                  <th className="px-4 py-3 text-center">Rating</th>
                  <th className="px-4 py-3">Status Kontrak</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Tidak ada perusahaan yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => {
                    const isSelected = selectedVendorIds.includes(v.id);
                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVendorForDetail(v)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(v.id, e as any)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="font-bold text-slate-900 truncate">{v.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{v.address}</div>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                          {v.contactPerson}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-slate-700">{v.phone}</div>
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">{v.email}</div>
                        </td>

                        <td className="px-4 py-3.5 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {v.specialization.slice(0, 2).map((s, sIdx) => (
                              <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                {s}
                              </span>
                            ))}
                            {v.specialization.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{v.specialization.length - 2}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-bold font-mono text-amber-600 text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {v.rating}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              v.contractStatus === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : v.contractStatus === 'Review'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {v.contractStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                          {v.contractExpiry}
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedVendorForDetail(v)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(v, e)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Data Perusahaan"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSingle(v, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Data Perusahaan"
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
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVendors.map((v) => {
            const isSelected = selectedVendorIds.includes(v.id);
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVendorForDetail(v)}
                className={`industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(v.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{v.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">PIC: {v.contactPerson}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          v.contractStatus === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.contractStatus === 'Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {v.contractStatus}
                      </span>
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {v.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Contact info & address */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.phone}</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{v.rating} / 5.0</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">{v.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.address}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Berlaku s.d: {v.contractExpiry}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedVendorForDetail(v)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={(e) => handleOpenEdit(v, e)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Perusahaan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSingle(v, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Data Perusahaan"
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
      {selectedVendorForDetail && (
        <Modal
          isOpen={!!selectedVendorForDetail}
          onClose={() => setSelectedVendorForDetail(null)}
          title={selectedVendorForDetail.name}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Kontrak</span>
                <p className="font-bold text-emerald-700 text-xs mt-0.5">{selectedVendorForDetail.contractStatus}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Rating / Reputasi</span>
                <p className="font-bold text-amber-600 text-xs mt-0.5 flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedVendorForDetail.rating} / 5.0</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Masa Berlaku</span>
                <p className="font-mono text-slate-800 text-xs mt-0.5">{selectedVendorForDetail.contractExpiry}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Kontak Telepon:</span>
                <span className="font-mono font-bold text-slate-900">{selectedVendorForDetail.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-slate-800">{selectedVendorForDetail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Alamat Kantor:</span>
                <span className="text-slate-800 text-right max-w-[200px]">{selectedVendorForDetail.address}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Bidang Spesialisasi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVendorForDetail.specialization.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedVendorForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Perusahaan Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingVendor(null);
        }}
        title={isAddModalOpen ? 'Tambah Perusahaan Baru' : `Edit Data Perusahaan: ${editingVendor?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Perusahaan (Wajib)</label>
            <input
              type="text"
              required
              value={formVendor.name}
              onChange={(e) => setFormVendor({ ...formVendor, name: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="e.g. PT DAHANA (Persero) / Rekanan Service"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Contact Person (PIC)</label>
              <input
                type="text"
                required
                value={formVendor.contactPerson}
                onChange={(e) => setFormVendor({ ...formVendor, contactPerson: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="e.g. Ir. Anton Wijaya"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">No. Telepon / Kantor</label>
              <input
                type="text"
                required
                value={formVendor.phone}
                onChange={(e) => setFormVendor({ ...formVendor, phone: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
                placeholder="+62 21 ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Email Resmi</label>
            <input
              type="email"
              required
              value={formVendor.email}
              onChange={(e) => setFormVendor({ ...formVendor, email: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="kontak@perusahaan.co.id"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
              Spesialisasi Keahlian / Lingkup Kerja (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              required
              value={formVendor.specializationText}
              onChange={(e) => setFormVendor({ ...formVendor, specializationText: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="Chiller Water Cooled, Trafo 20kV, Fire Hydrant, Internal MEP"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Status Kontrak</label>
              <select
                value={formVendor.contractStatus}
                onChange={(e) => setFormVendor({ ...formVendor, contractStatus: e.target.value as any })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium text-xs"
              >
                <option value="Aktif">Aktif</option>
                <option value="Review">Dalam Review</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Masa Berlaku Kontrak</label>
              <input
                type="date"
                required
                value={formVendor.contractExpiry}
                onChange={(e) => setFormVendor({ ...formVendor, contractExpiry: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Alamat Kantor / Workshop</label>
            <textarea
              rows={2}
              value={formVendor.address}
              onChange={(e) => setFormVendor({ ...formVendor, address: e.target.value })}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs"
              placeholder="Alamat lengkap bengkel kerja / kantor"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingVendor(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              Simpan Data Perusahaan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
