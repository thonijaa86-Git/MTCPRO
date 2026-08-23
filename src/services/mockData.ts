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

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Admin Facilities',
    email: 'admin@mtcpro.co.id',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+62 812-9988-7711',
    specialization: 'Chief MEP Engineer & Facilities Director',
    department: 'Facility Management',
    joinedDate: '2026-01-01',
    status: 'Aktif'
  },
  {
    id: 'usr-spv-01',
    name: 'Rian Pratama',
    email: 'supervisor@mtcpro.co.id',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+62 813-2233-4455',
    specialization: 'MEP Operations Supervisor',
    department: 'Maintenance & Operations',
    joinedDate: '2026-01-01',
    status: 'Aktif'
  },
  {
    id: 'usr-tek-01',
    name: 'Agus Santoso',
    email: 'teknisi@mtcpro.co.id',
    role: 'teknisi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+62 856-1122-3344',
    specialization: 'Teknisi MEP Lapangan',
    department: 'Mechanical Maintenance',
    joinedDate: '2026-01-01',
    status: 'Aktif'
  }
];

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
    label: 'Pengelolaan Vendor',
    iconName: 'Building2',
    menuNumber: '08',
    description: 'Mitra spesialis pihak ketiga, kontrak SLA, dan kontak darurat',
    rolesAllowed: {
      teknisi: false,
      supervisor: true,
      manager: true
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
