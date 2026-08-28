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
  login: (email: string, password?: string, role?: UserRole) => boolean;
  register: (name: string, email: string, phone?: string, company?: string, position?: string, password?: string, role?: UserRole) => boolean | Promise<boolean>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  isMenuAccessibleForRole: (menuKey: string, role: UserRole) => boolean;
  updateMenuPermission: (menuKey: string, targetRole: 'teknisi' | 'supervisor' | 'manager', allowed: boolean) => void;
  userMenuPermissions: Record<string, string[]>;
  updateUserMenuPermission: (userId: string, menuKey: string, allowed: boolean) => void;
  setUserMenuPermissions: (userId: string, menuKeys: string[] | null) => void;
  isMenuAccessibleForUser: (menuKey: string, user: UserProfile) => boolean;
  getDefaultMenuKeysForRole: (role: UserRole) => string[];
  
  // Asset Actions
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  deleteBulkAssets: (ids: string[]) => void;
  
  // Work Order Actions
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string; woNumber?: string; createdAt?: string }) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  deleteBulkWorkOrders: (ids: string[]) => void;
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
  updateSchedule: (id: string, updates: Partial<MaintenanceSchedule>) => void;
  deleteSchedule: (id: string) => void;
  deleteBulkSchedules: (ids: string[]) => void;
  toggleScheduleStatus: (id: string) => void;
  generateWOFromSchedule: (scheduleId: string) => void;
  
  // Spare Parts Actions
  restockSparePart: (id: string, quantityToAdd: number) => void;
  addSparePart: (part: Omit<SparePart, 'id'>) => void;
  updateSparePart: (id: string, updates: Partial<SparePart>) => void;
  deleteSparePart: (id: string) => void;
  deleteBulkSpareParts: (ids: string[]) => void;
  
  // Team Actions
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  approveUser: (id: string, assignedRole: UserRole, department?: string, company?: string, position?: string) => void;
  rejectUser: (id: string) => void;
  deleteUser: (id: string) => void;
  deleteBulkUsers: (ids: string[]) => void;
  
  // Vendor Actions
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  deleteBulkVendors: (ids: string[]) => void;
  
  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Reset Data to Factory Defaults
  resetAllData: () => void;
}

type SparePartsState = SparePart[];

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'mtcpro_users_v2',
  CURRENT_USER: 'mtcpro_current_user_v2',
  PERMISSIONS: 'mtcpro_permissions_v2',
  ASSETS: 'mtcpro_assets_v2',
  WORK_ORDERS: 'mtcpro_work_orders_v2',
  SCHEDULES: 'mtcpro_schedules_v2',
  SPARE_PARTS: 'mtcpro_spare_parts_v2',
  VENDORS: 'mtcpro_vendors_v2',
  LOGS: 'mtcpro_logs_v2',
  NOTIFICATIONS: 'mtcpro_notifications_v2',
  USER_PERMISSIONS: 'mtcpro_user_permissions_v2',
  APPROVED_MAP: 'mtcpro_approved_users_map'
};

const DEFAULT_SYSTEM_EMAILS = new Set([
  'admin@mtcpro.co.id',
  'supervisor@mtcpro.co.id',
  'teknisi@mtcpro.co.id',
  'dedi.kurniawan@mtcpro.co.id',
  'hendra.saputra@mtcpro.co.id',
  'manager@mtcpro.co.id'
]);

const getApprovedUsersMap = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('mtcpro_approved_users_map');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const setApprovedUserStatus = (email: string, status: 'Aktif' | 'Ditolak') => {
  try {
    const current = getApprovedUsersMap();
    current[email.toLowerCase().trim()] = status;
    localStorage.setItem('mtcpro_approved_users_map', JSON.stringify(current));
  } catch (e) {
    // ignore
  }
};

export const isDummyUser = (u: any): boolean => {
  if (!u) return true;
  const email = (u.email || '').toLowerCase().trim();
  const id = (u.id || '').toLowerCase().trim();
  const name = (u.name || '').trim();
  return (
    email.endsWith('@mtcpro.co.id') ||
    id === 'usr-admin-01' ||
    id === 'usr-spv-01' ||
    id === 'usr-tek-01' ||
    name === 'Admin Facilities' ||
    name === 'Admin Facility MEP' ||
    name === 'Rian Pratama' ||
    name === 'Agus Santoso'
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage with fallback to INITIAL_*
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((u: UserProfile) => !isDummyUser(u))
            .map((u: UserProfile) => ({
              ...u,
              status: u.status || 'Aktif'
            }));
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
          return cleaned;
        }
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !isDummyUser(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    let base: MenuPermission[] = INITIAL_MENU_PERMISSIONS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = new Map<string, MenuPermission>();
          parsed.forEach((p: MenuPermission) => savedMap.set(p.menuKey, p));
          base = INITIAL_MENU_PERMISSIONS.map((im) => {
            const savedItem = savedMap.get(im.menuKey);
            return savedItem ? { ...im, rolesAllowed: { ...im.rolesAllowed, ...savedItem.rolesAllowed } } : im;
          });
        }
      } catch (e) {
        // fallback
      }
    }
    // Enforce strictly 3 menus for teknisi: dashboard, work_orders, schedules, and sync metadata
    return base.map((m) => {
      const initialMatch = INITIAL_MENU_PERMISSIONS.find((im) => im.menuKey === m.menuKey);
      return {
        ...m,
        menuNumber: initialMatch?.menuNumber || m.menuNumber,
        label: initialMatch?.label || m.label,
        description: initialMatch?.description || m.description,
        iconName: initialMatch?.iconName || m.iconName,
        rolesAllowed: {
          ...m.rolesAllowed,
          teknisi: m.menuKey === 'dashboard' || m.menuKey === 'work_orders' || m.menuKey === 'schedules'
        }
      };
    });
  });

  const [userMenuPermissions, setUserMenuPermissionsState] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PERMISSIONS);
    return saved ? JSON.parse(saved) : {};
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
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER_PERMISSIONS, JSON.stringify(userMenuPermissions)); }, [userMenuPermissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SPARE_PARTS, JSON.stringify(spareParts)); }, [spareParts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);

  // Ensure menuPermissions always contains all 10 items (including 09 and 10)
  useEffect(() => {
    setMenuPermissions((prev) => {
      const savedMap = new Map<string, MenuPermission>();
      (prev || []).forEach((p) => savedMap.set(p.menuKey, p));

      const merged = INITIAL_MENU_PERMISSIONS.map((im) => {
        const savedItem = savedMap.get(im.menuKey);
        return {
          ...im,
          rolesAllowed: savedItem ? { ...im.rolesAllowed, ...savedItem.rolesAllowed } : im.rolesAllowed
        };
      });

      if (prev && prev.length === 10 && prev.every((p, idx) => p.menuKey === merged[idx]?.menuKey)) {
        return prev;
      }
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Listen for storage events across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
          }
        } catch (err) {
          // ignore
        }
      }
      if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-generate notification when pending users are detected
  useEffect(() => {
    const pending = users.filter((u) => (u.status || '').toLowerCase().trim() === 'pending' || (u.status || '').toLowerCase().trim() === 'menunggu approval');
    if (pending.length > 0) {
      setNotifications((prev) => {
        const hasExisting = prev.some((n) => (n.title.includes('Pendaftaran') || n.title.includes('Pengajuan')) && !n.read);
        if (!hasExisting) {
          const generatedNotif: SystemNotification = {
            id: 'notif-pending-users-' + Date.now(),
            title: 'Pendaftaran Akun Baru Menunggu Approval',
            message: `Terdapat ${pending.length} pengguna baru (${pending.map(u => u.name).join(', ')}) yang mendaftar dan menunggu persetujuan Administrator.`,
            timestamp: 'Baru saja',
            type: 'warning',
            read: false,
            linkMenu: 'supervisor_approval'
          };
          return [generatedNotif, ...prev];
        }
        return prev;
      });
    }
  }, [users]);

  // Live fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchSupabaseData = async () => {
      try {
        // Asynchronously delete any lingering dummy profiles from Supabase
        supabaseService.deleteDummyProfiles().catch(() => {});

        const [p, a, w, s, sp, v, mp] = await Promise.all([
          supabaseService.getProfiles(),
          supabaseService.getAssets(),
          supabaseService.getWorkOrders(),
          supabaseService.getSchedules(),
          supabaseService.getSpareParts(),
          supabaseService.getVendors(),
          supabaseService.getMenuPermissions()
        ]);

        if (p && p.length > 0) {
          const nonDummy = p.filter((prof) => !isDummyUser(prof));
          setUsers((prev) => {
            const userMap = new Map<string, UserProfile>();
            // 1. First keep all local real users
            prev.filter((u) => !isDummyUser(u)).forEach((u) => {
              if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
            });

            // 2. Merge / enrich with profiles from Supabase
            nonDummy.forEach((prof) => {
              const emailKey = prof.email.toLowerCase().trim();
              const existing = userMap.get(emailKey);
              const resolvedStatus = existing?.status || prof.status || 'Aktif';

              userMap.set(emailKey, {
                ...prof,
                password: prof.password || existing?.password || '',
                phone: prof.phone || existing?.phone || '',
                company: prof.company || existing?.company || 'PT DAHANA (Persero)',
                position: prof.position || existing?.position || 'MEP Specialist',
                status: resolvedStatus
              });
            });

            const mergedList = Array.from(userMap.values());
            // Update users list without auto-assigning currentUser if user is logged out
            return mergedList;
          });
        }
        if (a && a.length > 0) setAssets(a);
        if (w && w.length > 0) setWorkOrders(w);
        if (s && s.length > 0) setSchedules(s);
        if (sp && sp.length > 0) setSpareParts(sp);
        if (v && v.length > 0) setVendors(v);
        if (mp && mp.length > 0) {
          const normalizedMp = mp.map((m) => ({
            ...m,
            rolesAllowed: {
              ...m.rolesAllowed,
              teknisi: m.menuKey === 'dashboard' || m.menuKey === 'work_orders' || m.menuKey === 'schedules'
            }
          }));
          setMenuPermissions(normalizedMp);
        }
      } catch (error) {
        console.error('Error fetching Supabase data:', error);
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

  // Sync helpers
  const addLog = (
    action: string,
    entityType: ActivityLog['entityType'],
    entityId: string,
    details: string
  ) => {
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
  const login = (email: string, password?: string, role?: UserRole): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      showToast('error', 'Login Gagal', 'Alamat email wajib diisi.');
      return false;
    }
    if (!cleanPassword) {
      showToast('error', 'Login Gagal', 'Kata sandi (password) wajib diisi.');
      return false;
    }

    const foundUser = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (!foundUser) {
      showToast('error', 'Login Gagal', 'Email tidak terdaftar pada sistem MTCPRO. Pastikan email sudah benar atau daftar akun baru.');
      return false;
    }

    const isPending = (foundUser.status || '').toLowerCase().trim() === 'pending' || (foundUser.status || '').toLowerCase().trim() === 'menunggu approval' || (foundUser.status || '').toLowerCase().trim() === 'menunggu persetujuan';
    const isRejected = (foundUser.status || '').toLowerCase().trim() === 'ditolak';

    if (isPending) {
      showToast('warning', 'Akun Menunggu Persetujuan', 'Pendaftaran akun Anda sedang menunggu verifikasi dan persetujuan (approval) oleh Administrator.');
      return false;
    }
    if (isRejected) {
      showToast('error', 'Akses Ditolak', 'Akun ini telah dinonaktifkan atau ditolak oleh Administrator.');
      return false;
    }

    // Strict Password Validation
    if (foundUser.password && foundUser.password.trim() !== '') {
      if (foundUser.password !== cleanPassword) {
        showToast('error', 'Login Gagal', 'Kata sandi yang Anda masukkan tidak sesuai. Silakan periksa kembali.');
        return false;
      }
    } else {
      // If legacy profile had empty password, save this initial password
      foundUser.password = cleanPassword;
      if (isSupabaseConfigured()) {
        supabaseService.updateProfile(foundUser.id, { password: cleanPassword }).catch(() => {});
      }
    }

    setCurrentUser(foundUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
    showToast('success', `Selamat Datang, ${foundUser.name}`, `Login berhasil sebagai ${foundUser.role.toUpperCase()}`);
    addLog('Login Pengguna', 'user', foundUser.id, `User ${foundUser.name} (${foundUser.role}) berhasil masuk.`);
    return true;
  };

  const register = async (
    name: string,
    email: string,
    phone?: string,
    company?: string,
    position?: string,
    password?: string,
    role: UserRole = 'teknisi'
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone?.trim() || '+62 8' + Math.floor(100000000 + Math.random() * 900000000);
    const cleanCompany = company?.trim() || 'PT DAHANA (Persero)';
    const cleanPosition = position?.trim() || 'MEP Specialist';
    const cleanPassword = password?.trim() || '';

    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      const existingUser = users[existingIndex];
      // If already active or approved
      if (existingUser.status === 'Aktif') {
        showToast('error', 'Pendaftaran Gagal', 'Email ini sudah aktif terdaftar di sistem MTCPRO. Silakan langsung masuk (Login).');
        return false;
      }

      // If pending or rejected, update and re-submit to approval queue
      const updatedPendingUser: UserProfile = {
        ...existingUser,
        name: cleanName,
        phone: cleanPhone,
        company: cleanCompany,
        position: cleanPosition,
        specialization: cleanPosition,
        department: cleanCompany,
        password: cleanPassword || existingUser.password || '',
        status: 'Pending',
        joinedDate: new Date().toISOString().substring(0, 10)
      };

      setUsers((prev) => prev.map((u, i) => (i === existingIndex ? updatedPendingUser : u)));

      const newNotif: SystemNotification = {
        id: 'notif-user-' + Date.now(),
        title: 'Pendaftaran Akun Baru',
        message: `${cleanName} (${cleanCompany} - ${cleanPosition}) mendaftar akun baru dan menunggu persetujuan admin.`,
        timestamp: 'Baru saja',
        type: 'warning',
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);

      showToast('warning', 'Pendaftaran Berhasil Dikirim!', 'Pengajuan akun Anda telah tercatat dan sedang menunggu persetujuan (approval) oleh Administrator.');
      addLog('Registrasi Akun Baru', 'user', updatedPendingUser.id, `Pendaftar ${cleanName} (${cleanEmail}) memperbarui pengajuan akun.`);

      if (isSupabaseConfigured()) {
        supabaseService.insertProfile(updatedPendingUser).catch((err) => console.warn(err));
      }
      return true;
    }

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      company: cleanCompany,
      position: cleanPosition,
      specialization: cleanPosition,
      password: cleanPassword,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      department: cleanCompany,
      joinedDate: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    };

    // 1. Immediately update local state & storage
    setUsers((prev) => [...prev, newUser]);

    // Push system notification for admin / supervisor
    const newNotif: SystemNotification = {
      id: 'notif-user-' + Date.now(),
      title: 'Pendaftaran Akun Baru',
      message: `${cleanName} (${cleanCompany} - ${cleanPosition}) mendaftar akun baru dan menunggu persetujuan admin.`,
      timestamp: 'Baru saja',
      type: 'warning',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('warning', 'Pendaftaran Berhasil Dikirim!', 'Akun Anda sedang menunggu persetujuan (approval) oleh Administrator sebelum dapat login.');
    addLog('Registrasi Akun Baru', 'user', newUser.id, `Pendaftaran akun baru menunggu persetujuan admin: ${cleanName} (${cleanEmail}) - ${cleanCompany}`);

    // 2. Save to Supabase in background safely
    try {
      if (isSupabaseConfigured()) {
        supabaseService.insertProfile(newUser).then((created) => {
          if (created) {
            setUsers((prev) => prev.map((u) => (u.email.toLowerCase() === created.email.toLowerCase() ? { ...created, status: 'Pending' } : u)));
          }
        }).catch((err) => {
          console.warn('Supabase profile save error:', err);
        });
      }
    } catch (err) {
      console.warn('Supabase sync skipped:', err);
    }

    return true;
  };

  const logout = () => {
    if (currentUser) {
      addLog('Logout Pengguna', 'user', currentUser.id, `User ${currentUser.name} telah keluar.`);
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    showToast('info', 'Sign Out Berhasil', 'Anda telah keluar dari sesi MTCPRO.');
  };

  const switchUserRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      if (role === 'teknisi' && currentView !== 'dashboard' && currentView !== 'work_orders' && currentView !== 'schedules') {
        setCurrentView('dashboard');
      }
      showToast('info', `Beralih Akun: ${matched.name}`, `Role aktif: ${role.toUpperCase()}`);
    }
  };

  const switchUserById = (userId: string) => {
    const matched = users.find((u) => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      if (matched.role === 'teknisi' && currentView !== 'dashboard' && currentView !== 'work_orders' && currentView !== 'schedules') {
        setCurrentView('dashboard');
      }
      showToast('info', `Beralih Pengguna`, `Aktif sebagai ${matched.name} (${matched.role.toUpperCase()})`);
    }
  };

  const getDefaultMenuKeysForRole = (role: UserRole): string[] => {
    if (role === 'admin') {
      return menuPermissions.map((m) => m.menuKey);
    }
    return menuPermissions
      .filter((m) => m.rolesAllowed && m.rolesAllowed[role] === true)
      .map((m) => m.menuKey);
  };

  const isMenuAccessibleForRole = (menuKey: string, role: UserRole): boolean => {
    if (role === 'admin') return true;
    const perm = menuPermissions.find((p) => p.menuKey === menuKey);
    if (!perm) return false;
    return perm.rolesAllowed?.[role] === true;
  };

  const isMenuAccessibleForUser = (menuKey: string, user: UserProfile): boolean => {
    if (user.role === 'admin') return true;
    if (userMenuPermissions && userMenuPermissions[user.id]) {
      return userMenuPermissions[user.id].includes(menuKey);
    }
    return isMenuAccessibleForRole(menuKey, user.role);
  };

  const updateUserMenuPermission = (userId: string, menuKey: string, allowed: boolean) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUserMenuPermissionsState((prev) => {
      const currentAllowed = prev[userId] !== undefined
        ? prev[userId]
        : getDefaultMenuKeysForRole(targetUser.role);

      const nextAllowed = allowed
        ? Array.from(new Set([...currentAllowed, menuKey]))
        : currentAllowed.filter((k) => k !== menuKey);

      return {
        ...prev,
        [userId]: nextAllowed
      };
    });

    const actionText = allowed ? 'diaktifkan' : 'dinonaktifkan';
    showToast('info', 'Hak Akses User Diperbarui', `Menu ${menuKey} ${actionText} untuk ${targetUser.name}`);
    addLog('Update Izin User', 'permission', userId, `Admin mengubah izin menu ${menuKey} untuk ${targetUser.name} (${targetUser.email}) menjadi ${allowed ? 'Aktif' : 'Non-Aktif'}.`);
  };

  const setUserMenuPermissions = (userId: string, menuKeys: string[] | null) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUserMenuPermissionsState((prev) => {
      const updated = { ...prev };
      if (menuKeys === null) {
        delete updated[userId];
      } else {
        updated[userId] = menuKeys;
      }
      return updated;
    });

    if (menuKeys === null) {
      showToast('info', 'Reset Izin User', `Izin menu untuk ${targetUser.name} dikembalikan ke default role ${targetUser.role.toUpperCase()}.`);
      addLog('Reset Izin User', 'permission', userId, `Admin mengembalikan izin menu untuk ${targetUser.name} ke default role.`);
    } else {
      showToast('success', 'Izin User Disimpan', `Hak akses menu kustom berhasil disimpan untuk ${targetUser.name}.`);
      addLog('Set Izin Kustom User', 'permission', userId, `Admin mengatur ${menuKeys.length} menu kustom untuk ${targetUser.name}.`);
    }
  };

  const updateMenuPermission = (menuKey: string, targetRole: 'teknisi' | 'supervisor' | 'manager', allowed: boolean) => {
    setMenuPermissions((prev) => {
      const prevMap = new Map<string, MenuPermission>();
      (prev || []).forEach((p) => prevMap.set(p.menuKey, p));

      const fullList = INITIAL_MENU_PERMISSIONS.map((im) => {
        const found = prevMap.get(im.menuKey);
        return found ? { ...im, rolesAllowed: { ...im.rolesAllowed, ...found.rolesAllowed } } : im;
      });

      const updated = fullList.map((perm) => {
        if (perm.menuKey === menuKey) {
          return {
            ...perm,
            rolesAllowed: {
              ...(perm.rolesAllowed || {}),
              [targetRole]: allowed
            }
          };
        }
        return perm;
      });

      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(updated));
      return updated;
    });

    const targetPerm = INITIAL_MENU_PERMISSIONS.find((p) => p.menuKey === menuKey);
    const existingRoles = menuPermissions.find((p) => p.menuKey === menuKey)?.rolesAllowed || targetPerm?.rolesAllowed || {};
    const newRoles = { ...existingRoles, [targetRole]: allowed };

    // Persist to Supabase
    supabaseService.updateMenuPermissionInDb(menuKey, newRoles);

    showToast('success', 'Izin Menu Diperbarui', `Menu ${menuKey} untuk role ${targetRole.toUpperCase()} diubah.`);
    addLog('Update Izin Menu', 'permission', menuKey, `Izin menu ${menuKey} untuk role ${targetRole} diubah menjadi ${allowed ? 'Aktif' : 'Non-Aktif'}.`);
  };

  // Asset Actions
  const addAsset = async (assetData: Omit<Asset, 'id'>) => {
    const tempId = 'ast-' + Date.now();
    const newAsset: Asset = { id: tempId, ...assetData };
    setAssets((prev) => [newAsset, ...prev]);

    // Save directly to Supabase assets table
    try {
      const created = await supabaseService.insertAsset(assetData);
      if (created) {
        setAssets((prev) => prev.map((a) => (a.id === tempId || a.assetTag === created.assetTag ? created : a)));
      }
    } catch (err) {
      console.error('Error saving asset to Supabase:', err);
    }

    showToast('success', 'Aset Berhasil Ditambahkan', `${newAsset.name} [${newAsset.assetTag}]`);
    addLog('Tambah Aset Baru', 'asset', tempId, `Menambahkan aset MEP: ${newAsset.name} (${newAsset.category})`);
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

  const deleteBulkAssets = (ids: string[]) => {
    if (ids.length === 0) return;
    setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
    supabaseService.deleteBulkAssets(ids);
    showToast('info', 'Aset Terpilih Dihapus', `${ids.length} aset berhasil dihapus.`);
    addLog('Hapus Massal Aset', 'asset', ids[0], `Menghapus ${ids.length} aset sekaligus`);
  };

  // Work Order Actions
  const createWorkOrder = (woData: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string; woNumber?: string; createdAt?: string }) => {
    const count = workOrders.length + 1;
    const woNumber = woData.woNumber || `WO-2026-${count.toString().padStart(4, '0')}`;
    const id = woData.id || `wo-${Date.now()}`;
    const now = new Date();
    const timeStr = woData.createdAt || woData.woDate || now.toISOString().replace('T', ' ').substring(0, 16);

    const newWO: WorkOrder = {
      ...woData,
      id,
      woNumber,
      createdAt: timeStr,
      woDate: woData.woDate || timeStr.substring(0, 10),
      status: woData.status || 'Open'
    };

    // 1. Immediately update state and storage
    setWorkOrders((prev) => [newWO, ...prev]);

    // 2. Asynchronously persist to Supabase
    if (isSupabaseConfigured()) {
      supabaseService.insertWorkOrder(newWO).then((created) => {
        if (created) {
          setWorkOrders((prev) =>
            prev.map((w) => (w.id === newWO.id || w.woNumber === created.woNumber ? { ...newWO, ...created, id: created.id } : w))
          );
        }
      }).catch((err) => {
        console.warn('Supabase WO save error:', err);
      });
    }

    showToast('success', 'Work Order Diterbitkan', `${newWO.woNumber}: ${newWO.title || newWO.assetName}`);
    addLog('Buat Work Order', 'work_order', id, `Menerbitkan ${newWO.woNumber} [${newWO.priority}] untuk aset ${newWO.assetName}`);
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, ...updates } : wo))
    );
    supabaseService.updateWorkOrder(id, updates);
    showToast('success', 'Work Order Diperbarui', `Perubahan WO ID ${id} berhasil disimpan.`);
    addLog('Edit Work Order', 'work_order', id, `Memperbarui data Work Order ID ${id}`);
  };

  const deleteWorkOrder = (id: string) => {
    const target = workOrders.find((w) => w.id === id);
    setWorkOrders((prev) => prev.filter((w) => w.id !== id));
    supabaseService.deleteWorkOrder(id);
    showToast('info', 'Work Order Dihapus', `${target?.woNumber || id} telah dihapus.`);
    addLog('Hapus Work Order', 'work_order', id, `Menghapus WO: ${target?.woNumber}`);
  };

  const deleteBulkWorkOrders = (ids: string[]) => {
    if (ids.length === 0) return;
    setWorkOrders((prev) => prev.filter((w) => !ids.includes(w.id)));
    supabaseService.deleteBulkWorkOrders(ids);
    showToast('info', 'Work Order Terpilih Dihapus', `${ids.length} Work Order berhasil dihapus.`);
    addLog('Hapus Massal WO', 'work_order', ids[0], `Menghapus ${ids.length} Work Order sekaligus`);
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

  const updateSchedule = (id: string, updates: Partial<MaintenanceSchedule>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    supabaseService.updateSchedule(id, updates);
    showToast('success', 'Jadwal Diperbarui', `Perubahan jadwal berhasil disimpan.`);
  };

  const deleteSchedule = (id: string) => {
    const target = schedules.find((s) => s.id === id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    supabaseService.deleteSchedule(id);
    showToast('info', 'Jadwal Dihapus', `${target?.scheduleCode || id} telah dihapus.`);
  };

  const deleteBulkSchedules = (ids: string[]) => {
    if (ids.length === 0) return;
    setSchedules((prev) => prev.filter((s) => !ids.includes(s.id)));
    supabaseService.deleteBulkSchedules(ids);
    showToast('info', 'Jadwal Terpilih Dihapus', `${ids.length} jadwal berhasil dihapus.`);
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
    supabaseService.updateSparePart(id, updates);
    showToast('info', 'Data Spare Part Diperbarui', 'Perubahan berhasil disimpan.');
  };

  const deleteSparePart = (id: string) => {
    const target = spareParts.find((p) => p.id === id);
    setSpareParts((prev) => prev.filter((p) => p.id !== id));
    supabaseService.deleteSparePart(id);
    showToast('info', 'Spare Part Dihapus', `${target?.name || id} telah dihapus.`);
  };

  const deleteBulkSpareParts = (ids: string[]) => {
    if (ids.length === 0) return;
    setSpareParts((prev) => prev.filter((p) => !ids.includes(p.id)));
    supabaseService.deleteBulkSpareParts(ids);
    showToast('info', 'Spare Part Terpilih Dihapus', `${ids.length} spare part berhasil dihapus.`);
  };

  // Team Actions
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (u.email) setApprovedUserStatus(u.email, 'Aktif');
          return { ...u, role: newRole, status: 'Aktif' };
        }
        return u;
      })
    );

    // Save to Supabase
    supabaseService.updateProfileRole(userId, newRole);
    supabaseService.updateProfileStatus(userId, 'Aktif', newRole);

    // If updating current user's role
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole, status: 'Aktif' } : null));
    }
    showToast('success', 'Role Pengguna Diubah', `Role diubah menjadi ${newRole.toUpperCase()} dan akun berstatus Aktif.`);
    addLog('Ubah Role User', 'user', userId, `Mengubah hak akses user ID ${userId} menjadi ${newRole}`);
  };

  const addUser = async (userData: Omit<UserProfile, 'id'>) => {
    const tempId = 'usr-' + Date.now();
    const newUser: UserProfile = { id: tempId, status: 'Aktif', ...userData };
    if (newUser.email) setApprovedUserStatus(newUser.email, 'Aktif');
    setUsers((prev) => [...prev, newUser]);

    // Save directly to Supabase profiles table
    try {
      const created = await supabaseService.insertProfile(newUser);
      if (created) {
        setUsers((prev) => prev.map((u) => (u.id === tempId || u.email === created.email ? created : u)));
      }
    } catch (err) {
      console.error('Error saving user to Supabase:', err);
    }

    showToast('success', 'Anggota Tim Ditambahkan', `${newUser.name} [${newUser.role.toUpperCase()}]`);
    addLog('Tambah Anggota Tim', 'user', tempId, `Menambahkan anggota tim: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    supabaseService.updateProfile(id, updates);
    showToast('info', 'Data Anggota Diperbarui', 'Perubahan data personil berhasil disimpan.');
    addLog('Edit Anggota Tim', 'user', id, `Memperbarui data profil pengguna ID ${id}`);
  };

  const approveUser = (id: string, assignedRole: UserRole, department?: string, company?: string, position?: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.email) {
      setApprovedUserStatus(target.email, 'Aktif');
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            status: 'Aktif',
            role: assignedRole,
            company: company || u.company || department || 'PT DAHANA (Persero)',
            department: department || company || u.department || 'Maintenance & Operations',
            position: position || u.position || u.specialization || 'MEP Specialist',
            specialization: position || u.specialization || 'MEP Specialist'
          };
        }
        return u;
      })
    );

    supabaseService.updateProfileStatus(id, 'Aktif', assignedRole);
    if (company || department || position) {
      supabaseService.updateProfile(id, {
        company: company || department,
        department: department || company,
        position: position,
        specialization: position
      });
    }

    showToast('success', 'Pendaftaran Akun Disetujui!', `${target?.name || 'Pengguna'} kini aktif dengan peran ${assignedRole.toUpperCase()} dan otomatis terdaftar di menu Team.`);
    addLog('Approval Pengguna', 'user', id, `Admin menyetujui akun ${target?.name} dengan peran ${assignedRole.toUpperCase()} (Perusahaan: ${company || department || target?.company})`);
  };

  const rejectUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.email) {
      setApprovedUserStatus(target.email, 'Ditolak');
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'Ditolak' } : u))
    );
    supabaseService.updateProfileStatus(id, 'Ditolak');
    showToast('warning', 'Pendaftaran Akun Ditolak', `Pendaftaran akun ${target?.name || 'pengguna'} telah ditolak.`);
    addLog('Tolak Akun', 'user', id, `Admin menolak pendaftaran akun ${target?.name}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    supabaseService.deleteProfile(id);
    showToast('info', 'Pengguna Dihapus', `${target?.name || id} telah dihapus dari sistem.`);
    addLog('Hapus Pengguna', 'user', id, `Menghapus akun personil: ${target?.name}`);
  };

  const deleteBulkUsers = (ids: string[]) => {
    if (ids.length === 0) return;
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    supabaseService.deleteBulkProfiles(ids);
    showToast('info', 'Pengguna Terpilih Dihapus', `${ids.length} pengguna berhasil dihapus.`);
    addLog('Hapus Massal Pengguna', 'user', ids[0], `Menghapus ${ids.length} personil sekaligus`);
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

  const deleteBulkVendors = (ids: string[]) => {
    if (ids.length === 0) return;
    setVendors((prev) => prev.filter((v) => !ids.includes(v.id)));
    supabaseService.deleteBulkVendors(ids);
    showToast('info', 'Vendor Terpilih Dihapus', `${ids.length} vendor berhasil dihapus.`);
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
        userMenuPermissions,
        updateUserMenuPermission,
        setUserMenuPermissions,
        isMenuAccessibleForUser,
        getDefaultMenuKeysForRole,
        addAsset,
        updateAsset,
        deleteAsset,
        deleteBulkAssets,
        createWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        deleteBulkWorkOrders,
        updateWorkOrderStatus,
        updateWorkOrderPriority,
        assignWorkOrder,
        completeWorkOrderByTechnician,
        approveWorkOrderBySupervisor,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        deleteBulkSchedules,
        toggleScheduleStatus,
        generateWOFromSchedule,
        restockSparePart,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        deleteBulkSpareParts,
        updateUserRole,
        addUser,
        updateUser,
        approveUser,
        rejectUser,
        deleteUser,
        deleteBulkUsers,
        addVendor,
        updateVendor,
        deleteVendor,
        deleteBulkVendors,
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
