import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  Wrench,
  UserCheck,
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  Droplets
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('HVAC & Chiller Mechanical');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teknisi');

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!fullName.trim() || !email.trim()) return;
      const res = await register(fullName, email, selectedRole, specialization);
      if (res) {
        setRegistrationSuccess(true);
      }
    } else {
      if (!email.trim()) return;
      login(email);
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    login(demoEmail, demoRole);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Industrial Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-4 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-300 font-semibold tracking-wider uppercase">
              MEP Automated Facility Infrastructure
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              MTCPRO
            </span>
            <span className="text-slate-500 font-light font-mono text-2xl sm:text-3xl">/</span>
            <span className="text-slate-100 text-2xl sm:text-3xl font-semibold">
              Maintenance Management
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Sistem Otomasi Pemeliharaan Terpadu untuk Fasilitas Mechanical, Electrical, dan Plumbing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Auth Form Box */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Form Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  !isRegistering
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isRegistering
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {registrationSuccess ? (
              <div className="text-center py-8 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto animate-bounce">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Pendaftaran Akun Terkirim!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Permintaan registrasi akun Anda telah berhasil didaftarkan ke sistem dan saat ini <strong>menunggu persetujuan (approval) oleh Administrator</strong>.
                </p>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs space-y-1.5 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Nama:</span>
                    <span className="font-semibold text-white">{fullName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Email:</span>
                    <span className="font-mono text-white">{email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Role Diajukan:</span>
                    <span className="font-mono uppercase font-bold text-amber-400">{selectedRole}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Menunggu Approval Admin
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setIsRegistering(false);
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ir. Budi Santoso"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Alamat Email Kerja
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="nama@mtcpro.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  {!isRegistering && (
                    <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                      Lupa password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Role Pengguna Awal (Default: Teknisi)
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="teknisi">Teknisi MEP (Default)</option>
                      <option value="supervisor">Supervisor Maintenance</option>
                      <option value="manager">Manager Fasilitas</option>
                      <option value="admin">Administrator Sistem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Keahlian / Spesialisasi
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HVAC, Trafo & Genset, Plumbing & STP"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isRegistering ? 'Daftar Sekarang' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            )}
          </div>

          {/* Quick Demo Access Box (1-Click Login for all 4 Roles) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Akses Cepat Demo (1-Click)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Pilih salah satu dari 4 akun peran untuk langsung menguji fungsionalitas dan perbedaan menu:
              </p>

              <div className="space-y-2.5">
                {/* 1. Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin', 'admin@mtcpro.co.id')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-rose-500/30 hover:border-rose-500/60 flex items-center justify-between transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-rose-300">
                          Bambang Sudirgo, S.T.
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Akses semua menu & kontrol izin</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Supervisor */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('supervisor', 'supervisor@mtcpro.co.id')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 flex items-center justify-between transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300">
                          Rian Pratama
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          SUPERVISOR
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Monitoring tim & approval hasil kerja</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Teknisi */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('teknisi', 'teknisi@mtcpro.co.id')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-blue-500/30 hover:border-blue-500/60 flex items-center justify-between transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300">
                          Agus Santoso
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                          TEKNISI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Eksekusi tugas & update status WO</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 4. Manager */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('manager', 'manager@mtcpro.co.id')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-purple-500/30 hover:border-purple-500/60 flex items-center justify-between transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300">
                          Ir. Hendro Wijaya
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                          MANAGER
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Ringkasan KPI & analitik laporan</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* MEP Categories Summary */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-around text-center">
              <div className="flex flex-col items-center">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mb-1">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Mechanical</span>
                <span className="text-[10px] text-slate-500">HVAC & Fire Pump</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="flex flex-col items-center">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mb-1">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Electrical</span>
                <span className="text-[10px] text-slate-500">Genset & Panels</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="flex flex-col items-center">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-1">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Plumbing</span>
                <span className="text-[10px] text-slate-500">Booster & STP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
