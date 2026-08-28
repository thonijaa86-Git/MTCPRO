import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Cpu,
  Zap,
  Droplets,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { ToastContainer } from '../components/common/Toast';

export const AuthView: React.FC = () => {
  const { login, register, vendors } = useApp();
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
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Clear fields on initial mount
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCompany('');
    setPosition('');
    setFormError(null);
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
      if (!password.trim()) {
        setFormError('Silakan buat kata sandi (password) untuk akun baru Anda.');
        return;
      }
      if (password.trim().length < 4) {
        setFormError('Kata sandi minimal terdiri dari 4 karakter.');
        return;
      }
      if (!company.trim()) {
        setFormError('Silakan pilih nama perusahaan / institusi Anda.');
        return;
      }
      if (!position.trim()) {
        setFormError('Silakan masukkan jabatan / spesialisasi Anda.');
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
        setFormError('Alamat email wajib diisi.');
        return;
      }
      if (!password.trim()) {
        setFormError('Kata sandi (password) wajib diisi.');
        return;
      }

      setIsSubmitting(true);
      try {
        const success = login(email.trim(), password.trim());
        if (!success) {
          setFormError('Email atau kata sandi tidak cocok, atau akun belum disetujui Admin.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden selection:bg-blue-600 selection:text-white py-12">
      {/* Background Industrial Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
            Sistem Otentikasi Terpadu Fasilitas Mechanical, Electrical, dan Plumbing PT DAHANA.
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
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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
                <h3 className="text-lg font-bold text-white tracking-tight">Pendaftaran Akun Berhasil Terkirim!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Permintaan registrasi akun Anda telah tercatat dan saat ini <strong>menunggu verifikasi dan persetujuan (approval) oleh Administrator</strong>.
                </p>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs space-y-2.5 max-w-md mx-auto">
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
                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Status Akun:</span>
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
                    setEmail('');
                    setPassword('');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Nama Lengkap */}
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nama Lengkap <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ir. Budi Santoso"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      No. Telp / WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="0812-3456-7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Field 3: Alamat Email Kerja */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Alamat Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Masukkan alamat email akun Anda..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Field 4: Password with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Kata Sandi (Password) <span className="text-rose-400">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isRegistering ? 'new-password' : 'current-password'}
                      placeholder={isRegistering ? 'Buat kata sandi akun baru...' : 'Masukkan kata sandi akun...'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 5: Nama Perusahaan */}
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nama Perusahaan <span className="text-rose-400">*</span>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Jabatan / Spesialisasi <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Chief Engineer / Teknisi MEP / Supervisor"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {isRegistering && (
                  <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-slate-300 text-xs flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Akun baru akan diverifikasi oleh Administrator sebelum dapat digunakan. <strong>Penetapan hak akses menu</strong> disesuaikan dengan peran kerja Anda.
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300">{formError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{isRegistering ? 'Memproses Pendaftaran...' : 'Memverifikasi Kredensial...'}</span>
                    </span>
                  ) : (
                    <>
                      <span>{isRegistering ? 'Kirim Pendaftaran Akun' : 'Masuk ke Sistem'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Official MTCPRO Brand Showcase (Transparent & Seamless) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {/* Dynamic ambient radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1d4ed8_0,transparent_65%)] opacity-20 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Official Transparent MTCPRO Logo */}
              <div className="relative z-10 w-full max-w-[320px] mb-6 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="MTCPRO Maintenance Management System"
                  className="w-full h-auto object-contain max-h-[300px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-300 filter"
                />
              </div>

              {/* Company Branding & Subtitle */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[11px] font-mono font-semibold text-blue-400 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PT DAHANA (Persero)</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Facility Maintenance System
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Sistem Otomasi Pemeliharaan Terpadu Mechanical, Electrical, dan Plumbing.
                </p>
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
