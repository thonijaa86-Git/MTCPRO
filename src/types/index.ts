export type UserRole = 'admin' | 'teknisi' | 'supervisor' | 'manager';

export type MepCategory =
  | 'Kelistrikan'
  | 'Genset'
  | 'HVAC'
  | 'Air bersih'
  | 'Grounding & Penyalur Petir'
  | 'CCTV'
  | 'Hydrant'
  | 'Fire Alarm'
  | 'IPAL'
  | 'Video Audio'
  | 'Bangunan'
  | 'Landscape'
  | 'Mechanical'
  | 'Electrical'
  | 'Plumbing'
  | string;

export type AssetStatus = 'Operasional' | 'Perbaikan' | 'Kritis' | 'Non-Aktif';

export type AssetCondition = 'Sangat Baik' | 'Baik' | 'Perlu Perhatian' | 'Rusak';

export type WOStatus = 'Open' | 'Proses' | 'Pending' | 'Selesai' | 'Disetujui';

export type ScheduleFrequency = 'Harian' | 'Mingguan' | 'Bulanan' | 'Triwulan' | 'Semester' | 'Tahunan';

export type WOPriority = 'Emergency' | 'High' | 'Medium' | 'Low' | 'Kritis' | 'Tinggi' | 'Rendah' | string;

export type WOCategory = 'Corrective' | 'Preventive' | 'Installation' | 'Inspection' | 'Operation' | 'Supervise' | string;

export type JobType = 'Mechanical' | 'Electrical' | 'Sipil' | 'Others' | string;

export interface MaterialItem {
  id: string;
  name: string; // Nama Part/Material/Mesin
  qty: number; // QTY
  unit: string; // Unit (Pcs, Set, Liter, Meter, Roll, dll)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  specialization?: string;
  department?: string;
  joinedDate?: string;
}

export interface Asset {
  id: string;
  assetTag: string; // e.g. "NO Aset: AST-HVAC-001"
  name: string; // Nama Aset
  category: MepCategory; // Kategori dropdown
  location: string; // Lokasi
  specification?: string; // Spesifikasi
  manufactureYear?: string | number; // Tahun Pembuatan
  installYear?: string | number; // Tahun Instalasi
  status: AssetStatus;
  condition: AssetCondition;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  capacity?: string;
  powerRating?: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string; // NO WO (e.g. "WO-2026-001")
  woDate?: string; // Tanggal WO
  title: string;
  description: string;
  assetId?: string;
  assetName: string; // Nama Aset
  assetTag?: string;
  category?: MepCategory;
  location: string; // Lokasi
  priority: WOPriority; // Emergency, High, Medium, Low
  woCategory?: WOCategory; // Corrective, Preventive, Inspection, Operation, Supervise
  jobType?: JobType; // Mechanical, Electrical, Sipil, Others
  vendorName?: string; // Vendor Pelaksana
  assignedToId?: string;
  assignedToName?: string; // Nama Pelaksana
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  materials?: MaterialItem[]; // Tabel Part/Material/Mesin
  photos?: string[]; // Dokumentasi foto upload / camera
  stepsCompleted?: string[];
  totalSteps?: string[];
  sparePartsUsed?: {
    partId: string;
    partName: string;
    quantity: number;
    sku: string;
  }[];
  technicianNotes?: string;
  completionProofUrl?: string;
  status: WOStatus;
}

export interface MaintenanceSchedule {
  id: string;
  scheduleCode: string; // e.g. "SCH-PM-001"
  title: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  category: MepCategory;
  frequency: ScheduleFrequency;
  lastRunDate?: string;
  nextDueDate: string;
  assignedType: 'internal' | 'vendor';
  assignedToId?: string;
  assignedToName?: string;
  vendorId?: string;
  vendorName?: string;
  checklistItems: string[];
  estimatedDuration: string;
  status: 'Aktif' | 'Ditunda' | 'Selesai';
}

export interface SparePart {
  id: string;
  sku: string; // e.g. "PRT-HVAC-01"
  name: string;
  category: MepCategory;
  stock: number;
  minThreshold: number;
  unit: string;
  unitCost: number;
  locationRack: string;
  compatibleAssets: string[];
  supplier?: string;
  lastRestocked?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialization: string[]; // e.g. ["HVAC / Chiller", "Lift & Elevator"]
  contractStatus: 'Aktif' | 'Review' | 'Expired';
  rating: number; // 1-5
  address: string;
  activeJobsCount: number;
  contractExpiry: string;
}

export interface MenuPermission {
  menuKey: string;
  label: string;
  iconName: string;
  menuNumber: string; // "01", "02", etc.
  description: string;
  // Which roles are allowed to access this menu (admin is always true)
  rolesAllowed: {
    teknisi: boolean;
    supervisor: boolean;
    manager: boolean;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'asset' | 'work_order' | 'schedule' | 'spare_part' | 'vendor' | 'permission' | 'user';
  entityId: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  linkMenu?: string;
}
