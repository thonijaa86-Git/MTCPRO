import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, SparePart } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Modal } from '../components/common/Modal';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Boxes,
  Plus,
  Trash2,
  FileCheck,
  AlertCircle,
  MapPin,
  Play,
  Pause,
  UploadCloud,
  CheckCheck
} from 'lucide-react';

export const TeknisiTaskView: React.FC = () => {
  const {
    currentUser,
    workOrders,
    spareParts,
    completeWorkOrderByTechnician,
    updateWorkOrderStatus
  } = useApp();

  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [usedParts, setUsedParts] = useState<{ partId: string; quantity: number }[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Filter WOs assigned to this technician
  const myTasks = workOrders.filter(
    (w) => w.assignedToId === currentUser?.id || !w.assignedToId
  );

  const activeTask = selectedWO || myTasks.find((w) => w.status === 'Proses') || myTasks[0] || null;

  const handleSelectTask = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setCompletedSteps(wo.stepsCompleted || []);
    setTechnicianNotes(wo.technicianNotes || '');
    setUsedParts([]);
  };

  const handleToggleStep = (step: string) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter((s) => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const handleAddPartUsage = (partId: string) => {
    const existing = usedParts.find((u) => u.partId === partId);
    if (existing) {
      setUsedParts(
        usedParts.map((u) => (u.partId === partId ? { ...u, quantity: u.quantity + 1 } : u))
      );
    } else {
      setUsedParts([...usedParts, { partId, quantity: 1 }]);
    }
  };

  const handleRemovePartUsage = (partId: string) => {
    setUsedParts(usedParts.filter((u) => u.partId !== partId));
  };

  const handleStartWork = (woId: string) => {
    updateWorkOrderStatus(woId, 'Proses', 'Pekerjaan dimulai oleh teknisi.');
  };

  const handleSubmitCompletion = () => {
    if (!activeTask) return;
    completeWorkOrderByTechnician(
      activeTask.id,
      technicianNotes || 'Pekerjaan selesai dilaksanakan sesuai prosedur SOP MEP.',
      completedSteps,
      usedParts
    );
    setIsSubmitModalOpen(false);
    setSelectedWO(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>Portal Tugas & Eksekusi Lapangan Teknisi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksekusi checklist perbaikan teknis, pencatatan suku cadang, dan pelaporan progres
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-bold">
          <span>Teknisi Aktif: {currentUser?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Work Orders List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Antrean Tugas ({myTasks.length})
          </h3>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada tugas Work Order yang ditugaskan saat ini.
              </div>
            ) : (
              myTasks.map((wo) => {
                const isSelected = activeTask?.id === wo.id;
                return (
                  <div
                    key={wo.id}
                    onClick={() => handleSelectTask(wo)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {wo.woNumber}
                      </span>
                      <PriorityBadge priority={wo.priority} showIcon={false} />
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                      {wo.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{wo.assetName}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <StatusBadge status={wo.status} />
                      <span className="font-mono text-[11px] text-slate-500">
                        Due: {wo.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Execution Workspace & Checklist (8 Cols) */}
        <div className="lg:col-span-8">
          {activeTask ? (
            <div className="industrial-panel p-6 bg-white space-y-6">
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                      {activeTask.woNumber}
                    </span>
                    <CategoryBadge category={activeTask.category} />
                    <PriorityBadge priority={activeTask.priority} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {activeTask.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Aset: {activeTask.assetName} [{activeTask.assetTag}] — {activeTask.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeTask.status === 'Open' && (
                    <button
                      onClick={() => handleStartWork(activeTask.id)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>Mulai Kerjakan</span>
                    </button>
                  )}
                  {activeTask.status === 'Proses' && (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Submit Selesai</span>
                    </button>
                  )}
                  {activeTask.status === 'Selesai' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Menunggu Approval SPV
                    </span>
                  )}
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-500">Instruksi & Masalah:</span>
                <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                  {activeTask.description}
                </p>
              </div>

              {/* Step-by-Step Interactive Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Checklist Tindakan Teknis Lapangan:</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-blue-600">
                    {completedSteps.length} / {(activeTask.totalSteps || []).length} Selesai
                  </span>
                </div>

                <div className="space-y-2">
                  {(activeTask.totalSteps || [
                    'Pemeriksaan visual dan pengukuran suhu/tegangan',
                    'Pembersihan dan penggantian part komponen aus',
                    'Uji fungsi proteksi dan running test'
                  ]).map((step, idx) => {
                    const isChecked = completedSteps.includes(step);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStep(step)}
                          className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-xs ${isChecked ? 'line-through text-slate-500 font-medium' : 'font-semibold'}`}>
                          {step}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Spare Parts Consumption Selector */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>Suku Cadang Digunakan untuk Perbaikan Ini:</span>
                </span>

                <div className="flex flex-wrap gap-2">
                  {spareParts.slice(0, 5).map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => handleAddPartUsage(part.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{part.name} ({part.stock} {part.unit})</span>
                    </button>
                  ))}
                </div>

                {usedParts.length > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Daftar Part Terpakai:</span>
                    {usedParts.map((u) => {
                      const p = spareParts.find((part) => part.id === u.partId);
                      return (
                        <div key={u.partId} className="flex items-center justify-between text-xs font-medium">
                          <span className="font-semibold text-slate-800">{p?.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-blue-600">{u.quantity} {p?.unit}</span>
                            <button
                              onClick={() => handleRemovePartUsage(u.partId)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Technician Notes */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-xs uppercase font-bold text-slate-700">
                  Catatan Teknisi / Hasil Pengukuran Lapangan:
                </span>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="e.g. Suhu trafo stabil di 68°C. Arus motor 12.4A. Getaran normal. Telah dibersihkan filter udara."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                {activeTask.status !== 'Selesai' && activeTask.status !== 'Disetujui' && (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Laporkan Penyelesaian Pekerjaan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="industrial-panel p-12 text-center bg-white text-slate-400 text-xs">
              Pilih salah satu tugas Work Order di panel kiri untuk memulai pengerjaan.
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && activeTask && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Konfirmasi Selesai: ${activeTask.woNumber}`}
          subtitle="Verifikasi checklist dan penggunaan spare part sebelum dikirim ke SPV"
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 space-y-1.5">
              <p className="font-semibold text-xs">
                Apakah Anda yakin ingin menyelesaikan Work Order ini?
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                <li>{completedSteps.length} checklist tindakan ditandai selesai.</li>
                <li>{usedParts.length} jenis suku cadang akan dipotong dari stok inventaris.</li>
                <li>Status akan berpindah ke <strong>Selesai</strong> dan dikirim ke Supervisor untuk approval.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitCompletion}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 cursor-pointer text-xs"
              >
                Ya, Submit Selesai
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
