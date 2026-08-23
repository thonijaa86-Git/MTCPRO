-- ==============================================================================
-- MAINTENANCE MANAGEMENT SYSTEM (MEP) — "MTCPRO"
-- SUPABASE COMPLETE DATABASE SCHEMA, RLS POLICIES & SEED DATA
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teknisi', 'supervisor', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE mep_category AS ENUM ('Mechanical', 'Electrical', 'Plumbing');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM ('Operasional', 'Perbaikan', 'Kritis', 'Non-Aktif');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_condition AS ENUM ('Sangat Baik', 'Baik', 'Perlu Perhatian', 'Rusak');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wo_priority AS ENUM ('Kritis', 'Tinggi', 'Medium', 'Rendah');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wo_status AS ENUM ('Open', 'Proses', 'Pending', 'Selesai', 'Disetujui');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE schedule_frequency AS ENUM ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Semester', 'Tahunan');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLES

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'teknisi',
  avatar TEXT,
  phone TEXT,
  specialization TEXT,
  department TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table (Security-Definer multi-role tracking)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category mep_category NOT NULL,
  location TEXT NOT NULL,
  status asset_status DEFAULT 'Operasional',
  condition asset_condition DEFAULT 'Baik',
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  install_date DATE DEFAULT CURRENT_DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  capacity TEXT,
  power_rating TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  specialization JSONB DEFAULT '[]'::jsonb,
  contract_status TEXT DEFAULT 'Aktif',
  rating NUMERIC(2,1) DEFAULT 4.8,
  address TEXT,
  active_jobs_count INTEGER DEFAULT 0,
  contract_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  asset_name TEXT,
  asset_tag TEXT,
  category mep_category NOT NULL,
  location TEXT,
  priority wo_priority DEFAULT 'Medium',
  status wo_status DEFAULT 'Open',
  assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  estimated_hours NUMERIC DEFAULT 4,
  actual_hours NUMERIC,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  total_steps JSONB DEFAULT '[]'::jsonb,
  spare_parts_used JSONB DEFAULT '[]'::jsonb,
  technician_notes TEXT,
  completion_proof_url TEXT
);

-- Maintenance Schedules Table
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  asset_name TEXT,
  asset_tag TEXT,
  category mep_category NOT NULL,
  frequency schedule_frequency DEFAULT 'Bulanan',
  last_run_date DATE,
  next_due_date DATE NOT NULL,
  assigned_type TEXT DEFAULT 'internal',
  assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  estimated_duration TEXT DEFAULT '3 Jam',
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spare Parts Inventory Table
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category mep_category NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 5,
  unit TEXT NOT NULL DEFAULT 'Pcs',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  location_rack TEXT,
  compatible_assets JSONB DEFAULT '[]'::jsonb,
  supplier TEXT,
  last_restocked DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Permissions Matrix Table (Controlled by Admin)
CREATE TABLE IF NOT EXISTS public.menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  menu_number TEXT NOT NULL,
  description TEXT,
  roles_allowed JSONB NOT NULL DEFAULT '{"teknisi":true,"supervisor":true,"manager":true}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT
);

-- System Notifications Table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  link_menu TEXT
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Allow read and write for authenticated & anon clients (with service role & app-level security)
CREATE POLICY "Public Read/Write Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write User Roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Work Orders" ON public.work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Schedules" ON public.maintenance_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Spare Parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Menu Permissions" ON public.menu_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Activity Logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Notifications" ON public.system_notifications FOR ALL USING (true) WITH CHECK (true);

-- 4. SEED INITIAL DATA

-- Profiles Seed
INSERT INTO public.profiles (id, name, email, role, avatar, phone, specialization, department, joined_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Bambang Sudirgo, S.T.', 'admin@mtcpro.co.id', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '+62 812-9988-7711', 'Chief MEP Engineer & Facilities Director', 'Facility Management', '2022-01-15'),
  ('22222222-2222-2222-2222-222222222222', 'Rian Pratama', 'supervisor@mtcpro.co.id', 'supervisor', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '+62 813-2233-4455', 'MEP Operations Supervisor', 'Maintenance & Operations', '2022-06-10'),
  ('33333333-3333-3333-3333-333333333333', 'Agus Santoso', 'teknisi@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '+62 856-1122-3344', 'Senior HVAC & Chiller Specialist', 'Mechanical Maintenance', '2023-03-01'),
  ('44444444-4444-4444-4444-444444444444', 'Dedi Kurniawan', 'dedi.kurniawan@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '+62 857-4455-6677', 'High Voltage & Electrical Distribution Tech', 'Electrical Maintenance', '2023-08-15'),
  ('55555555-5555-5555-5555-555555555555', 'Hendra Saputra', 'hendra.saputra@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '+62 878-3344-5566', 'Plumbing, Water Treatment & STP Specialist', 'Plumbing & Drainage', '2023-11-20'),
  ('66666666-6666-6666-6666-666666666666', 'Ir. Hendro Wijaya, M.M.', 'manager@mtcpro.co.id', 'manager', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', '+62 811-3344-5599', 'General Manager Engineering & Asset Reliability', 'Executive Management', '2021-04-01')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- Menu Permissions Seed
INSERT INTO public.menu_permissions (menu_key, label, icon_name, menu_number, description, roles_allowed)
VALUES
  ('dashboard', 'Dashboard', 'LayoutDashboard', '01', 'Ringkasan KPI, status aset, dan performa pemeliharaan sistem', '{"teknisi":true,"supervisor":true,"manager":true}'::jsonb),
  ('assets', 'Pengelolaan Aset', 'Cpu', '02', 'Inventaris mesin & peralatan Mechanical, Electrical, dan Plumbing', '{"teknisi":true,"supervisor":true,"manager":true}'::jsonb),
  ('work_orders', 'Work Order', 'ClipboardList', '03', 'Manajemen instruksi kerja, perbaikan, dan penugasan teknisi', '{"teknisi":true,"supervisor":true,"manager":true}'::jsonb),
  ('schedules', 'Maintenance Schedule', 'CalendarClock', '04', 'Jadwal pemeliharaan preventif berkala dan kalender eksekusi', '{"teknisi":true,"supervisor":true,"manager":true}'::jsonb),
  ('spare_parts', 'Pengelolaan Spare Part', 'Boxes', '05', 'Stok suku cadang MEP, ambang batas minimum, dan reorder point', '{"teknisi":true,"supervisor":true,"manager":false}'::jsonb),
  ('team', 'Team', 'Users2', '06', 'Daftar personil teknis, kompetensi, dan distribusi beban kerja', '{"teknisi":false,"supervisor":true,"manager":true}'::jsonb),
  ('reports', 'Report', 'BarChart3', '07', 'Analitik MTTR/MTBF, efisiensi energi, dan audit performa pemeliharaan', '{"teknisi":false,"supervisor":true,"manager":true}'::jsonb),
  ('vendors', 'Pengelolaan Vendor', 'Building2', '08', 'Mitra spesialis pihak ketiga, kontrak SLA, dan kontak darurat', '{"teknisi":false,"supervisor":true,"manager":true}'::jsonb)
ON CONFLICT (menu_key) DO UPDATE SET label = EXCLUDED.label, roles_allowed = EXCLUDED.roles_allowed;

-- Assets Seed
INSERT INTO public.assets (id, asset_tag, name, category, location, status, condition, manufacturer, model, serial_number, install_date, last_maintenance, next_maintenance, capacity, power_rating, notes)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MEP-MEC-CHL01', 'Centrifugal Water-Cooled Chiller #01 (500 TR)', 'Mechanical', 'Basement 2 — Central Chiller Plant', 'Operasional', 'Sangat Baik', 'Daikin Applied', 'WMC-500-E', 'DK-2023-CH500-881', '2023-02-10', '2026-08-10', '2026-09-10', '500 Tons of Refrigeration (1,758 kW)', '320 kW (380V / 3 Phase)', 'Kondensor dan evaporator rutin dibersihkan. Delta T chiller terjaga di 5.5°C.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'MEP-MEC-AHU12', 'Air Handling Unit (AHU) Lantai 12', 'Mechanical', 'Lantai 12 — Ruang AHU Sayap Barat', 'Perbaikan', 'Perlu Perhatian', 'Carrier Corp', '39HQ-080', 'CR-2022-AHU-1204', '2022-05-14', '2026-08-15', '2026-08-25', '8,500 CFM', '7.5 kW', 'V-Belt mengalami getaran mikro. Menunggu penggantian V-Belt tipe B-68.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'MEP-ELC-GNS01', 'Emergency Diesel Generator Cummins 1500 kVA', 'Electrical', 'Gedung Powerhouse — Genset Room', 'Operasional', 'Sangat Baik', 'Cummins Power Generation', 'QSK50-G4', 'CM-2021-G1500-09', '2021-11-20', '2026-08-01', '2026-09-01', '1,500 kVA / 1,200 kWe Standby', '380/220V, 50 Hz, 0.8 PF', 'Rutin warming-up mingguan tiap hari Kamis pukul 10:00 WIB. Level solar 92%.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'MEP-ELC-MDP01', 'Main Distribution Panel (MDP) Gedung Utama', 'Electrical', 'Basement 1 — Main Electrical Room', 'Operasional', 'Baik', 'Schneider Electric', 'Prisma Plus P 3200A', 'SE-2020-MDP32-11', '2020-09-15', '2026-07-22', '2026-10-22', '3200 Ampere Busbar', '400V 50Hz 3P+N+PE', 'Inspeksi Thermal Imaging (Infrared thermography) terakhir menunjukkan koneksi kabel normal.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'MEP-PLM-BST01', 'Hydrophore Booster Pump System (3x Inverter)', 'Plumbing', 'Basement 2 — Water Treatment & Pump Station', 'Operasional', 'Baik', 'Grundfos', 'Hydro MPC-E 3 CRE 20-5', 'GF-2022-PMP-552', '2022-08-11', '2026-08-18', '2026-09-18', '45 m³/jam @ Head 65 meter', '3 x 5.5 kW VFD Control', 'Menyuplai air bersih untuk zona tengah lantai 8 s.d 20. Tekanan konstan di 5.2 Bar.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'MEP-PLM-STP01', 'Sewage Treatment Plant (STP) Extended Aeration', 'Plumbing', 'External Ground Yard — Sub-Basement Area', 'Kritis', 'Rusak', 'Ebara Environmental', 'EA-BioZone-200', 'EB-2021-STP-03', '2021-04-18', '2026-08-19', '2026-08-24', '200 m³/hari Pengolahan Limbah', 'Blower Aerasi 15 kW + Pompa Submersible 5.5 kW', 'Blower Aerasi Line B macet/overheat. Perlu penggantian bearing motor segera.')
ON CONFLICT (asset_tag) DO NOTHING;

-- Vendors Seed
INSERT INTO public.vendors (id, name, contact_person, email, phone, specialization, contract_status, rating, address, active_jobs_count, contract_expiry)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'PT Daikin Airconditioning Indonesia', 'Ir. Ferry Kurniawan (Service Head)', 'service.mep@daikin.co.id', '+62 21 2964-1000', '["Chiller Water Cooled", "VRV Systems", "Air Handling Units (AHU)"]'::jsonb, 'Aktif', 4.9, 'Wisma Daikin Lt. 8, Jl. TB Simatupang No. 41, Jakarta Selatan', 2, '2027-12-31'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'PT Total Fire Protection MEP', 'Gunawan Wicaksono', 'engineering@totalfire-mep.com', '+62 21 5567-8899', '["Fire Hydrant & Sprinkler", "FM-200 Clean Agent", "NFPA Fire Pumps"]'::jsonb, 'Aktif', 4.8, 'Kawasan Industri Pulogadung Blok F-12, Jakarta Timur', 1, '2026-11-30'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'PT Altrak 1978 Power Systems', 'Suryadi Pratomo', 'cummins.service@altrak1978.co.id', '+62 21 736-2222', '["Cummins Diesel Genset", "ATS/AMF Synchronization", "Governor & Alternator"]'::jsonb, 'Aktif', 4.7, 'Jl. RC Veteran No. 4 Bintaro, Jakarta Selatan', 1, '2027-06-30'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'PT Ebara Water & Wastewater Engineering', 'Maya Anggraini', 'support@ebara-indonesia.com', '+62 21 8984-2345', '["STP & WTP Systems", "Submersible Deep Well Pumps", "Effluent Quality Testing"]'::jsonb, 'Review', 4.3, 'Kawasan Delta Silicon 3, Lippo Cikarang, Bekasi', 1, '2026-09-30')
ON CONFLICT (id) DO NOTHING;

-- Spare Parts Seed
INSERT INTO public.spare_parts (id, sku, name, category, stock, min_threshold, unit, unit_cost, location_rack, compatible_assets, supplier, last_restocked)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'PRT-MEC-BLT68', 'V-Belt Optibelt Red Power B-68 (AHU Drive)', 'Mechanical', 4, 8, 'Pcs', 185000, 'Rak M-02 (Seksi Belt & Transmisi)', '["Air Handling Unit (AHU) Lantai 12", "AHU Lantai 5-10"]'::jsonb, 'PT Bando Transmisi Mandiri', '2026-06-10'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'PRT-MEC-GSK02', 'Gasket Neoprene End Cover Chiller 500TR', 'Mechanical', 6, 4, 'Set', 750000, 'Rak M-05 (Seal & Gaskets)', '["Centrifugal Water-Cooled Chiller #01 (500 TR)"]'::jsonb, 'PT Daikin Airconditioning Indonesia', '2026-07-15'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'PRT-ELC-FLT01', 'Filter Solar Cummins Fleetguard FS1006', 'Electrical', 3, 6, 'Pcs', 420000, 'Rak E-01 (Consumables Genset)', '["Emergency Diesel Generator Cummins 1500 kVA"]'::jsonb, 'PT Altrak 1978 Power Division', '2026-05-20'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'PRT-PLM-BRG63', 'Deep Groove Ball Bearing SKF 6312-2Z', 'Plumbing', 2, 5, 'Pcs', 680000, 'Rak P-03 (Bearings & Rotating)', '["Sewage Treatment Plant (STP) Extended Aeration", "Hydrophore Booster Pump System"]'::jsonb, 'PT SKF Bearing Indonesia', '2026-04-12'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc5', 'PRT-ELC-MCB32', 'Miniature Circuit Breaker (MCB) Schneider iC60N 3P 32A C-Curve', 'Electrical', 14, 5, 'Pcs', 310000, 'Rak E-04 (Proteksi & Switchgear)', '["Main Distribution Panel (MDP) Gedung Utama", "Sub Distribution Panels"]'::jsonb, 'PT Schneider Electric Partner ID', '2026-08-01')
ON CONFLICT (sku) DO NOTHING;

-- Work Orders Seed
INSERT INTO public.work_orders (id, wo_number, title, description, asset_id, asset_name, asset_tag, category, location, priority, status, assigned_to_id, assigned_to_name, created_by_id, created_by_name, created_at, due_date, estimated_hours, actual_hours, steps_completed, total_steps, spare_parts_used, technician_notes)
VALUES
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'WO-2026-0801', 'Perbaikan Blower Aerasi Line B Macet pada STP', 'Blower aerasi mengeluarkan getaran abnormal dan tripped saat beban puncak. Lakukan pembongkaran casing blower dan penggantian deep groove ball bearing serta pengisian ulang synthetic grease.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Sewage Treatment Plant (STP) Extended Aeration', 'MEP-PLM-STP01', 'Plumbing', 'External Ground Yard — Sub-Basement Area', 'Kritis', 'Proses', '55555555-5555-5555-5555-555555555555', 'Hendra Saputra', '22222222-2222-2222-2222-222222222222', 'Rian Pratama', NOW() - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 6, 3.5, '["Lockout Tagout (LOTO) breaker power supply blower", "Pembongkaran pulley dan housing blower", "Inspeksi shaft rotor dan pengukuran clearance"]'::jsonb, '["Lockout Tagout (LOTO) breaker power supply blower", "Pembongkaran pulley dan housing blower", "Inspeksi shaft rotor dan pengukuran clearance", "Pemasangan bearing baru SKF 6312-2Z", "Penyetelan alignment pulley dan tension belt", "Uji coba running test 30 menit & pengukuran arus"]'::jsonb, '[{"partId": "cccccccc-cccc-cccc-cccc-ccccccccccc4", "partName": "Deep Groove Ball Bearing SKF 6312-2Z", "quantity": 2, "sku": "PRT-PLM-BRG63"}]'::jsonb, 'Bearing lama aus dan pecah seal. Shaft rotor sudah dibersihkan dan siap pasang bearing baru.'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'WO-2026-0802', 'Penggantian V-Belt dan Penyetelan Alignment AHU Lt 12', 'V-belt transmisi motor AHU lantai 12 mengalami keretakan mikro dan kelonggaran sehingga debit udara berkurang ke koridor barat.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Air Handling Unit (AHU) Lantai 12', 'MEP-MEC-AHU12', 'Mechanical', 'Lantai 12 — Ruang AHU Sayap Barat', 'Tinggi', 'Open', '33333333-3333-3333-3333-333333333333', 'Agus Santoso', '11111111-1111-1111-1111-111111111111', 'Bambang Sudirgo, S.T.', NOW() - INTERVAL '12 hours', CURRENT_DATE + INTERVAL '2 days', 3, NULL, '[]'::jsonb, '["Isolasi panel kelistrikan AHU-12", "Pelepasan V-Belt lama yang aus", "Pembersihan groove pulley dari debu & minyak", "Pemasangan set V-Belt Optibelt B-68 (3 pcs)", "Laser alignment dan pengukuran tegangan belt", "Pengecekan flow udara dan balancing motor"]'::jsonb, '[]'::jsonb, NULL),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'WO-2026-0803', 'Uji Beban & Kalibrasi ATS Genset Cummins 1500 kVA', 'Pelaksanaan simulasi blackout PLN untuk verifikasi sinkronisasi Automatic Transfer Switch (ATS) dan waktu transisi genset di bawah 10 detik.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Emergency Diesel Generator Cummins 1500 kVA', 'MEP-ELC-GNS01', 'Electrical', 'Gedung Powerhouse — Genset Room', 'Medium', 'Disetujui', '44444444-4444-4444-4444-444444444444', 'Dedi Kurniawan', '22222222-2222-2222-2222-222222222222', 'Rian Pratama', NOW() - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 4, 3.5, '["Pemeriksaan level oli, air radiator, dan baterai aki genset", "Koordinasi dengan security dan tenant via pengumuman PA system", "Simulasi pemutusan incoming PLN breaker", "Pencatatan waktu start genset hingga load switch (Hasil: 7.2 detik)", "Running load test 30 menit pada beban 650 kW", "Sinkronisasi kembali ke PLN grid secara mulus"]'::jsonb, '["Pemeriksaan level oli, air radiator, dan baterai aki genset", "Koordinasi dengan security dan tenant via pengumuman PA system", "Simulasi pemutusan incoming PLN breaker", "Pencatatan waktu start genset hingga load switch (Hasil: 7.2 detik)", "Running load test 30 menit pada beban 650 kW", "Sinkronisasi kembali ke PLN grid secara mulus"]'::jsonb, '[{"partId": "cccccccc-cccc-cccc-cccc-ccccccccccc3", "partName": "Filter Solar Cummins Fleetguard FS1006", "quantity": 2, "sku": "PRT-ELC-FLT01"}]'::jsonb, 'ATS beroperasi prima. Transisi load berhasil dalam 7.2 detik. Disetujui oleh Supervisor Rian Pratama.')
ON CONFLICT (wo_number) DO NOTHING;

-- Maintenance Schedules Seed
INSERT INTO public.maintenance_schedules (id, schedule_code, title, asset_id, asset_name, asset_tag, category, frequency, last_run_date, next_due_date, assigned_type, assigned_to_id, assigned_to_name, vendor_id, vendor_name, checklist_items, estimated_duration, status)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'SCH-PM-MEC01', 'Inspeksi & Pelumasan Bulanan Centrifugal Chiller', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Centrifugal Water-Cooled Chiller #01 (500 TR)', 'MEP-MEC-CHL01', 'Mechanical', 'Bulanan', '2026-08-10', '2026-09-10', 'vendor', NULL, NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'PT Daikin Airconditioning Indonesia', '["Pemeriksaan level dan keasaman oli kompresor", "Pengecekan log data temperatur refrigerant", "Pemeriksaan kebocoran freon R-134a", "Pengujian sensor proteksi high/low pressure switch"]'::jsonb, '4 Jam', 'Aktif'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'SCH-PM-ELC01', 'Preventive Maintenance & Warming Up Mingguan Genset', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Emergency Diesel Generator Cummins 1500 kVA', 'MEP-ELC-GNS01', 'Electrical', 'Mingguan', '2026-08-18', '2026-08-25', 'internal', '44444444-4444-4444-4444-444444444444', 'Dedi Kurniawan', NULL, NULL, '["Cek level bahan bakar solar & tangki harian", "Cek voltase baterai starter (minimal 24.8 VDC)", "Running tanpa beban selama 15 menit", "Cek tekanan oli mesin dan temperatur coolant"]'::jsonb, '2 Jam', 'Aktif')
ON CONFLICT (schedule_code) DO NOTHING;
