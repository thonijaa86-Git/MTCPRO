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
  Phone,
  Building2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  Droplets,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ToastContainer } from '../components/common/Toast';

export const AuthView: React.FC = () => {
  const { login, register, vendors, users } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  // List of companies sourced from the Perusahaan (Vendors) Database
  const companyOptions = Array.from(
    new Set([
      'PT DAHANA (Persero)',
      ...vendors.map((v) => v.name?.trim()).filter(Boolean)
    ])
  ).filter(Boolean);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Clear fields on initial mount so login inputs start empty
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCompany('');
    setPosition('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    if (isRegistering) {
      if (!fullName.trim()) {
        setFormError('Silakan masukkan nama lengkap Anda.');
        return;
      }
      if (!phone.trim()) {
        setFormError('Silakan masukkan nomor telepon / WhatsApp.');
        return;
      }
      if (!email.trim()) {
        setFormError('Silakan masukkan alamat email kerja Anda.');
        return;
      }
      if (!company.trim()) {
        setFormError('Silakan masukkan nama perusahaan Anda.');
        return;
      }
      if (!position.trim()) {
        setFormError('Silakan masukkan jabatan / spesialisasi Anda.');
        return;
      }
      if (!password.trim()) {
        setFormError('Silakan buat kata sandi untuk akun baru Anda.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await register(
          fullName.trim(),
          email.trim(),
          phone.trim(),
          company.trim(),
          position.trim(),
          password.trim()
        );
        if (res) {
          setRegistrationSuccess(true);
        }
      } catch (err: any) {
        console.error('Registration error:', err);
        setFormError(err?.message || 'Terjadi kendala saat registrasi.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email.trim()) {
        setFormError('Silakan masukkan alamat email Anda.');
        return;
      }
      setIsSubmitting(true);
      try {
        login(email.trim(), password.trim());
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole, demoEmail: string) => {
    login(demoEmail, undefined, demoRole);
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
                onClick={() => {
                  setIsRegistering(false);
                  setFormError(null);
                  setEmail('');
                  setPassword('');
                }}
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
                onClick={() => {
                  setIsRegistering(true);
                  setFormError(null);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setPassword('');
                  setCompany('');
                  setPosition('');
                }}
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
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Nama Lengkap:</span>
                    <span className="font-semibold text-white">{fullName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>No. Telepon:</span>
                    <span className="font-mono text-white">{phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Alamat Email:</span>
                    <span className="font-mono text-white">{email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Perusahaan:</span>
                    <span className="font-semibold text-white">{company}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Jabatan:</span>
                    <span className="font-semibold text-white">{position}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>Penetapan Role:</span>
                    <span className="font-semibold text-amber-400">Ditentukan oleh Admin</span>
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Nama Lengkap */}
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
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

              {/* Field 2: No Telp / WhatsApp */}
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    No. Telp / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="+62 812-3456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Field 3: Alamat Email Kerja */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Alamat Email Kerja
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder={isRegistering ? "e.g. budi.santoso@perusahaan.co.id" : "nama@mtcpro.co.id / email Anda"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Field 4: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
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
                    autoComplete="new-password"
                    placeholder="Masukkan kata sandi akun..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Field 5: Nama Perusahaan (Dropdown Database Perusahaan) */}
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Nama Perusahaan
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${
                        !company ? 'text-slate-500' : 'text-white font-medium'
                      }`}
                    >
                      <option value="" disabled className="text-slate-500 bg-slate-950">
                        -- Pilih Nama Perusahaan / Vendor --
                      </option>
                      {companyOptions.map((compName) => (
                        <option key={compName} value={compName} className="bg-slate-900 text-white py-2">
                          {compName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Field 6: Jabatan */}
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Jabatan
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manajer Pemeliharaan 1 / Chief Engineer / Teknisi MEP"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {isRegistering && (
                <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-slate-300 text-xs flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Setelah mendaftar, akun Anda akan diverifikasi oleh Administrator. <strong>Role hak akses</strong> akan ditentukan langsung di Dashboard Admin.
                  </p>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-300">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{isRegistering ? 'Memproses pendaftaran...' : 'Memverifikasi...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isRegistering ? 'Daftar Sekarang' : 'Masuk ke Sistem'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            )}
          </div>

          {/* Right Information & Real Accounts Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sistem Otentikasi Terverifikasi
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Setiap pengguna yang terdaftar memiliki hak akses sesuai penetapan peran (Role) oleh Administrator PT DAHANA (Persero):
              </p>

              <div className="space-y-2.5">
                {/* Real active users if available */}
                {users.filter((u) => (u.status || 'Aktif') === 'Aktif').length > 0 ? (
                  users
                    .filter((u) => (u.status || 'Aktif') === 'Aktif')
                    .slice(0, 4)
                    .map((realUser) => {
                      const roleColor =
                        realUser.role === 'admin'
                          ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                          : realUser.role === 'supervisor'
                          ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                          : realUser.role === 'manager'
                          ? 'border-purple-500/30 text-purple-300 bg-purple-500/10'
                          : 'border-blue-500/30 text-blue-300 bg-blue-500/10';

                      return (
                        <button
                          key={realUser.id}
                          type="button"
                          onClick={() => {
                            setEmail(realUser.email);
                            if (realUser.password) setPassword(realUser.password);
                          }}
                          className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={realUser.avatar}
                              alt={realUser.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                                  {realUser.name}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${roleColor}`}>
                                  {realUser.role}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 truncate">{realUser.email}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      );
                    })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                    <p className="font-semibold text-slate-300">Silakan Mendaftar atau Masuk</p>
                    <p className="text-[11px]">
                      Gunakan formulir di sebelah kiri untuk membuat akun baru. Akun baru akan diverifikasi oleh Administrator sebelum dapat login.
                    </p>
                  </div>
                )}
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

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
