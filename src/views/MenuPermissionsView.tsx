import React from 'react';
import { useApp } from '../context/AppContext';
import {
  SlidersHorizontal,
  ShieldCheck,
  Check,
  X,
  Info,
  Wrench,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

export const MenuPermissionsView: React.FC = () => {
  const { menuPermissions, updateMenuPermission, currentUser } = useApp();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hanya Administrator sistem yang memiliki wewenang untuk mengatur izin menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-600" />
            <span>Pengaturan Hak Akses Menu Dinamis (Matrix Permissions)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur menu mana saja yang tampil pada sidebar untuk role Teknisi, Supervisor, dan Manager
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>Admin Master Controller</span>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950">Cara Kerja Pengaturan Hak Akses Menu:</h4>
          <p className="mt-0.5 leading-relaxed text-blue-900">
            Centang atau hapus centang pada kotak peran di bawah ini. Perubahan akan <strong>langsung berlaku seketika</strong> pada navigasi sidebar untuk pengguna terkait. Anda dapat beralih peran menggunakan switcher di pojok kanan atas untuk melihat perbedaannya secara live.
          </p>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="industrial-panel overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-16 text-center font-mono">No.</th>
                <th className="px-5 py-4">Menu Aplikasi</th>
                <th className="px-5 py-4">Deskripsi Modul</th>
                <th className="px-5 py-4 text-center font-mono text-rose-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMIN</span>
                  </div>
                </th>
                <th className="px-5 py-4 text-center font-mono text-blue-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>TEKNISI</span>
                  </div>
                </th>
                <th className="px-5 py-4 text-center font-mono text-amber-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>SUPERVISOR</span>
                  </div>
                </th>
                <th className="px-5 py-4 text-center font-mono text-purple-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>MANAGER</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {menuPermissions.map((menu) => (
                <tr key={menu.menuKey} className="hover:bg-slate-50/80 transition-colors">
                  {/* Number */}
                  <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                    <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                      {menu.menuNumber}
                    </span>
                  </td>

                  {/* Label */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-sm">{menu.label}</div>
                    <span className="font-mono text-[10px] text-slate-400">/{menu.menuKey}</span>
                  </td>

                  {/* Description */}
                  <td className="px-5 py-4 text-slate-600 max-w-sm">
                    {menu.description}
                  </td>

                  {/* Admin (Always Checked) */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  </td>

                  {/* Teknisi Toggle */}
                  <td className="px-5 py-4 text-center">
                    <label className="inline-flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menu.rolesAllowed.teknisi}
                        onChange={(e) => updateMenuPermission(menu.menuKey, 'teknisi', e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                          menu.rolesAllowed.teknisi
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {menu.rolesAllowed.teknisi ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                    </label>
                  </td>

                  {/* Supervisor Toggle */}
                  <td className="px-5 py-4 text-center">
                    <label className="inline-flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menu.rolesAllowed.supervisor}
                        onChange={(e) => updateMenuPermission(menu.menuKey, 'supervisor', e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                          menu.rolesAllowed.supervisor
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/20'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {menu.rolesAllowed.supervisor ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                    </label>
                  </td>

                  {/* Manager Toggle */}
                  <td className="px-5 py-4 text-center">
                    <label className="inline-flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menu.rolesAllowed.manager}
                        onChange={(e) => updateMenuPermission(menu.menuKey, 'manager', e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                          menu.rolesAllowed.manager
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-500/20'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {menu.rolesAllowed.manager ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
