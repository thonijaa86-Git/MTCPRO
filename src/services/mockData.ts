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
    name: 'Bambang Sudirgo, S.T.',
    email: 'admin@mtcpro.co.id',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+62 812-9988-7711',
    specialization: 'Chief MEP Engineer & Facilities Director',
    department: 'Facility Management',
    joinedDate: '2022-01-15'
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
    joinedDate: '2022-06-10'
  },
  {
    id: 'usr-tek-01',
    name: 'Agus Santoso',
    email: 'teknisi@mtcpro.co.id',
    role: 'teknisi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+62 856-1122-3344',
    specialization: 'Senior HVAC & Chiller Specialist',
    department: 'Mechanical Maintenance',
    joinedDate: '2023-03-01'
  },
  {
    id: 'usr-tek-02',
    name: 'Dedi Kurniawan',
    email: 'dedi.kurniawan@mtcpro.co.id',
    role: 'teknisi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+62 857-4455-6677',
    specialization: 'High Voltage & Electrical Distribution Tech',
    department: 'Electrical Maintenance',
    joinedDate: '2023-08-15'
  },
  {
    id: 'usr-tek-03',
    name: 'Hendra Saputra',
    email: 'hendra.saputra@mtcpro.co.id',
    role: 'teknisi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+62 878-3344-5566',
    specialization: 'Plumbing, Water Treatment & STP Specialist',
    department: 'Plumbing & Drainage',
    joinedDate: '2023-11-20'
  },
  {
    id: 'usr-mgr-01',
    name: 'Ir. Hendro Wijaya, M.M.',
    email: 'manager@mtcpro.co.id',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '+62 811-3344-5599',
    specialization: 'General Manager Engineering & Asset Reliability',
    department: 'Executive Management',
    joinedDate: '2021-04-01'
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
      teknisi: true,
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
      teknisi: true, // Allowed for checking stock during maintenance
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

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-01',
    assetTag: 'AST-HVAC-001',
    name: 'Centrifugal Water-Cooled Chiller #01 (500 TR)',
    category: 'HVAC',
    location: 'Basement 2 — Central Chiller Plant',
    specification: 'Kapasitas 500 TR (1,758 kW), 320 kW (380V/3 Phase), Merk Daikin WMC-500-E, Freon R-134a, Delta T 5.5°C',
    manufactureYear: '2022',
    installYear: '2023',
    status: 'Operasional',
    condition: 'Sangat Baik',
    manufacturer: 'Daikin Applied',
    model: 'WMC-500-E',
    serialNumber: 'DK-2023-CH500-881',
    installDate: '2023-02-10',
    lastMaintenance: '2026-08-10',
    nextMaintenance: '2026-09-10',
    capacity: '500 Tons of Refrigeration (1,758 kW)',
    powerRating: '320 kW (380V / 3 Phase)',
    notes: 'Kondensor dan evaporator rutin dibersihkan. Delta T chiller terjaga di 5.5°C.'
  },
  {
    id: 'ast-02',
    assetTag: 'AST-HVAC-012',
    name: 'Air Handling Unit (AHU) Lantai 12',
    category: 'HVAC',
    location: 'Lantai 12 — Ruang AHU Sayap Barat',
    specification: 'Kapasitas 8,500 CFM, Motor 7.5 kW, Merk Carrier 39HQ-080, Belt Drive B-68',
    manufactureYear: '2021',
    installYear: '2022',
    status: 'Perbaikan',
    condition: 'Perlu Perhatian',
    manufacturer: 'Carrier Corp',
    model: '39HQ-080',
    serialNumber: 'CR-2022-AHU-1204',
    installDate: '2022-05-14',
    lastMaintenance: '2026-08-15',
    nextMaintenance: '2026-08-25',
    capacity: '8,500 CFM',
    powerRating: '7.5 kW',
    notes: 'V-Belt mengalami getaran mikro. Menunggu penggantian V-Belt tipe B-68.'
  },
  {
    id: 'ast-03',
    assetTag: 'AST-GEN-001',
    name: 'Emergency Diesel Generator Cummins 1500 kVA',
    category: 'Genset',
    location: 'Gedung Powerhouse — Genset Room',
    specification: 'Kapasitas 1,500 kVA / 1,200 kWe Standby, 380/220V 50Hz, Mesin Cummins QSK50-G4, Tangki Solar 5000L',
    manufactureYear: '2020',
    installYear: '2021',
    status: 'Operasional',
    condition: 'Sangat Baik',
    manufacturer: 'Cummins Power Generation',
    model: 'QSK50-G4',
    serialNumber: 'CM-2021-G1500-09',
    installDate: '2021-11-20',
    lastMaintenance: '2026-08-01',
    nextMaintenance: '2026-09-01',
    capacity: '1,500 kVA / 1,200 kWe Standby',
    powerRating: '380/220V, 50 Hz, 0.8 PF',
    notes: 'Rutin warming-up mingguan tiap hari Kamis pukul 10:00 WIB. Level solar 92%.'
  },
  {
    id: 'ast-04',
    assetTag: 'AST-KLS-001',
    name: 'Main Distribution Panel (MDP) Gedung Utama',
    category: 'Kelistrikan',
    location: 'Basement 1 — Main Electrical Room',
    specification: 'Busbar 3200 Ampere Cu, 400V 50Hz 3P+N+PE, ACB Schneider Masterpact MTZ2 3200A Micrologic 5.0X',
    manufactureYear: '2020',
    installYear: '2020',
    status: 'Operasional',
    condition: 'Baik',
    manufacturer: 'Schneider Electric',
    model: 'Prisma Plus P 3200A',
    serialNumber: 'SE-2020-MDP32-11',
    installDate: '2020-09-15',
    lastMaintenance: '2026-07-22',
    nextMaintenance: '2026-10-22',
    capacity: '3200 Ampere Busbar',
    powerRating: '400V 50Hz 3P+N+PE',
    notes: 'Inspeksi Thermal Imaging (Infrared thermography) terakhir menunjukkan koneksi kabel normal.'
  },
  {
    id: 'ast-05',
    assetTag: 'AST-AIR-001',
    name: 'Hydrophore Booster Pump System (3x Inverter)',
    category: 'Air bersih',
    location: 'Basement 2 — Water Treatment & Pump Station',
    specification: '3 unit Pompa Grundfos CRE 20-5 Inverter, Head 65m, Debit 45 m³/jam, Tekanan konstan 5.5 Bar',
    manufactureYear: '2022',
    installYear: '2023',
    status: 'Operasional',
    condition: 'Baik',
    manufacturer: 'Grundfos Pumps',
    model: 'Hydro Multi-E CRE 20-5',
    serialNumber: 'GF-2023-BST3X-091',
    installDate: '2023-01-18',
    lastMaintenance: '2026-08-12',
    nextMaintenance: '2026-09-12',
    capacity: '45 m³/h @ 5.5 Bar Head',
    powerRating: '3 x 5.5 kW (380V / 3 Phase)',
    notes: 'Inverter drive beroperasi sinkron auto-alternating untuk menjaga keausan pompa merata.'
  },
  {
    id: 'ast-06',
    assetTag: 'AST-IPL-001',
    name: 'Sewage Treatment Plant (STP) Extended Aeration',
    category: 'IPAL',
    location: 'Area Outdoor — Utilitas STP Bawah Tanah',
    specification: 'Kapasitas 150 m³/hari, 2x Blower Roots Anlet 5.5 kW, Bio media honeycomb PVC, Disinfeksi Klorinasi',
    manufactureYear: '2019',
    installYear: '2020',
    status: 'Kritis',
    condition: 'Perlu Perhatian',
    manufacturer: 'Indo Water Solutions',
    model: 'Bio-STP EA-150',
    serialNumber: 'IWS-2020-STP-150',
    installDate: '2020-04-10',
    lastMaintenance: '2026-08-16',
    nextMaintenance: '2026-08-23',
    capacity: '150 m³/hari debit olahan',
    powerRating: '11 kW total sistem',
    notes: 'Blower #02 mengalami kenaikan getaran dan temperatur bearing (78°C). Diperlukan pelumasan/bearing baru.'
  },
  {
    id: 'ast-07',
    assetTag: 'MEP-MEC-FHP01',
    name: 'Main Electric Fire Hydrant Pump',
    category: 'Mechanical',
    location: 'Basement 2 — Fire Protection Station',
    status: 'Operasional',
    condition: 'Sangat Baik',
    manufacturer: 'Patterson Pump / Armstrong',
    model: 'Horizontal Split Case 8x6x17',
    serialNumber: 'PT-2020-FHP-771',
    installDate: '2020-03-12',
    lastMaintenance: '2026-08-05',
    nextMaintenance: '2026-09-05',
    capacity: '1,000 GPM @ 140 PSI (NFPA 20 compliant)',
    powerRating: '110 kW (Star-Delta Starter)',
    notes: 'Jockey pump dan Electric Fire Pump diuji auto-start setiap minggu.'
  },
  {
    id: 'ast-08',
    assetTag: 'MEP-ELC-TRF01',
    name: 'Dry Type Step-Down Transformer 2500 kVA',
    category: 'Electrical',
    location: 'Basement 1 — Trafo Room PLN Substation',
    status: 'Operasional',
    condition: 'Sangat Baik',
    manufacturer: 'Trafindo Prima',
    model: 'Cast Resin 20kV / 400V',
    serialNumber: 'TF-2022-TR25-01',
    installDate: '2022-01-20',
    lastMaintenance: '2026-06-15',
    nextMaintenance: '2026-12-15',
    capacity: '2500 kVA',
    powerRating: '20 kV / 400-230 V',
    notes: 'Suhu koil rata-rata 68°C (Normal batas aman max 100°C).'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-01',
    woNumber: 'WO-2026-0801',
    title: 'Perbaikan Blower Aerasi Line B Macet pada STP',
    description: 'Blower aerasi mengeluarkan getaran abnormal dan tripped saat beban puncak. Lakukan pembongkaran casing blower dan penggantian deep groove ball bearing serta pengisian ulang synthetic grease.',
    assetId: 'ast-06',
    assetName: 'Sewage Treatment Plant (STP) Extended Aeration',
    assetTag: 'MEP-PLM-STP01',
    category: 'Plumbing',
    location: 'External Ground Yard — Sub-Basement Area',
    priority: 'Kritis',
    status: 'Proses',
    assignedToId: 'usr-tek-03',
    assignedToName: 'Hendra Saputra',
    createdById: 'usr-spv-01',
    createdByName: 'Rian Pratama',
    createdAt: '2026-08-22 09:30',
    dueDate: '2026-08-23 18:00',
    estimatedHours: 6,
    actualHours: 3.5,
    stepsCompleted: [
      'Lockout Tagout (LOTO) breaker power supply blower',
      'Pembongkaran pulley dan housing blower',
      'Inspeksi shaft rotor dan pengukuran clearance'
    ],
    totalSteps: [
      'Lockout Tagout (LOTO) breaker power supply blower',
      'Pembongkaran pulley dan housing blower',
      'Inspeksi shaft rotor dan pengukuran clearance',
      'Pemasangan bearing baru SKF 6312-2Z',
      'Penyetelan alignment pulley dan tension belt',
      'Uji coba running test 30 menit & pengukuran arus'
    ],
    sparePartsUsed: [
      {
        partId: 'prt-04',
        partName: 'Deep Groove Ball Bearing SKF 6312-2Z',
        quantity: 2,
        sku: 'PRT-PLM-BRG63'
      }
    ],
    technicianNotes: 'Bearing lama aus dan pecah seal. Shaft rotor sudah dibersihkan dan siap pasang bearing baru.'
  },
  {
    id: 'wo-02',
    woNumber: 'WO-2026-0802',
    title: 'Penggantian V-Belt dan Penyetelan Alignment AHU Lt 12',
    description: 'V-belt transmisi motor AHU lantai 12 mengalami keretakan mikro dan kelonggaran sehingga debit udara berkurang ke koridor barat.',
    assetId: 'ast-02',
    assetName: 'Air Handling Unit (AHU) Lantai 12',
    assetTag: 'MEP-MEC-AHU12',
    category: 'Mechanical',
    location: 'Lantai 12 — Ruang AHU Sayap Barat',
    priority: 'Tinggi',
    status: 'Open',
    assignedToId: 'usr-tek-01',
    assignedToName: 'Agus Santoso',
    createdById: 'usr-admin-01',
    createdByName: 'Bambang Sudirgo, S.T.',
    createdAt: '2026-08-22 14:15',
    dueDate: '2026-08-24 16:00',
    estimatedHours: 3,
    stepsCompleted: [],
    totalSteps: [
      'Isolasi panel kelistrikan AHU-12',
      'Pelepasan V-Belt lama yang aus',
      'Pembersihan groove pulley dari debu & minyak',
      'Pemasangan set V-Belt Optibelt B-68 (3 pcs)',
      'Laser alignment dan pengukuran tegangan belt',
      'Pengecekan flow udara dan balancing motor'
    ],
    sparePartsUsed: []
  },
  {
    id: 'wo-03',
    woNumber: 'WO-2026-0803',
    title: 'Uji Beban & Kalibrasi ATS Genset Cummins 1500 kVA',
    description: 'Pelaksanaan simulasi blackout PLN untuk verifikasi sinkronisasi Automatic Transfer Switch (ATS) dan waktu transisi genset di bawah 10 detik.',
    assetId: 'ast-03',
    assetName: 'Emergency Diesel Generator Cummins 1500 kVA',
    assetTag: 'MEP-ELC-GNS01',
    category: 'Electrical',
    location: 'Gedung Powerhouse — Genset Room',
    priority: 'Medium',
    status: 'Selesai',
    assignedToId: 'usr-tek-02',
    assignedToName: 'Dedi Kurniawan',
    createdById: 'usr-spv-01',
    createdByName: 'Rian Pratama',
    createdAt: '2026-08-20 08:00',
    dueDate: '2026-08-21 12:00',
    completedAt: '2026-08-21 11:30',
    approvedById: 'usr-spv-01',
    approvedByName: 'Rian Pratama',
    approvedAt: '2026-08-21 13:00',
    estimatedHours: 4,
    actualHours: 3.5,
    stepsCompleted: [
      'Pemeriksaan level oli, air radiator, dan baterai aki genset',
      'Koordinasi dengan security dan tenant via pengumuman PA system',
      'Simulasi pemutusan incoming PLN breaker',
      'Pencatatan waktu start genset hingga load switch (Hasil: 7.2 detik)',
      'Running load test 30 menit pada beban 650 kW',
      'Sinkronisasi kembali ke PLN grid secara mulus'
    ],
    totalSteps: [
      'Pemeriksaan level oli, air radiator, dan baterai aki genset',
      'Koordinasi dengan security dan tenant via pengumuman PA system',
      'Simulasi pemutusan incoming PLN breaker',
      'Pencatatan waktu start genset hingga load switch (Hasil: 7.2 detik)',
      'Running load test 30 menit pada beban 650 kW',
      'Sinkronisasi kembali ke PLN grid secara mulus'
    ],
    sparePartsUsed: [
      {
        partId: 'prt-03',
        partName: 'Filter Solar Cummins Fleetguard FS1006',
        quantity: 2,
        sku: 'PRT-ELC-FLT01'
      }
    ],
    technicianNotes: 'ATS beroperasi prima. Transisi load berhasil dalam 7.2 detik (standar < 10 detik). Rekomendasi: ganti aki baterai 12V 200Ah pada Q4 2026.'
  },
  {
    id: 'wo-04',
    woNumber: 'WO-2026-0804',
    title: 'Pembersihan Tube Kondensor & Descaling Chiller #01',
    description: 'Pembersihan mekanis tabung kondensor menggunakan rotary tube cleaner untuk menurunkan fouling factor dan meningkatkan efisiensi COP chiller.',
    assetId: 'ast-01',
    assetName: 'Centrifugal Water-Cooled Chiller #01 (500 TR)',
    assetTag: 'MEP-MEC-CHL01',
    category: 'Mechanical',
    location: 'Basement 2 — Central Chiller Plant',
    priority: 'Medium',
    status: 'Pending',
    assignedToId: 'usr-tek-01',
    assignedToName: 'Agus Santoso',
    createdById: 'usr-admin-01',
    createdByName: 'Bambang Sudirgo, S.T.',
    createdAt: '2026-08-21 10:00',
    dueDate: '2026-08-26 17:00',
    estimatedHours: 8,
    stepsCompleted: [
      'Shutdown sistem chiller #01 dan isolasi water valve kondensor'
    ],
    totalSteps: [
      'Shutdown sistem chiller #01 dan isolasi water valve kondensor',
      'Pengurasan air kondensor dan pembukaan end-cover',
      'Rotary brush cleaning pada 480 tubes tembaga',
      'Pemberian chemical descaler & flushing netralisir',
      'Penggantian gasket cover baru dan torquing baut',
      'Hydrostatic leak test dan integrasi cooling tower'
    ],
    sparePartsUsed: [
      {
        partId: 'prt-02',
        partName: 'Gasket Neoprene End Cover Chiller 500TR',
        quantity: 2,
        sku: 'PRT-MEC-GSK02'
      }
    ],
    technicianNotes: 'Menunggu pengiriman sikat nylon rotary ukuran 3/4 inch tambahan dari vendor.'
  },
  {
    id: 'wo-05',
    woNumber: 'WO-2026-0805',
    title: 'Inspeksi & Uji Pressure Switch Booster Pump Lt 8-20',
    description: 'Pengujian response time inverter VFD saat kran hidran/toilet lantai atas dibuka serentak. Kalibrasi sensor pressure transmitter 4-20mA.',
    assetId: 'ast-05',
    assetName: 'Hydrophore Booster Pump System (3x Inverter)',
    assetTag: 'MEP-PLM-BST01',
    category: 'Plumbing',
    location: 'Basement 2 — Water Treatment & Pump Station',
    priority: 'Rendah',
    status: 'Open',
    assignedToId: 'usr-tek-03',
    assignedToName: 'Hendra Saputra',
    createdById: 'usr-spv-01',
    createdByName: 'Rian Pratama',
    createdAt: '2026-08-22 11:00',
    dueDate: '2026-08-27 15:00',
    estimatedHours: 3,
    stepsCompleted: [],
    totalSteps: [
      'Pengecekan display VFD Danfoss pada control panel',
      'Simulasi drop pressure pipa header',
      'Pengecekan cascade staging pompa 1, 2, dan 3',
      'Inspeksi mechanical seal pompa dari kebocoran tetesan air'
    ],
    sparePartsUsed: []
  }
];

export const INITIAL_SCHEDULES: MaintenanceSchedule[] = [
  {
    id: 'sch-01',
    scheduleCode: 'SCH-PM-MEC01',
    title: 'Inspeksi & Pelumasan Bulanan Centrifugal Chiller',
    assetId: 'ast-01',
    assetName: 'Centrifugal Water-Cooled Chiller #01 (500 TR)',
    assetTag: 'MEP-MEC-CHL01',
    category: 'Mechanical',
    frequency: 'Bulanan',
    lastRunDate: '2026-08-10',
    nextDueDate: '2026-09-10',
    assignedType: 'vendor',
    vendorId: 'vnd-01',
    vendorName: 'PT Daikin Airconditioning Indonesia',
    checklistItems: [
      'Pemeriksaan level dan keasaman oli kompresor',
      'Pengecekan log data temperatur refrigerant dan approach temperature',
      'Pemeriksaan kebocoran freon R-134a dengan electronic leak detector',
      'Pengujian sensor proteksi high/low pressure switch'
    ],
    estimatedDuration: '4 Jam',
    status: 'Aktif'
  },
  {
    id: 'sch-02',
    scheduleCode: 'SCH-PM-ELC01',
    title: 'Preventive Maintenance & Warming Up Mingguan Genset',
    assetId: 'ast-03',
    assetName: 'Emergency Diesel Generator Cummins 1500 kVA',
    assetTag: 'MEP-ELC-GNS01',
    category: 'Electrical',
    frequency: 'Mingguan',
    lastRunDate: '2026-08-18',
    nextDueDate: '2026-08-25',
    assignedType: 'internal',
    assignedToId: 'usr-tek-02',
    assignedToName: 'Dedi Kurniawan',
    checklistItems: [
      'Cek level bahan bakar solar & tangki harian',
      'Cek voltase baterai starter (minimal 24.8 VDC)',
      'Running tanpa beban selama 15 menit',
      'Cek tekanan oli mesin dan temperatur coolant'
    ],
    estimatedDuration: '2 Jam',
    status: 'Aktif'
  },
  {
    id: 'sch-03',
    scheduleCode: 'SCH-PM-PLM01',
    title: 'Audit Biologi & Pengurasan Sludge STP Bioreactor',
    assetId: 'ast-06',
    assetName: 'Sewage Treatment Plant (STP) Extended Aeration',
    assetTag: 'MEP-PLM-STP01',
    category: 'Plumbing',
    frequency: 'Bulanan',
    lastRunDate: '2026-07-24',
    nextDueDate: '2026-08-24',
    assignedType: 'internal',
    assignedToId: 'usr-tek-03',
    assignedToName: 'Hendra Saputra',
    checklistItems: [
      'Uji parameter COD, BOD, TSS, dan pH air olahan',
      'Pengecekan dissolved oxygen (DO) meter di kolam aerasi',
      'Pembersihan bar screen manual dari sampah padat',
      'Pengukuran ketebalan lumpur di clarifier tank'
    ],
    estimatedDuration: '5 Jam',
    status: 'Aktif'
  },
  {
    id: 'sch-04',
    scheduleCode: 'SCH-PM-ELC02',
    title: 'Thermal Infrared Scanning Panel Distribusi (MDP & SDP)',
    assetId: 'ast-04',
    assetName: 'Main Distribution Panel (MDP) Gedung Utama',
    assetTag: 'MEP-ELC-MDP01',
    category: 'Electrical',
    frequency: 'Triwulan',
    lastRunDate: '2026-07-22',
    nextDueDate: '2026-10-22',
    assignedType: 'internal',
    assignedToId: 'usr-tek-02',
    assignedToName: 'Dedi Kurniawan',
    checklistItems: [
      'Pemindaian termal busbar joint, kabel incoming, dan MCCB outgoing',
      'Pencatatan titik panas (hotspot) delta T > 10°C di atas ambient',
      'Pengencangan baut terminal kabel yang longgar',
      'Pembersihan ruang cubicle panel dari debu statis'
    ],
    estimatedDuration: '6 Jam',
    status: 'Aktif'
  },
  {
    id: 'sch-05',
    scheduleCode: 'SCH-PM-MEC02',
    title: 'Inspeksi Aliran & Auto-Start Pompa Pemadam Kebakaran',
    assetId: 'ast-07',
    assetName: 'Main Electric Fire Hydrant Pump',
    assetTag: 'MEP-MEC-FHP01',
    category: 'Mechanical',
    frequency: 'Bulanan',
    lastRunDate: '2026-08-05',
    nextDueDate: '2026-09-05',
    assignedType: 'vendor',
    vendorId: 'vnd-02',
    vendorName: 'PT Total Fire Protection MEP',
    checklistItems: [
      'Uji penurunan tekanan pipa simulasi jockey pump auto start',
      'Uji start electric pump pada tekanan cut-in 8 Bar',
      'Inspeksi relief valve dan packing gland leakage',
      'Uji alarm flow switch ke Main Fire Alarm Panel (MCFA)'
    ],
    estimatedDuration: '3 Jam',
    status: 'Aktif'
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  {
    id: 'prt-01',
    sku: 'PRT-MEC-BLT68',
    name: 'V-Belt Optibelt Red Power B-68 (AHU Drive)',
    category: 'Mechanical',
    stock: 4,
    minThreshold: 8, // CRITICAL: below minThreshold!
    unit: 'Pcs',
    unitCost: 185000,
    locationRack: 'Rak M-02 (Seksi Belt & Transmisi)',
    compatibleAssets: ['Air Handling Unit (AHU) Lantai 12', 'AHU Lantai 5-10'],
    supplier: 'PT Bando Transmisi Mandiri',
    lastRestocked: '2026-06-10'
  },
  {
    id: 'prt-02',
    sku: 'PRT-MEC-GSK02',
    name: 'Gasket Neoprene End Cover Chiller 500TR',
    category: 'Mechanical',
    stock: 6,
    minThreshold: 4,
    unit: 'Set',
    unitCost: 750000,
    locationRack: 'Rak M-05 (Seal & Gaskets)',
    compatibleAssets: ['Centrifugal Water-Cooled Chiller #01 (500 TR)'],
    supplier: 'PT Daikin Airconditioning Indonesia',
    lastRestocked: '2026-07-15'
  },
  {
    id: 'prt-03',
    sku: 'PRT-ELC-FLT01',
    name: 'Filter Solar Cummins Fleetguard FS1006',
    category: 'Electrical',
    stock: 3,
    minThreshold: 6, // CRITICAL
    unit: 'Pcs',
    unitCost: 420000,
    locationRack: 'Rak E-01 (Consumables Genset)',
    compatibleAssets: ['Emergency Diesel Generator Cummins 1500 kVA'],
    supplier: 'PT Altrak 1978 Power Division',
    lastRestocked: '2026-05-20'
  },
  {
    id: 'prt-04',
    sku: 'PRT-PLM-BRG63',
    name: 'Deep Groove Ball Bearing SKF 6312-2Z',
    category: 'Plumbing',
    stock: 2,
    minThreshold: 5, // CRITICAL
    unit: 'Pcs',
    unitCost: 680000,
    locationRack: 'Rak P-03 (Bearings & Rotating)',
    compatibleAssets: ['Sewage Treatment Plant (STP) Extended Aeration', 'Hydrophore Booster Pump System'],
    supplier: 'PT SKF Bearing Indonesia',
    lastRestocked: '2026-04-12'
  },
  {
    id: 'prt-05',
    sku: 'PRT-ELC-MCB32',
    name: 'Miniature Circuit Breaker (MCB) Schneider iC60N 3P 32A C-Curve',
    category: 'Electrical',
    stock: 14,
    minThreshold: 5,
    unit: 'Pcs',
    unitCost: 310000,
    locationRack: 'Rak E-04 (Proteksi & Switchgear)',
    compatibleAssets: ['Main Distribution Panel (MDP) Gedung Utama', 'Sub Distribution Panels'],
    supplier: 'PT Schneider Electric Partner ID',
    lastRestocked: '2026-08-01'
  },
  {
    id: 'prt-06',
    sku: 'PRT-PLM-VLV04',
    name: 'Gate Valve Cast Iron Flanged 4 Inch Class 150',
    category: 'Plumbing',
    stock: 5,
    minThreshold: 3,
    unit: 'Unit',
    unitCost: 1450000,
    locationRack: 'Rak P-01 (Valves & Piping)',
    compatibleAssets: ['Hydrophore Booster Pump System', 'Main Electric Fire Hydrant Pump'],
    supplier: 'PT Kitz Valve Nusantara',
    lastRestocked: '2026-07-28'
  },
  {
    id: 'prt-07',
    sku: 'PRT-MEC-FLT08',
    name: 'Primary Pre-Filter AHU Washable 24x24x2 Inch MERV 8',
    category: 'Mechanical',
    stock: 28,
    minThreshold: 15,
    unit: 'Pcs',
    unitCost: 95000,
    locationRack: 'Rak M-01 (HVAC Air Filtration)',
    compatibleAssets: ['Air Handling Unit (AHU) Lantai 12', 'AHU Central Tower'],
    supplier: 'PT AAF Clean Air Systems',
    lastRestocked: '2026-08-14'
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-01',
    name: 'PT Daikin Airconditioning Indonesia',
    contactPerson: 'Ir. Ferry Kurniawan (Service Head)',
    email: 'service.mep@daikin.co.id',
    phone: '+62 21 2964-1000',
    specialization: ['Chiller Water Cooled', 'VRV Systems', 'Air Handling Units (AHU)'],
    contractStatus: 'Aktif',
    rating: 4.9,
    address: 'Wisma Daikin Lt. 8, Jl. TB Simatupang No. 41, Jakarta Selatan',
    activeJobsCount: 2,
    contractExpiry: '2027-12-31'
  },
  {
    id: 'vnd-02',
    name: 'PT Total Fire Protection MEP',
    contactPerson: 'Gunawan Wicaksono',
    email: 'engineering@totalfire-mep.com',
    phone: '+62 21 5567-8899',
    specialization: ['Fire Hydrant & Sprinkler', 'FM-200 Clean Agent', 'NFPA Fire Pumps'],
    contractStatus: 'Aktif',
    rating: 4.8,
    address: 'Kawasan Industri Pulogadung Blok F-12, Jakarta Timur',
    activeJobsCount: 1,
    contractExpiry: '2026-11-30'
  },
  {
    id: 'vnd-03',
    name: 'PT Altrak 1978 Power Systems',
    contactPerson: 'Suryadi Pratomo',
    email: 'cummins.service@altrak1978.co.id',
    phone: '+62 21 736-2222',
    specialization: ['Cummins Diesel Genset', 'ATS/AMF Synchronization', 'Governor & Alternator'],
    contractStatus: 'Aktif',
    rating: 4.7,
    address: 'Jl. RC Veteran No. 4 Bintaro, Jakarta Selatan',
    activeJobsCount: 1,
    contractExpiry: '2027-06-30'
  },
  {
    id: 'vnd-04',
    name: 'PT Ebara Water & Wastewater Engineering',
    contactPerson: 'Maya Anggraini',
    email: 'support@ebara-indonesia.com',
    phone: '+62 21 8984-2345',
    specialization: ['STP & WTP Systems', 'Submersible Deep Well Pumps', 'Effluent Quality Testing'],
    contractStatus: 'Review',
    rating: 4.3,
    address: 'Kawasan Delta Silicon 3, Lippo Cikarang, Bekasi',
    activeJobsCount: 1,
    contractExpiry: '2026-09-30'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-08-22 14:15',
    userId: 'usr-admin-01',
    userName: 'Bambang Sudirgo, S.T.',
    userRole: 'admin',
    action: 'Pembuatan Work Order',
    entityType: 'work_order',
    entityId: 'WO-2026-0802',
    details: 'Menerbitkan WO perbaikan V-Belt AHU Lantai 12 dan menugaskan teknisi Agus Santoso.'
  },
  {
    id: 'log-02',
    timestamp: '2026-08-22 09:30',
    userId: 'usr-spv-01',
    userName: 'Rian Pratama',
    userRole: 'supervisor',
    action: 'Eskalasi Prioritas Kritis',
    entityType: 'work_order',
    entityId: 'WO-2026-0801',
    details: 'Menerbitkan WO Kritis untuk perbaikan Blower STP dan menugaskan Hendra Saputra.'
  },
  {
    id: 'log-03',
    timestamp: '2026-08-21 13:00',
    userId: 'usr-spv-01',
    userName: 'Rian Pratama',
    userRole: 'supervisor',
    action: 'Approval Work Order',
    entityType: 'work_order',
    entityId: 'WO-2026-0803',
    details: 'Menyetujui penyelesaian uji beban ATS Genset Cummins 1500 kVA.'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-01',
    title: 'Peringatan Stok Kritis!',
    message: '3 suku cadang MEP berada di bawah batas minimum (V-Belt AHU, Filter Solar Genset, Bearing SKF STP).',
    type: 'critical',
    timestamp: '10 menit yang lalu',
    read: false,
    linkMenu: 'spare_parts'
  },
  {
    id: 'notif-02',
    title: 'Work Order Kritis Baru',
    message: 'WO-2026-0801 (Blower STP) sedang dalam status pengerjaan oleh Hendra Saputra.',
    type: 'warning',
    timestamp: '1 jam yang lalu',
    read: false,
    linkMenu: 'work_orders'
  },
  {
    id: 'notif-03',
    title: 'Jadwal Preventif Mendatang',
    message: 'Audit Biologi STP & Warming Up Genset dijadwalkan dalam 2 hari ke depan.',
    type: 'info',
    timestamp: '3 jam yang lalu',
    read: true,
    linkMenu: 'schedules'
  }
];
