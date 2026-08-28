import {
  UserProfile,
  Asset,
  WorkOrder,
  MaintenanceSchedule,
  SparePart,
  Vendor,
  MenuPermission,
  ActivityLog,
  SystemNotification
} from '../types';

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_MENU_PERMISSIONS: MenuPermission[] = [
  {
    menuKey: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    menuNumber: '01',
    description: 'Ringkasan KPI, status aset, dan performa pemeliharaan sistem',
    rolesAllowed: {
      teknisi: true,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'assets',
    label: 'Pengelolaan Aset',
    iconName: 'Cpu',
    menuNumber: '02',
    description: 'Inventaris mesin & peralatan Mechanical, Electrical, dan Plumbing',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'work_orders',
    label: 'Work Order',
    iconName: 'ClipboardList',
    menuNumber: '03',
    description: 'Manajemen instruksi kerja, perbaikan, dan penugasan teknisi',
    rolesAllowed: {
      teknisi: true,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'schedules',
    label: 'Maintenance Schedule',
    iconName: 'CalendarClock',
    menuNumber: '04',
    description: 'Jadwal pemeliharaan preventif berkala dan kalender eksekusi',
    rolesAllowed: {
      teknisi: true,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'spare_parts',
    label: 'Pengelolaan Spare Part',
    iconName: 'Boxes',
    menuNumber: '05',
    description: 'Stok suku cadang MEP, ambang batas minimum, dan reorder point',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: false
    }
  },
  {
    menuKey: 'team',
    label: 'Team',
    iconName: 'Users2',
    menuNumber: '06',
    description: 'Daftar personil teknis, kompetensi, dan distribusi beban kerja',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'reports',
    label: 'Report',
    iconName: 'BarChart3',
    menuNumber: '07',
    description: 'Analitik MTTR/MTBF, efisiensi energi, dan audit performa pemeliharaan',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'vendors',
    label: 'Perusahaan',
    iconName: 'Building2',
    menuNumber: '08',
    description: 'Mitra spesialis pihak ketiga, perusahaan internal, dan kontak darurat',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: true
    }
  },
  {
    menuKey: 'menu_permissions',
    label: 'Pengaturan Akses Menu',
    iconName: 'SlidersHorizontal',
    menuNumber: '09',
    description: 'Konfigurasi hak akses modul, matriks peran pengguna, dan izin kustom',
    rolesAllowed: {
      teknisi: false,
      supervisor: false,
      manager: false
    }
  },
  {
    menuKey: 'supervisor_approval',
    label: 'Verifikasi & Approval',
    iconName: 'CheckCheck',
    menuNumber: '10',
    description: 'Otorisasi verifikasi pendaftaran akun baru dan penetapan role personil',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: false
    }
  }
];

// All operational data starts completely empty
export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_WORK_ORDERS: WorkOrder[] = [];
export const INITIAL_SCHEDULES: MaintenanceSchedule[] = [];
export const INITIAL_SPARE_PARTS: SparePart[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
