import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Users2,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Wrench,
  Briefcase,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  Calendar,
  Trash2,
  Eye,
  ListFilter,
  LayoutGrid,
  Clock,
  Check,
  X,
  ShieldAlert,
  AlertTriangle,
  UserPlus,
  Camera,
  Upload,
  Building2,
  RotateCw,
  Image as ImageIcon,
  Lock,
  EyeOff
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const {
    currentUser,
    users,
    vendors,
    workOrders,
    updateUserRole,
    addUser,
    updateUser,
    approveUser,
    rejectUser,
    deleteUser,
    deleteBulkUsers,
    switchUserById
  } = useApp();

  const role = currentUser?.role || 'teknisi';
  const isAdmin = role === 'admin';
  const canManage = role === 'admin' || role === 'supervisor';

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Multi-Select
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserProfile | null>(null);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  // Edit / Approve Role State
  const [newRoleSelection, setNewRoleSelection] = useState<UserRole>('teknisi');
  const [newDepartment, setNewDepartment] = useState('Mechanical & Electrical Maintenance');
  const [newCompany, setNewCompany] = useState('PT DAHANA (Persero)');
  const [newPosition, setNewPosition] = useState('MEP Specialist');

  // Add/Edit User Form State
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  const [formUser, setFormUser] = useState({
    name: '',
    phone: '',
    email: '',
    company: 'PT DAHANA (Persero)',
    position: 'MEP Specialist',
    role: 'teknisi' as UserRole,
    avatar: '',
    password: ''
  });

  // Camera & Photo Upload State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.specialization && u.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    const isPending = (u.status || '').toLowerCase().trim() === 'pending' || (u.status || '').toLowerCase().trim() === 'menunggu approval';
    const isRejected = (u.status || '').toLowerCase().trim() === 'ditolak';
    const userStatus = isPending ? 'Pending' : (isRejected ? 'Ditolak' : 'Aktif');

    const matchesStatus =
      selectedStatusFilter === 'ALL' || userStatus === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper check
  const isUserPending = (u: UserProfile) => {
    const s = (u.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'menunggu approval' || s === 'menunggu persetujuan';
  };
  const isUserRejected = (u: UserProfile) => (u.status || '').toLowerCase().trim() === 'ditolak';
  const isUserActive = (u: UserProfile) => !isUserPending(u) && !isUserRejected(u);

  // Counters
  const pendingUsers = users.filter(isUserPending);
  const activeUsers = users.filter(isUserActive);
  const rejectedUsers = users.filter(isUserRejected);
  const technicianUsers = users.filter((u) => u.role === 'teknisi' && isUserActive(u));

  // Camera & Photo Handlers
  const startCamera = async (mode: 'user' | 'environment' = cameraFacingMode) => {
    setIsCameraActive(true);
    setCameraError(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API tidak didukung di browser ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Tidak dapat mengakses kamera web secara langsung. Anda dapat menggunakan tombol kamera/file di bawah.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const toggleFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = ((video.videoWidth || 480) - size) / 2;
        const startY = ((video.videoHeight || 480) - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormUser((prev) => ({ ...prev, avatar: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFormUser((prev) => ({
            ...prev,
            avatar: loadEvt.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedUserIds.length} personil terpilih?`)) {
      deleteBulkUsers(selectedUserIds);
      setSelectedUserIds([]);
    }
  };

  const handleDeleteSingle = (u: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus anggota tim ${u.name} (${u.email}) dari sistem?`)) {
      deleteUser(u.id);
      setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
    }
  };

  const handleOpenApproveModal = (u: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetUser(u);
    setNewRoleSelection(u.role || 'teknisi');
    setNewDepartment(u.department || 'Mechanical & Electrical Maintenance');
    setNewCompany(u.company || (vendors[0]?.name || 'PT DAHANA (Persero)'));
    setNewPosition(u.position || u.specialization || 'MEP Specialist');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (targetUser) {
      approveUser(targetUser.id, newRoleSelection, newDepartment, newCompany, newPosition);
      setIsApproveModalOpen(false);
      setTargetUser(null);
    }
  };

  const handleQuickReject = (u: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tolak pendaftaran akun ${u.name} (${u.email})?`)) {
      rejectUser(u.id);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowFormPassword(false);
    setFormUser({
      name: '',
      phone: '',
      email: '',
      company: vendors[0]?.name || 'PT DAHANA (Persero)',
      position: '',
      role: 'teknisi',
      avatar: '',
      password: ''
    });
    setIsAddUserModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUser(u);
    setShowFormPassword(false);
    setFormUser({
      name: u.name,
      phone: u.phone || '',
      email: u.email,
      company: u.company || u.department || (vendors[0]?.name || 'PT DAHANA (Persero)'),
      position: u.position || u.specialization || 'MEP Specialist',
      role: u.role,
      avatar: u.avatar || '',
      password: u.password || ''
    });
    setIsAddUserModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUser.name.trim() || !formUser.email.trim()) return;

    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formUser.name.trim(),
        phone: formUser.phone.trim(),
        email: formUser.email.trim(),
        company: formUser.company.trim(),
        position: formUser.position.trim(),
        role: formUser.role,
        avatar: formUser.avatar || defaultAvatar,
        specialization: formUser.position.trim(),
        department: formUser.company.trim(),
        password: formUser.password ? formUser.password.trim() : (editingUser.password || '')
      });
      updateUserRole(editingUser.id, formUser.role);
    } else {
      addUser({
        name: formUser.name.trim(),
        phone: formUser.phone.trim() || '+62 812-0000-0000',
        email: formUser.email.trim(),
        company: formUser.company.trim() || 'PT DAHANA (Persero)',
        position: formUser.position.trim() || 'MEP Specialist',
        role: formUser.role,
        avatar: formUser.avatar || defaultAvatar,
        specialization: formUser.position.trim() || 'MEP Specialist',
        department: formUser.company.trim() || 'Maintenance & Operations',
        joinedDate: new Date().toISOString().substring(0, 10),
        status: 'Aktif',
        password: formUser.password ? formUser.password.trim() : '123456'
      });
    }

    // Reset Form
    setFormUser({
      name: '',
      phone: '',
      email: '',
      company: vendors[0]?.name || 'PT DAHANA (Persero)',
      position: 'MEP Specialist',
      role: 'teknisi',
      avatar: '',
      password: ''
    });

    setIsAddUserModalOpen(false);
    setEditingUser(null);
  };

  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin': return <Shield className="w-3.5 h-3.5 text-rose-600" />;
      case 'supervisor': return <UserCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'teknisi': return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'manager': return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getRoleBadgeStyle = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'supervisor': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'teknisi': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manager': return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Aktif';
    if (s === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Menunggu Approval</span>
        </span>
      );
    }
    if (s === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
          <X className="w-3 h-3" />
          <span>Ditolak</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
        <Check className="w-3 h-3" />
        <span>Aktif</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Manajemen Tim & Penentuan Role Pengguna</span>
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
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota Tim</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Pending Approval Alert Banner for Admin */}
      {pendingUsers.length > 0 && isAdmin && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-50/40 border-2 border-amber-400/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-amber-500/10 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                  Ada {pendingUsers.length} Pengajuan Pendaftaran User Baru Menunggu Persetujuan
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                  Action Needed
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Pengguna baru telah mendaftar akun dan sedang menunggu Administrator untuk menyetujui (approval) serta menentukan peran & hak aksesnya.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedStatusFilter('Pending')}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all"
            >
              Filter Pengajuan ({pendingUsers.length})
            </button>
            {pendingUsers[0] && (
              <button
                onClick={(e) => handleOpenApproveModal(pendingUsers[0], e)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui Langsung</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Stats & Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedStatusFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'ALL'
              ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Personil</span>
            <Users2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{users.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua data terdaftar</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Pending'
              ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu Approval</span>
            <Clock className={`w-4 h-4 text-amber-600 ${pendingUsers.length > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-2">{pendingUsers.length}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
            {pendingUsers.length > 0 ? 'Perlu tindakan verifikasi admin' : 'Tidak ada pendaftaran tertunda'}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Aktif')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Aktif'
              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Personil Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">{activeUsers.length}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{technicianUsers.length} Teknisi Lapangan</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('Ditolak')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Ditolak'
              ? 'bg-rose-50/60 border-rose-500 shadow-sm ring-1 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Ditolak</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-2">{rejectedUsers.length}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Pendaftaran ditolak</p>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              {selectedUserIds.length}
            </span>
            <span className="font-semibold">Personil terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedUserIds([])}
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
              <span>Hapus {selectedUserIds.length} Personil Terpilih</span>
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
            placeholder="Cari nama personil, email, atau keahlian spesialisasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Status Akun</option>
            <option value="Pending">Menunggu Approval</option>
            <option value="Aktif">Aktif</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Peran (Role)</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="teknisi">Teknisi</option>
            <option value="manager">Manager</option>
          </select>

          {(searchQuery || selectedRoleFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('ALL');
                setSelectedStatusFilter('ALL');
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
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      title="Pilih Semua Anggota"
                    />
                  </th>
                  <th className="px-4 py-3">Nama & Profil Personil</th>
                  <th className="px-4 py-3">Kontak & Email</th>
                  <th className="px-4 py-3">Perusahaan & Jabatan</th>
                  <th className="px-4 py-3">Peran (Role)</th>
                  <th className="px-4 py-3">Status Akun</th>
                  <th className="px-4 py-3">Terdaftar</th>
                  <th className="px-4 py-3 text-right">Aksi & Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Tidak ada anggota tim yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    const isCurrent = currentUser?.id === u.id;
                    const isPending = isUserPending(u);
                    const activeTasks = workOrders.filter(
                      (w) => w.assignedToId === u.id && (w.status === 'Open' || w.status === 'Proses')
                    ).length;

                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserForDetail(u)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isPending ? 'bg-amber-50/30' : isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(u.id, e as any)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="truncate">{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold font-mono">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate">{u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-slate-700 text-[11px]">{u.email}</div>
                          <div className="text-[11px] font-mono text-slate-500">{u.phone || '-'}</div>
                        </td>

                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="font-semibold text-slate-800 truncate">{u.position || u.specialization || 'MEP Specialist'}</div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.company || u.department || 'PT DAHANA (Persero)'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {isAdmin ? (
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                              className="text-[11px] font-mono font-bold py-1 px-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="admin">ADMIN</option>
                              <option value="supervisor">SUPERVISOR</option>
                              <option value="teknisi">TEKNISI</option>
                              <option value="manager">MANAGER</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                                u.role
                              )}`}
                            >
                              {getRoleIcon(u.role)}
                              <span>{u.role}</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(u.status)}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {u.joinedDate || '-'}
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If Pending: Show Accept & Reject buttons */}
                            {isPending && isAdmin && (
                              <>
                                <button
                                  onClick={(e) => handleOpenApproveModal(u, e)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-sm shadow-emerald-600/30 cursor-pointer transition-all"
                                  title="Setujui Pendaftaran Akun"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={(e) => handleQuickReject(u, e)}
                                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                                  title="Tolak Pendaftaran Akun"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {/* View Detail */}
                            <button
                              onClick={() => setSelectedUserForDetail(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Profil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Data Personil */}
                            {isAdmin && (
                              <button
                                onClick={(e) => handleOpenEdit(u, e)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Data Personil"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Switch to this user */}
                            {!isPending && (
                              <button
                                onClick={() => switchUserById(u.id)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Beralih ke Akun Ini"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete User */}
                            {isAdmin && (
                              <button
                                onClick={(e) => handleDeleteSingle(u, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => {
            const isSelected = selectedUserIds.includes(u.id);
            const isCurrent = currentUser?.id === u.id;
            const isPending = isUserPending(u);
            const activeTasks = workOrders.filter(
              (w) => w.assignedToId === u.id && (w.status === 'Open' || w.status === 'Proses')
            ).length;

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUserForDetail(u)}
                className={`industrial-panel p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 relative cursor-pointer ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20'
                    : isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-50/20'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(u.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{u.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold font-mono">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase flex items-center gap-1 ${getRoleBadgeStyle(
                          u.role
                        )}`}
                      >
                        {getRoleIcon(u.role)}
                        <span>{u.role}</span>
                      </span>
                      {getStatusBadge(u.status)}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Jabatan & Perusahaan</span>
                      <p className="font-semibold text-slate-800 line-clamp-1">{u.position || u.specialization || 'MEP Specialist'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{u.company || u.department || 'PT DAHANA (Persero)'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{u.phone || '-'}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{u.joinedDate || '-'}</span>
                      </span>
                    </div>

                    {u.role === 'teknisi' && (
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Beban Tugas Aktif:</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {activeTasks} Work Order
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPending && isAdmin ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleOpenApproveModal(u, e)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/30 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Akun</span>
                      </button>
                      <button
                        onClick={(e) => handleQuickReject(u, e)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedUserForDetail(u)}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Profil</span>
                      </button>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <button
                            onClick={(e) => handleOpenEdit(u, e)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Personil"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isPending && (
                          <button
                            onClick={() => switchUserById(u.id)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Beralih Akun"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDeleteSingle(u, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden File Inputs for Foto Profil (Upload & Camera Fallback) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraFallbackInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      {/* Modal: Tambah / Edit Anggota Tim Lengkap (7 Field) */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Edit Data Anggota Tim: ${editingUser.name}` : 'Tambah Anggota Tim MEP Baru'}
        maxWidth="lg"
        zIndex={50}
      >
        <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
          {/* Field: Foto (Upload file / Ambil gambar dari camera) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Foto Profil (Upload File / Ambil Gambar dari Kamera)</span>
              </span>
              {formUser.avatar && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Foto Terpasang
                </span>
              )}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="relative group shrink-0">
                {formUser.avatar ? (
                  <img
                    src={formUser.avatar}
                    alt="Preview Foto"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-w-[130px] px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer text-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => startCamera('user')}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ambil dari Kamera</span>
                </button>

                {formUser.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormUser({ ...formUser, avatar: '' })}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg transition-all cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Field 1: Nama */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Lengkap (Wajib)</label>
            <input
              type="text"
              required
              value={formUser.name}
              onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 text-xs"
              placeholder="e.g. Ir. Anton Wijaya"
            />
          </div>

          {/* Field 2 & 3: No Telp/Whatsapp & Alamat e-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">No. Telp / WhatsApp</label>
              <input
                type="text"
                required
                value={formUser.phone}
                onChange={(e) => setFormUser({ ...formUser, phone: e.target.value })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Alamat E-mail</label>
              <input
                type="email"
                required
                value={formUser.email}
                onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="nama@dahana.id"
              />
            </div>
          </div>

          {/* Field 4 & 5: Nama Perusahaan & Jabatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nama Perusahaan</label>
              {vendors.length > 0 ? (
                <select
                  required
                  value={formUser.company}
                  onChange={(e) => setFormUser({ ...formUser, company: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 text-xs text-slate-800"
                >
                  <option value="">-- Pilih Perusahaan --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formUser.company}
                  onChange={(e) => setFormUser({ ...formUser, company: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                  placeholder="e.g. PT DAHANA (Persero)"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Jabatan</label>
              <input
                type="text"
                value={formUser.position}
                onChange={(e) => setFormUser({ ...formUser, position: e.target.value })}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="e.g. MEP Specialist / Chief Engineer"
              />
            </div>
          </div>

          {/* Field 6: Role */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role (Hak Akses Pengguna)</label>
            <select
              value={formUser.role}
              onChange={(e) => setFormUser({ ...formUser, role: e.target.value as UserRole })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500 text-xs"
            >
              <option value="teknisi">TEKNISI (Akses: Dashboard, WO, Schedule)</option>
              <option value="supervisor">SUPERVISOR (Akses: WO Approval, Tim, Aset, Schedule)</option>
              <option value="manager">MANAGER (Akses: Executive Dashboard, Report, Aset)</option>
              <option value="admin">ADMINISTRATOR (Full Akses Seluruh Fitur)</option>
            </select>
          </div>

          {/* Field 7: Password / Kata Sandi Login */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Kata Sandi Login (Password)</span>
              </label>
              <span className="text-[10px] text-blue-700 font-medium">
                {editingUser ? 'Kosongkan jika tidak ingin diubah' : 'Wajib diisi untuk akses login'}
              </span>
            </div>
            <div className="relative">
              <input
                type={showFormPassword ? 'text' : 'password'}
                value={formUser.password}
                onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                className="w-full py-2 pl-3 pr-10 bg-white border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-blue-500 text-xs text-slate-900"
                placeholder={editingUser ? 'Ketik kata sandi baru untuk memperbarui...' : 'Ketik kata sandi login personil (e.g. 123456)...'}
              />
              <button
                type="button"
                onClick={() => setShowFormPassword(!showFormPassword)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={showFormPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
              >
                {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Personil ini dapat langsung masuk ke aplikasi menggunakan alamat email dan kata sandi di atas.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddUserModalOpen(false);
                setEditingUser(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              {editingUser ? 'Simpan Perubahan' : 'Simpan Anggota Tim'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detail Profil Personil */}
      {selectedUserForDetail && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Profil: ${selectedUserForDetail.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <img
                src={selectedUserForDetail.avatar}
                alt={selectedUserForDetail.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedUserForDetail.name}</h4>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                      selectedUserForDetail.role
                    )}`}
                  >
                    {selectedUserForDetail.role}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  {selectedUserForDetail.position || selectedUserForDetail.specialization || 'MEP Specialist'}
                </p>
                <div className="pt-0.5">
                  {getStatusBadge(selectedUserForDetail.status)}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{selectedUserForDetail.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">No. Telp / WhatsApp:</span>
                <span className="font-mono text-slate-800">{selectedUserForDetail.phone || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Alamat E-mail:</span>
                <span className="font-mono font-bold text-slate-900">{selectedUserForDetail.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nama Perusahaan:</span>
                <span className="text-slate-800 font-semibold">{selectedUserForDetail.company || selectedUserForDetail.department || 'PT DAHANA (Persero)'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Jabatan:</span>
                <span className="text-slate-800 font-semibold">{selectedUserForDetail.position || selectedUserForDetail.specialization || 'MEP Specialist'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Role:</span>
                <span className="font-mono font-bold uppercase text-blue-700">{selectedUserForDetail.role}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Tanggal Bergabung:</span>
                <span className="font-mono text-slate-700">{selectedUserForDetail.joinedDate || '-'}</span>
              </div>
              {isAdmin && (
                <div className="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 mt-1">
                  <span className="text-amber-900 font-bold flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Kata Sandi (Admin Only):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-950 text-xs bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                      {showDetailPassword
                        ? selectedUserForDetail.password || '123456'
                        : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetailPassword(!showDetailPassword)}
                      className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100/80 rounded-lg transition-colors cursor-pointer"
                      title={showDetailPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                    >
                      {showDetailPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedUserForDetail.status === 'Pending' && isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold">Pendaftaran akun ini masih menunggu persetujuan Anda</span>
                </div>
                <button
                  onClick={() => {
                    handleOpenApproveModal(selectedUserForDetail);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow-sm cursor-pointer"
                >
                  Setujui Sekarang
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Setujui & Tentukan Role Pengguna */}
      {isApproveModalOpen && targetUser && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => {
            setIsApproveModalOpen(false);
            setTargetUser(null);
          }}
          title={`Persetujuan Akun: ${targetUser.name}`}
          maxWidth="md"
          zIndex={60}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Nama Pengguna:</span>
                <span className="font-bold text-slate-900">{targetUser.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>No. Telepon:</span>
                <span className="font-mono text-slate-800">{targetUser.phone || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Email Kerja:</span>
                <span className="font-mono text-slate-800">{targetUser.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Perusahaan:</span>
                <span className="font-semibold text-slate-900">{targetUser.company || targetUser.department || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Jabatan Diajukan:</span>
                <span className="font-semibold text-blue-700">{targetUser.position || targetUser.specialization || '-'}</span>
              </div>
              {isAdmin && targetUser.password && (
                <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Kata Sandi (Admin Only):
                  </span>
                  <span className="font-mono font-bold text-amber-950">{targetUser.password}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Tentukan Role & Hak Akses Pengguna:</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Setelah disetujui, akun pengguna akan langsung aktif dengan hak akses dan peran yang Anda tetapkan di bawah ini.
                </p>
              </div>
            </div>

            {/* Field 1: Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tentukan Role / Hak Akses
              </label>
              <select
                value={newRoleSelection}
                onChange={(e) => setNewRoleSelection(e.target.value as UserRole)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-500 text-xs"
              >
                <option value="teknisi">TEKNISI (Akses: Dashboard, Work Orders, Schedules)</option>
                <option value="supervisor">SUPERVISOR (Akses: WO Approval, Tim, Aset, Jadwal)</option>
                <option value="manager">MANAGER (Akses: Executive Dashboard, Report, Aset)</option>
                <option value="admin">ADMINISTRATOR (Full Akses Seluruh Fitur)</option>
              </select>
            </div>

            {/* Field 2: Company Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Perusahaan / Vendor
              </label>
              {vendors.length > 0 ? (
                <select
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:outline-hidden focus:border-blue-500 text-xs text-slate-800"
                >
                  <option value="PT DAHANA (Persero)">PT DAHANA (Persero) (Internal)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                  placeholder="e.g. PT DAHANA (Persero)"
                />
              )}
            </div>

            {/* Field 3: Position */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jabatan / Keahlian
              </label>
              <input
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                placeholder="e.g. MEP Specialist / HVAC Technician"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setTargetUser(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui & Aktifkan Akun</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Live Camera Capture (Rendered last with zIndex={70} to appear in front of any form) */}
      {isCameraActive && (
        <Modal
          isOpen={isCameraActive}
          onClose={stopCamera}
          title="Ambil Foto Profil dari Kamera"
          maxWidth="md"
          zIndex={70}
        >
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square max-w-[340px] mx-auto border-2 border-slate-700 shadow-inner flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center space-y-3 text-slate-300">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                  <p className="text-xs text-amber-300">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      cameraFallbackInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Buka Kamera Perangkat / Browser
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder Circle Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-white/40 rounded-full m-6" />
                </>
              )}
            </div>

            {/* Hidden canvas for snapshot generation */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  title="Ganti Kamera (Depan / Belakang)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!!cameraError}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
