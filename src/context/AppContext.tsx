import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Asset,
  WorkOrder,
  MaintenanceSchedule,
  SparePart,
  Vendor,
  MenuPermission,
  ActivityLog,
  SystemNotification,
  WOStatus,
  WOPriority,
  AssetStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MENU_PERMISSIONS,
  INITIAL_ASSETS,
  INITIAL_WORK_ORDERS,
  INITIAL_SCHEDULES,
  INITIAL_SPARE_PARTS,
  INITIAL_VENDORS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS
} from '../services/mockData';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  menuPermissions: MenuPermission[];
  assets: Asset[];
  workOrders: WorkOrder[];
  schedules: MaintenanceSchedule[];
  spareParts: SparePartsState;
  vendors: Vendor[];
  logs: ActivityLog[];
  notifications: SystemNotification[];
  toasts: ToastMessage[];
  currentView: string;
  selectedAssetForDetail: Asset | null;
  selectedWOForDetail: WorkOrder | null;
  
  // Navigation & View Actions
  setCurrentView: (view: string) => void;
  setSelectedAssetForDetail: (asset: Asset | null) => void;
  setSelectedWOForDetail: (wo: WorkOrder | null) => void;
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  
  // Auth & Roles
  login: (email: string, role?: UserRole) => boolean;
  register: (name: string, email: string, role?: UserRole, specialization?: string) => boolean | Promise<boolean>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  isMenuAccessibleForRole: (menuKey: string, role: UserRole) => boolean;
  updateMenuPermission: (menuKey: string, targetRole: 'teknisi' | 'supervisor' | 'manager', allowed: boolean) => void;
  
  // Asset Actions
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Work Order Actions
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string; woNumber?: string; createdAt?: string }) => void;
  updateWorkOrderStatus: (id: string, status: WOStatus, notes?: string) => void;
  updateWorkOrderPriority: (id: string, priority: WOPriority) => void;
  assignWorkOrder: (id: string, technicianId: string) => void;
  completeWorkOrderByTechnician: (
    id: string,
    notes: string,
    completedSteps: string[],
    usedParts: { partId: string; quantity: number }[]
  ) => void;
  approveWorkOrderBySupervisor: (id: string, supervisorNotes?: string) => void;
  
  // Schedule Actions
  addSchedule: (schedule: Omit<MaintenanceSchedule, 'id' | 'scheduleCode'>) => void;
  toggleScheduleStatus: (id: string) => void;
  generateWOFromSchedule: (scheduleId: string) => void;
  
  // Spare Parts Actions
  restockSparePart: (id: string, quantityToAdd: number) => void;
  addSparePart: (part: Omit<SparePart, 'id'>) => void;
  updateSparePart: (id: string, updates: Partial<SparePart>) => void;
  
  // Team Actions
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  
  // Vendor Actions
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  
  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Reset Data to Factory Defaults
  resetAllData: () => void;
}

type SparePartsState = SparePart[];

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'mtcpro_users_v1',
  CURRENT_USER: 'mtcpro_current_user_v1',
  PERMISSIONS: 'mtcpro_permissions_v1',
  ASSETS: 'mtcpro_assets_v1',
  WORK_ORDERS: 'mtcpro_work_orders_v1',
  SCHEDULES: 'mtcpro_schedules_v1',
  SPARE_PARTS: 'mtcpro_spare_parts_v1',
  VENDORS: 'mtcpro_vendors_v1',
  LOGS: 'mtcpro_logs_v1',
  NOTIFICATIONS: 'mtcpro_notifications_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage with fallback to INITIAL_*
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) return JSON.parse(saved);
    // default to admin for instant test preview
    return INITIAL_USERS[0];
  });

  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_MENU_PERMISSIONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPARE_PARTS);
    return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [selectedWOForDetail, setSelectedWOForDetail] = useState<WorkOrder | null>(null);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(menuPermissions)); }, [menuPermissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SPARE_PARTS, JSON.stringify(spareParts)); }, [spareParts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);

  // Live fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchSupabaseData = async () => {
      try {
        const [p, a, w, s, sp, v, mp] = await Promise.all([
          supabaseService.getProfiles(),
          supabaseService.getAssets(),
          supabaseService.getWorkOrders(),
          supabaseService.getSchedules(),
          supabaseService.getSpareParts(),
          supabaseService.getVendors(),
          supabaseService.getMenuPermissions()
        ]);

        if (p && p.length > 0) setUsers(p);
        if (a && a.length > 0) setAssets(a);
        if (w && w.length > 0) setWorkOrders(w);
        if (s && s.length > 0) setSchedules(s);
        if (sp && sp.length > 0) setSpareParts(sp);
        if (v && v.length > 0) setVendors(v);
        if (mp && mp.length > 0) setMenuPermissions(mp);
      } catch (err) {
        console.error('Supabase initial fetch failed, using local/cache store:', err);
      }
    };

    fetchSupabaseData();
  }, []);

  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (action: string, entityType: ActivityLog['entityType'], entityId: string, details: string) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: timeStr,
      userId: currentUser ? currentUser.id : 'system',
      userName: currentUser ? currentUser.name : 'Sistem MTCPRO',
      userRole: currentUser ? currentUser.role : 'admin',
      action,
      entityType,
      entityId,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (email: string, role?: UserRole) => {
    let foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser && role) {
      foundUser = users.find((u) => u.role === role);
    }
    if (foundUser) {
      setCurrentUser(foundUser);
      showToast('success', `Selamat Datang, ${foundUser.name}`, `Login berhasil sebagai ${foundUser.role.toUpperCase()}`);
      addLog('Login Pengguna', 'user', foundUser.id, `User ${foundUser.name} (${foundUser.role}) berhasil masuk.`);
      return true;
    }
    showToast('error', 'Login Gagal', 'Email tidak terdaftar pada sistem MTCPRO.');
    return false;
  };

  const register = async (name: string, email: string, role: UserRole = 'teknisi', specialization?: string) => {
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      showToast('error', 'Pendaftaran Gagal', 'Email ini sudah terdaftar di sistem.');
      return false;
    }
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      phone: '+62 8' + Math.floor(100000000 + Math.random() * 900000000),
      specialization: specialization || 'MEP Generalist Technician',
      department: role === 'admin' ? 'Facility Management' : role === 'manager' ? 'Executive' : 'Operations',
      joinedDate: new Date().toISOString().substring(0, 10)
    };

    // Save to Supabase
    supabaseService.insertProfile(newUser).then((created) => {
      if (created) {
        setUsers((prev) => prev.map((u) => (u.email === created.email ? created : u)));
      }
    });

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast('success', 'Pendaftaran Berhasil', `Akun ${name} telah dibuat sebagai ${role.toUpperCase()}.`);
    addLog('Registrasi Akun Baru', 'user', newUser.id, `Akun baru terdaftar: ${name} (${role}).`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      addLog('Logout Pengguna', 'user', currentUser.id, `User ${currentUser.name} telah keluar.`);
    }
    setCurrentUser(null);
    showToast('info', 'Sign Out Berhasil', 'Anda telah keluar dari sesi MTCPRO.');
  };

  const switchUserRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      showToast('info', `Beralih Akun: ${matched.name}`, `Role aktif: ${role.toUpperCase()}`);
    }
  };

  const switchUserById = (userId: string) => {
    const matched = users.find((u) => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      showToast('info', `Beralih Pengguna`, `Aktif sebagai ${matched.name} (${matched.role.toUpperCase()})`);
    }
  };

  const isMenuAccessibleForRole = (menuKey: string, role: UserRole): boolean => {
    if (role === 'admin') return true;
    const perm = menuPermissions.find((p) => p.menuKey === menuKey);
    if (!perm) return true;
    return perm.rolesAllowed[role] === true;
  };

  const updateMenuPermission = (menuKey: string, targetRole: 'teknisi' | 'supervisor' | 'manager', allowed: boolean) => {
    const updatedRoles = menuPermissions.find((p) => p.menuKey === menuKey)?.rolesAllowed;
    const newRoles = {
      ...(updatedRoles || { teknisi: true, supervisor: true, manager: true }),
      [targetRole]: allowed
    };

    setMenuPermissions((prev) =>
      prev.map((perm) => {
        if (perm.menuKey === menuKey) {
          return {
            ...perm,
            rolesAllowed: newRoles
          };
        }
        return perm;
      })
    );

    // Persist to Supabase
    supabaseService.updateMenuPermissionInDb(menuKey, newRoles);

    showToast('success', 'Izin Menu Diperbarui', `Menu ${menuKey} untuk role ${targetRole.toUpperCase()} diubah.`);
    addLog('Update Izin Menu', 'permission', menuKey, `Izin menu ${menuKey} untuk role ${targetRole} diubah menjadi ${allowed ? 'Aktif' : 'Non-Aktif'}.`);
  };

  // Asset Actions
  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const id = 'ast-' + (assets.length + 1).toString().padStart(2, '0');
    const newAsset: Asset = { id, ...assetData };
    setAssets((prev) => [newAsset, ...prev]);

    // Save to Supabase
    supabaseService.insertAsset(assetData).then((created) => {
      if (created) {
        setAssets((prev) => prev.map((a) => (a.assetTag === created.assetTag ? created : a)));
      }
    });

    showToast('success', 'Aset Berhasil Ditambahkan', `${newAsset.name} [${newAsset.assetTag}]`);
    addLog('Tambah Aset Baru', 'asset', id, `Menambahkan aset MEP: ${newAsset.name} (${newAsset.category})`);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    supabaseService.updateAsset(id, updates);
    showToast('success', 'Data Aset Diperbarui', `Perubahan aset berhasil disimpan.`);
    addLog('Edit Data Aset', 'asset', id, `Memperbarui data aset ID: ${id}`);
  };

  const deleteAsset = (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    supabaseService.deleteAsset(id);
    showToast('info', 'Aset Dihapus', `${target?.name || id} telah dihapus dari inventaris.`);
    addLog('Hapus Aset', 'asset', id, `Menghapus aset: ${target?.name}`);
  };

  // Work Order Actions
  const createWorkOrder = (woData: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string; woNumber?: string; createdAt?: string }) => {
    const count = workOrders.length + 1;
    const woNumber = woData.woNumber || `WO-2026-${count.toString().padStart(4, '0')}`;
    const id = woData.id || `wo-${count.toString().padStart(2, '0')}`;
    const now = new Date();
    const timeStr = woData.createdAt || woData.woDate || now.toISOString().replace('T', ' ').substring(0, 16);

    const newWO: WorkOrder = {
      ...woData,
      id,
      woNumber,
      createdAt: timeStr,
      woDate: woData.woDate || timeStr.substring(0, 10)
    };
    setWorkOrders((prev) => [newWO, ...prev]);

    // Save to Supabase
    supabaseService.insertWorkOrder(newWO).then((created) => {
      if (created) {
        setWorkOrders((prev) => prev.map((w) => (w.title === created.title ? created : w)));
      }
    });

    showToast('success', 'Work Order Diterbitkan', `${newWO.woNumber}: ${newWO.title || newWO.assetName}`);
    addLog('Buat Work Order', 'work_order', id, `Menerbitkan ${newWO.woNumber} [${newWO.priority}] untuk aset ${newWO.assetName}`);
  };

  const updateWorkOrderStatus = (id: string, status: WOStatus, notes?: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          const completedAt = status === 'Selesai' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : wo.completedAt;
          return {
            ...wo,
            status,
            technicianNotes: notes !== undefined ? notes : wo.technicianNotes,
            completedAt
          };
        }
        return wo;
      })
    );
    supabaseService.updateWorkOrder(id, { status, technicianNotes: notes });
    showToast('info', 'Status WO Diubah', `Status sekarang: ${status}`);
    addLog('Ubah Status WO', 'work_order', id, `Status WO diubah menjadi ${status}`);
  };

  const updateWorkOrderPriority = (id: string, priority: WOPriority) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, priority } : wo))
    );
    supabaseService.updateWorkOrder(id, { priority });
    showToast('warning', 'Prioritas WO Diubah', `Prioritas diubah menjadi ${priority}`);
    addLog('Ubah Prioritas WO', 'work_order', id, `Prioritas WO diubah menjadi ${priority}`);
  };

  const assignWorkOrder = (id: string, technicianId: string) => {
    const tech = users.find((u) => u.id === technicianId);
    if (!tech) return;

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          return {
            ...wo,
            assignedToId: tech.id,
            assignedToName: tech.name,
            status: wo.status === 'Open' ? 'Proses' : wo.status
          };
        }
        return wo;
      })
    );
    supabaseService.updateWorkOrder(id, {
      assignedToId: tech.id,
      assignedToName: tech.name,
      status: 'Proses'
    });
    showToast('success', 'Teknisi Ditugaskan', `${tech.name} ditugaskan pada WO.`);
    addLog('Penugasan Teknisi', 'work_order', id, `Menugaskan teknisi ${tech.name} ke WO ID ${id}`);
  };

  const completeWorkOrderByTechnician = (
    id: string,
    notes: string,
    completedSteps: string[],
    usedParts: { partId: string; quantity: number }[]
  ) => {
    // 1. Deduct spare parts
    if (usedParts && usedParts.length > 0) {
      setSpareParts((prevParts) =>
        prevParts.map((part) => {
          const matched = usedParts.find((u) => u.partId === part.id);
          if (matched) {
            const updatedStock = Math.max(0, part.stock - matched.quantity);
            supabaseService.updateSparePartStock(part.id, updatedStock);
            return { ...part, stock: updatedStock };
          }
          return part;
        })
      );
    }

    const sparePartsDetails = usedParts.map((u) => {
      const p = spareParts.find((part) => part.id === u.partId);
      return {
        partId: u.partId,
        partName: p?.name || 'Spare Part',
        quantity: u.quantity,
        sku: p?.sku || '-'
      };
    });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          return {
            ...wo,
            status: 'Selesai',
            completedAt: now,
            technicianNotes: notes,
            stepsCompleted: completedSteps,
            sparePartsUsed: [...(wo.sparePartsUsed || []), ...sparePartsDetails]
          };
        }
        return wo;
      })
    );

    supabaseService.updateWorkOrder(id, {
      status: 'Selesai',
      completedAt: now,
      technicianNotes: notes,
      stepsCompleted: completedSteps,
      sparePartsUsed: sparePartsDetails
    });

    showToast('success', 'Pekerjaan Teknisi Selesai!', 'Menunggu verifikasi dan approval oleh Supervisor.');
    addLog('Penyelesaian Pekerjaan Teknisi', 'work_order', id, `Teknisi ${currentUser?.name} menyelesaikan WO ID ${id}`);
  };

  const approveWorkOrderBySupervisor = (id: string, supervisorNotes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          return {
            ...wo,
            status: 'Disetujui',
            approvedById: currentUser?.id,
            approvedByName: currentUser?.name,
            approvedAt: now,
            technicianNotes: supervisorNotes
              ? `${wo.technicianNotes || ''}\n[Catatan Supervisor ${currentUser?.name}]: ${supervisorNotes}`
              : wo.technicianNotes
          };
        }
        return wo;
      })
    );

    supabaseService.updateWorkOrder(id, {
      status: 'Disetujui',
      approvedById: currentUser?.id,
      approvedByName: currentUser?.name,
      approvedAt: now
    });

    showToast('success', 'Work Order Disetujui!', 'Pekerjaan telah diverifikasi dan ditutup secara resmi.');
    addLog('Approval Supervisor', 'work_order', id, `Supervisor ${currentUser?.name} menyetujui penutupan WO ID ${id}`);
  };

  // Schedule Actions
  const addSchedule = (scheduleData: Omit<MaintenanceSchedule, 'id' | 'scheduleCode'>) => {
    const count = schedules.length + 1;
    const scheduleCode = `SCH-PM-${scheduleData.category.substring(0, 3).toUpperCase()}${count.toString().padStart(2, '0')}`;
    const id = `sch-${count.toString().padStart(2, '0')}`;

    const newSch: MaintenanceSchedule = {
      id,
      scheduleCode,
      ...scheduleData
    };
    setSchedules((prev) => [newSch, ...prev]);

    supabaseService.insertSchedule(scheduleData).then((created) => {
      if (created) {
        setSchedules((prev) => prev.map((s) => (s.title === created.title ? created : s)));
      }
    });

    showToast('success', 'Jadwal Preventif Dibuat', `${newSch.scheduleCode} - ${newSch.title}`);
    addLog('Tambah Jadwal Preventif', 'schedule', id, `Jadwal pemeliharaan preventif baru untuk ${newSch.assetName}`);
  };

  const toggleScheduleStatus = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Ditunda' : 'Aktif' } : s))
    );
  };

  const generateWOFromSchedule = (scheduleId: string) => {
    const sch = schedules.find((s) => s.id === scheduleId);
    if (!sch) return;

    const count = workOrders.length + 1;
    const woNumber = `WO-2026-${count.toString().padStart(4, '0')}`;
    const id = `wo-${count.toString().padStart(2, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newWO: WorkOrder = {
      id,
      woNumber,
      title: `[PM Preventif] ${sch.title}`,
      description: `Eksekusi pemeliharaan berkala terjadwal sesuai SOP ${sch.scheduleCode}. Durasi estimasi: ${sch.estimatedDuration}. Checklist wajib: \n${sch.checklistItems.join('\n- ')}`,
      assetId: sch.assetId,
      assetName: sch.assetName,
      assetTag: sch.assetTag,
      category: sch.category,
      location: 'Sesuai Lokasi Aset',
      priority: 'Medium',
      status: 'Open',
      assignedToId: sch.assignedToId,
      assignedToName: sch.assignedToName,
      createdById: currentUser ? currentUser.id : 'usr-admin-01',
      createdByName: currentUser ? currentUser.name : 'Sistem PM Otomatis',
      createdAt: now,
      dueDate: sch.nextDueDate,
      totalSteps: sch.checklistItems,
      stepsCompleted: [],
      sparePartsUsed: []
    };

    setWorkOrders((prev) => [newWO, ...prev]);

    supabaseService.insertWorkOrder({
      title: newWO.title,
      description: newWO.description,
      assetId: newWO.assetId,
      assetName: newWO.assetName,
      assetTag: newWO.assetTag,
      category: newWO.category,
      location: newWO.location,
      priority: newWO.priority,
      status: newWO.status,
      assignedToId: newWO.assignedToId,
      assignedToName: newWO.assignedToName,
      createdById: newWO.createdById,
      createdByName: newWO.createdByName,
      dueDate: newWO.dueDate,
      estimatedHours: 4,
      totalSteps: newWO.totalSteps,
      stepsCompleted: [],
      sparePartsUsed: []
    });

    showToast('success', 'Auto-Generate Work Order Sukses', `Diterbitkan ${woNumber} dari jadwal ${sch.scheduleCode}`);
    addLog('Generate WO dari Jadwal', 'work_order', id, `Otomatisasi pembuatan WO ${woNumber} dari jadwal preventif ${sch.scheduleCode}`);
  };

  // Spare Part Actions
  const restockSparePart = (id: string, quantityToAdd: number) => {
    let updatedStock = 0;
    setSpareParts((prev) =>
      prev.map((part) => {
        if (part.id === id) {
          updatedStock = part.stock + quantityToAdd;
          return {
            ...part,
            stock: updatedStock,
            lastRestocked: new Date().toISOString().substring(0, 10)
          };
        }
        return part;
      })
    );

    supabaseService.updateSparePartStock(id, updatedStock);
    showToast('success', 'Restok Berhasil', `+${quantityToAdd} unit berhasil ditambahkan ke inventaris.`);
    addLog('Restok Spare Part', 'spare_part', id, `Menambahkan stok sejumlah ${quantityToAdd} pada suku cadang ID ${id}`);
  };

  const addSparePart = (partData: Omit<SparePart, 'id'>) => {
    const id = 'prt-' + (spareParts.length + 1).toString().padStart(2, '0');
    const newPart: SparePart = { id, ...partData };
    setSpareParts((prev) => [...prev, newPart]);

    supabaseService.insertSparePart(partData).then((created) => {
      if (created) {
        setSpareParts((prev) => prev.map((p) => (p.sku === created.sku ? created : p)));
      }
    });

    showToast('success', 'Suku Cadang Ditambahkan', `${newPart.name} [${newPart.sku}]`);
    addLog('Tambah Spare Part', 'spare_part', id, `Menambahkan suku cadang baru: ${newPart.name}`);
  };

  const updateSparePart = (id: string, updates: Partial<SparePart>) => {
    setSpareParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('info', 'Data Spare Part Diperbarui', 'Perubahan berhasil disimpan.');
  };

  // Team Actions
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    // Save to Supabase
    supabaseService.updateProfileRole(userId, newRole);

    // If updating current user's role
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast('success', 'Role Pengguna Diubah', `Role diubah menjadi ${newRole.toUpperCase()}`);
    addLog('Ubah Role User', 'user', userId, `Mengubah hak akses user ID ${userId} menjadi ${newRole}`);
  };

  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const id = 'usr-' + Date.now();
    const newUser: UserProfile = { id, ...userData };
    setUsers((prev) => [...prev, newUser]);

    // Save directly to Supabase profiles table
    supabaseService.insertProfile(userData).then((created) => {
      if (created) {
        setUsers((prev) => prev.map((u) => (u.email === created.email ? created : u)));
      }
    });

    showToast('success', 'Anggota Tim Ditambahkan', `${newUser.name} [${newUser.role.toUpperCase()}]`);
  };

  // Vendor Actions
  const addVendor = (vendorData: Omit<Vendor, 'id'>) => {
    const id = 'vnd-' + (vendors.length + 1).toString().padStart(2, '0');
    const newVendor: Vendor = { id, ...vendorData };
    setVendors((prev) => [...prev, newVendor]);

    supabaseService.insertVendor(vendorData).then((created) => {
      if (created) {
        setVendors((prev) => prev.map((v) => (v.name === created.name ? created : v)));
      }
    });

    showToast('success', 'Vendor Mitra Ditambahkan', newVendor.name);
    addLog('Tambah Vendor', 'vendor', id, `Menambahkan mitra rekanan: ${newVendor.name}`);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    showToast('info', 'Data Vendor Diperbarui', 'Perubahan tersimpan.');
  };

  const deleteVendor = (id: string) => {
    const target = vendors.find((v) => v.id === id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
    supabaseService.deleteVendor(id);
    showToast('info', 'Vendor Dihapus', `${target?.name || id} telah dihapus.`);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('info', 'Notifikasi Dibaca', 'Semua notifikasi ditandai telah dibaca.');
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setMenuPermissions(INITIAL_MENU_PERMISSIONS);
    setAssets(INITIAL_ASSETS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setSchedules(INITIAL_SCHEDULES);
    setSpareParts(INITIAL_SPARE_PARTS);
    setVendors(INITIAL_VENDORS);
    setLogs(INITIAL_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('success', 'Reset Data Berhasil', 'Semua data telah dikembalikan ke kondisi awal (factory defaults).');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        menuPermissions,
        assets,
        workOrders,
        schedules,
        spareParts,
        vendors,
        logs,
        notifications,
        toasts,
        currentView,
        selectedAssetForDetail,
        selectedWOForDetail,
        setCurrentView,
        setSelectedAssetForDetail,
        setSelectedWOForDetail,
        showToast,
        removeToast,
        login,
        register,
        logout,
        switchUserRole,
        switchUserById,
        isMenuAccessibleForRole,
        updateMenuPermission,
        addAsset,
        updateAsset,
        deleteAsset,
        createWorkOrder,
        updateWorkOrderStatus,
        updateWorkOrderPriority,
        assignWorkOrder,
        completeWorkOrderByTechnician,
        approveWorkOrderBySupervisor,
        addSchedule,
        toggleScheduleStatus,
        generateWOFromSchedule,
        restockSparePart,
        addSparePart,
        updateSparePart,
        updateUserRole,
        addUser,
        addVendor,
        updateVendor,
        deleteVendor,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
