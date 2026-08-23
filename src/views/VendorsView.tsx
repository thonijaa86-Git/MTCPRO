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
  Wrench
} from 'lucide-react';

export const VendorsView: React.FC = () => {
  const { currentUser, vendors, addVendor, updateVendor, deleteVendor } = useApp();

  const role = currentUser?.role || 'teknisi';
  const canManage = role === 'admin' || role === 'supervisor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

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

  const handleOpenAdd = () => {
    setFormVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '+62 21 ',
      specializationText: 'HVAC, Fire Suppression, Piping',
      contractStatus: 'Aktif',
      rating: 4.8,
      address: 'Jakarta, Indonesia',
      contractExpiry: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10)
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
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
            <span>Pengelolaan Vendor Rekanan MEP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kemitraan spesialis pihak ketiga, kontrak SLA, dan kontak darurat teknis
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Vendor Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="industrial-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama vendor rekanan, kontak PIC, atau spesialisasi..."
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
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
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
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Berlaku s.d: {v.contractExpiry}
              </span>

              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Vendor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus vendor ${v.name}?`)) {
                        deleteVendor(v.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingVendor(null);
        }}
        title={isAddModalOpen ? 'Tambah Vendor Mitra Baru' : `Edit Data Vendor: ${editingVendor?.name}`}
        subtitle="Informasi kontak, spesialisasi MEP dan masa berlaku kontrak"
        maxWidth="lg"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan Vendor (Wajib)</label>
            <input
              type="text"
              required
              value={formVendor.name}
              onChange={(e) => setFormVendor({ ...formVendor, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500"
              placeholder="e.g. PT Schneider Electric Partner Service"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Contact Person (PIC)</label>
              <input
                type="text"
                required
                value={formVendor.contactPerson}
                onChange={(e) => setFormVendor({ ...formVendor, contactPerson: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Ir. Anton Wijaya"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Telepon / Kantor</label>
              <input
                type="text"
                required
                value={formVendor.phone}
                onChange={(e) => setFormVendor({ ...formVendor, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
                placeholder="+62 21 ..."
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Resmi Vendor</label>
            <input
              type="email"
              required
              value={formVendor.email}
              onChange={(e) => setFormVendor({ ...formVendor, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              placeholder="service@vendor.co.id"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Spesialisasi Keahlian (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              required
              value={formVendor.specializationText}
              onChange={(e) => setFormVendor({ ...formVendor, specializationText: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              placeholder="Chiller Water Cooled, Trafo 20kV, Fire Hydrant"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kontrak</label>
              <select
                value={formVendor.contractStatus}
                onChange={(e) => setFormVendor({ ...formVendor, contractStatus: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="Aktif">Aktif</option>
                <option value="Review">Dalam Review</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Masa Berlaku Kontrak (Expiry)</label>
              <input
                type="date"
                required
                value={formVendor.contractExpiry}
                onChange={(e) => setFormVendor({ ...formVendor, contractExpiry: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor / Workshop</label>
            <textarea
              rows={2}
              value={formVendor.address}
              onChange={(e) => setFormVendor({ ...formVendor, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              placeholder="Alamat lengkap bengkel kerja / kantor"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingVendor(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Simpan Data Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
