import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Boxes,
  FileText,
  ShieldCheck,
  MapPin,
  Calendar,
  XCircle,
  ChevronRight
} from 'lucide-react';

export const SupervisorApprovalView: React.FC = () => {
  const {
    currentUser,
    workOrders,
    approveWorkOrderBySupervisor,
    updateWorkOrderStatus,
    showToast
  } = useApp();

  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const pendingApprovals = workOrders.filter((w) => w.status === 'Selesai');
  const activeWOs = workOrders.filter((w) => w.status === 'Proses' || w.status === 'Open');
  const completedHistory = workOrders.filter((w) => w.status === 'Disetujui');

  const handleOpenApprove = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setSupervisorNotes('Hasil pekerjaan telah dicek dan memenuhi standar SOP MEP. Disetujui.');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (selectedWO) {
      approveWorkOrderBySupervisor(selectedWO.id, supervisorNotes);
      setIsApproveModalOpen(false);
      setSelectedWO(null);
    }
  };

  const handleOpenReject = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setSupervisorNotes('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedWO) {
      updateWorkOrderStatus(
        selectedWO.id,
        'Proses',
        `[Revisi dari Supervisor ${currentUser?.name}]: ${supervisorNotes || 'Perlu perbaikan ulang checklist.'}`
      );
      showToast('warning', 'Pekerjaan Dikembalikan ke Teknisi', `${selectedWO.woNumber} dikembalikan untuk revisi.`);
      setIsRejectModalOpen(false);
      setSelectedWO(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-amber-600" />
            <span>Portal Supervisi, Verifikasi & Approval WO</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi mutu hasil perbaikan teknisi sebelum penutupan resmi tiket pemeliharaan
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono font-bold">
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>Supervisor: {currentUser?.name}</span>
        </div>
      </div>

      {/* Pending Approval Queue Banner */}
      <div className="industrial-panel p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Antrean Menunggu Approval ({pendingApprovals.length} Work Order)
              </h3>
              <p className="text-xs text-slate-500">Pekerjaan yang telah diselesaikan teknisi dan siap diverifikasi</p>
            </div>
          </div>
          {pendingApprovals.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-white animate-pulse">
              Butuh Tindakan
            </span>
          )}
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            Semua pekerjaan teknisi telah diverifikasi. Tidak ada antrean approval saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((wo) => (
              <div
                key={wo.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {wo.woNumber}
                    </span>
                    <CategoryBadge category={wo.category} />
                    <PriorityBadge priority={wo.priority} />
                    <span className="text-[11px] font-mono text-slate-500">
                      Selesai pada: {wo.completedAt || 'Baru saja'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{wo.title}</h4>
                  <p className="text-xs text-slate-600">
                    Aset: <span className="font-semibold text-slate-800">{wo.assetName}</span> [{wo.assetTag}]
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span>Teknisi PIC: <strong>{wo.assignedToName}</strong></span>
                    {wo.sparePartsUsed && wo.sparePartsUsed.length > 0 && (
                      <span className="flex items-center gap-1 text-blue-700 font-medium">
                        <Boxes className="w-3.5 h-3.5" />
                        <span>{wo.sparePartsUsed.length} suku cadang terpakai</span>
                      </span>
                    )}
                  </div>

                  {wo.technicianNotes && (
                    <p className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-lg border border-amber-200/60 mt-1 italic">
                      "Catatan Teknisi: {wo.technicianNotes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenReject(wo)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Minta Revisi</span>
                  </button>
                  <button
                    onClick={() => handleOpenApprove(wo)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Setujui & Tutup WO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overview Table of Approved / Closed WOs */}
      <div className="industrial-panel overflow-hidden bg-white">
        <div className="industrial-panel-header">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Histori Work Order yang Telah Disetujui (Closed)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {completedHistory.length} Arsip
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">No. WO</th>
                <th className="px-4 py-3">Judul Instruksi</th>
                <th className="px-4 py-3">Aset</th>
                <th className="px-4 py-3">Teknisi</th>
                <th className="px-4 py-3">Disetujui Oleh</th>
                <th className="px-4 py-3">Tanggal Approval</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {completedHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Belum ada Work Order yang berstatus disetujui.
                  </td>
                </tr>
              ) : (
                completedHistory.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{wo.woNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{wo.title}</td>
                    <td className="px-4 py-3 text-slate-600">{wo.assetName}</td>
                    <td className="px-4 py-3 text-slate-700">{wo.assignedToName}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">{wo.approvedByName || 'Supervisor'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{wo.approvedAt || wo.completedAt}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wo.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {isApproveModalOpen && selectedWO && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title={`Verifikasi & Setujui: ${selectedWO.woNumber}`}
          subtitle="Tindakan ini akan meresmikan penutupan (closure) tiket perbaikan MEP"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Verifikasi Supervisor
              </label>
              <textarea
                rows={3}
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                placeholder="Catatan inspeksi akhir atau rekomendasi perawatan lanjutan..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Setujui & Tutup Work Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedWO && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={`Minta Revisi Teknisi: ${selectedWO.woNumber}`}
          subtitle="Pekerjaan akan dikembalikan ke status 'Proses' untuk diperbaiki ulang"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alasan Pengembalian / Poin yang Perlu Diperbaiki (Wajib)
              </label>
              <textarea
                rows={3}
                required
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500"
                placeholder="e.g. Masih terdapat tetesan halus pada flange valve. Mohon lakukan torquing ulang dan ganti gasket."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Kembalikan ke Teknisi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
