-- ==============================================================================
-- MAINTENANCE MANAGEMENT SYSTEM (MEP) — "MTCPRO"
-- SUPABASE UNIFIED DATABASE SCHEMA (MATCHING ALL APP TABLES & FORMS)
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teknisi', 'supervisor', 'manager');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. CREATE TABLES (CLEAN SCHEMA MATCHING APP MENUS EXACTLY)

-- Table 1: Profiles / Team (Menu: Team & Admin Controller Database User)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  phone TEXT,
  company TEXT DEFAULT 'PT DAHANA (Persero)',
  position TEXT DEFAULT 'MEP Specialist',
  role user_role NOT NULL DEFAULT 'teknisi',
  status TEXT DEFAULT 'Aktif',
  avatar TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration support for existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Table 2: User Roles (Security-Definer multi-role tracking)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Table 3: Assets (Menu: Pengelolaan Aset)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  specification TEXT,
  manufacture_year TEXT,
  install_year TEXT,
  status TEXT DEFAULT 'Operasional',
  condition TEXT DEFAULT 'Baik',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Perusahaan / Vendors (Menu: Perusahaan)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  specialization JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(2,1) DEFAULT 4.8,
  contract_status TEXT DEFAULT 'Aktif',
  contract_expiry DATE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: Work Orders (Menu: Work Order)
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number TEXT UNIQUE NOT NULL,
  wo_date DATE DEFAULT CURRENT_DATE,
  asset_name TEXT NOT NULL,
  asset_id TEXT,
  location TEXT,
  wo_category TEXT DEFAULT 'Corrective',
  job_type TEXT DEFAULT 'Mechanical',
  start_date DATE,
  end_date DATE,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  assigned_to_name TEXT,
  assigned_to_id TEXT,
  supervisor_name TEXT,
  supervisor_id TEXT,
  vendor_name TEXT,
  description TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  technician_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration support for work_orders table columns
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS supervisor_name TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS supervisor_id TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS wo_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS wo_category TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Table 6: Maintenance Schedules (Menu: Maintenance Schedule)
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  asset_name TEXT,
  asset_id TEXT,
  category TEXT,
  frequency TEXT DEFAULT 'Bulanan',
  next_due_date DATE NOT NULL,
  assigned_type TEXT DEFAULT 'internal',
  assigned_to_name TEXT,
  assigned_to_id TEXT,
  vendor_name TEXT,
  vendor_id TEXT,
  estimated_duration TEXT,
  status TEXT DEFAULT 'Aktif',
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: Spare Parts (Menu: Pengelolaan Spare Part)
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 5,
  unit TEXT NOT NULL DEFAULT 'Pcs',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  location_rack TEXT,
  supplier TEXT,
  compatible_assets JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: Menu Permissions Matrix (Menu: Pengaturan Akses Menu - Tab 1)
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

-- Table 9: User Menu Permissions (Menu: Pengaturan Akses Menu - Tab 2)
CREATE TABLE IF NOT EXISTS public.user_menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  custom_menu_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table 10: Activity Logs
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

-- Table 11: System Notifications
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  link_menu TEXT
);

-- ==============================================================================
-- 3. CLEANUP & MIGRATION SCRIPT (HAPUS KOLOM LAMA YANG TIDAK ADA DI MENU APLIKASI)
-- Jalankan blok query ini di Supabase SQL Editor untuk menyamakan tabel yang sudah ada
-- ==============================================================================

-- 3.1. Bersihkan Kolom Lama di Tabel 'assets'
ALTER TABLE public.assets DROP COLUMN IF EXISTS manufacturer;
ALTER TABLE public.assets DROP COLUMN IF EXISTS model;
ALTER TABLE public.assets DROP COLUMN IF EXISTS serial_number;
ALTER TABLE public.assets DROP COLUMN IF EXISTS install_date;
ALTER TABLE public.assets DROP COLUMN IF EXISTS last_maintenance;
ALTER TABLE public.assets DROP COLUMN IF EXISTS next_maintenance;
ALTER TABLE public.assets DROP COLUMN IF EXISTS capacity;
ALTER TABLE public.assets DROP COLUMN IF EXISTS power_rating;
ALTER TABLE public.assets ALTER COLUMN category TYPE TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS specification TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS manufacture_year TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS install_year TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3.2. Bersihkan Kolom Lama di Tabel 'profiles'
ALTER TABLE public.profiles DROP COLUMN IF EXISTS specialization;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS department;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'PT DAHANA (Persero)';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'MEP Specialist';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Aktif';

-- 3.3. Bersihkan Kolom Lama di Tabel 'vendors'
ALTER TABLE public.vendors DROP COLUMN IF EXISTS active_jobs_count;

-- 3.4. Bersihkan Kolom Lama di Tabel 'work_orders'
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS estimated_hours;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS actual_hours;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS steps_completed;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS total_steps;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS spare_parts_used;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS completion_proof_url;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS due_date;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS asset_tag;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS created_by_id;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS created_by_name;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS approved_by_id;
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS approved_by_name;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS wo_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS wo_category TEXT DEFAULT 'Corrective';
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Mechanical';
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS supervisor_name TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS supervisor_id TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- 3.5. Bersihkan Kolom Lama di Tabel 'maintenance_schedules'
ALTER TABLE public.maintenance_schedules DROP COLUMN IF EXISTS last_run_date;
ALTER TABLE public.maintenance_schedules DROP COLUMN IF EXISTS asset_tag;
ALTER TABLE public.maintenance_schedules DROP COLUMN IF EXISTS checklist_items;
ALTER TABLE public.maintenance_schedules ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.maintenance_schedules ALTER COLUMN frequency TYPE TEXT;
ALTER TABLE public.maintenance_schedules ALTER COLUMN category TYPE TEXT;

-- 3.6. Bersihkan Kolom Lama di Tabel 'spare_parts'
ALTER TABLE public.spare_parts DROP COLUMN IF EXISTS last_restocked;
ALTER TABLE public.spare_parts ALTER COLUMN category TYPE TEXT;

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public Read/Write Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write User Roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Work Orders" ON public.work_orders FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Schedules" ON public.maintenance_schedules FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Spare Parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Menu Permissions" ON public.menu_permissions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write User Menu Permissions" ON public.user_menu_permissions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Activity Logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public Read/Write Notifications" ON public.system_notifications FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 5. INITIAL DATA SEED (MENYESUAIKAN TAMPILAN APLIKASI TERBARU)
-- ==============================================================================

-- Profiles Seed
INSERT INTO public.profiles (id, name, email, role, avatar, phone, company, position, joined_date, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Bambang Sudirgo, S.T.', 'admin@mtcpro.co.id', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '+62 812-9988-7711', 'PT DAHANA (Persero)', 'Chief MEP Engineer & Facilities Director', '2022-01-15', 'Aktif'),
  ('22222222-2222-2222-2222-222222222222', 'Rian Pratama', 'supervisor@mtcpro.co.id', 'supervisor', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', '+62 813-2233-4455', 'PT DAHANA (Persero)', 'MEP Operations Supervisor', '2022-06-10', 'Aktif'),
  ('33333333-3333-3333-3333-333333333333', 'Agus Santoso', 'teknisi@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '+62 856-1122-3344', 'PT DAHANA (Persero)', 'Senior HVAC & Chiller Specialist', '2023-03-01', 'Aktif'),
  ('44444444-4444-4444-4444-444444444444', 'Dedi Kurniawan', 'dedi.kurniawan@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '+62 857-4455-6677', 'PT DAHANA (Persero)', 'High Voltage & Electrical Distribution Tech', '2023-08-15', 'Aktif'),
  ('55555555-5555-5555-5555-555555555555', 'Hendra Saputra', 'hendra.saputra@mtcpro.co.id', 'teknisi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '+62 878-3344-5566', 'PT DAHANA (Persero)', 'Plumbing, Water Treatment & STP Specialist', '2023-11-20', 'Aktif'),
  ('66666666-6666-6666-6666-666666666666', 'Ir. Hendro Wijaya, M.M.', 'manager@mtcpro.co.id', 'manager', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', '+62 811-3344-5599', 'PT DAHANA (Persero)', 'General Manager Engineering & Asset Reliability', '2021-04-01', 'Aktif')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, company = EXCLUDED.company, position = EXCLUDED.position;

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
  ('vendors', 'Perusahaan', 'Building2', '08', 'Mitra spesialis pihak ketiga, perusahaan internal, dan kontak darurat', '{"teknisi":false,"supervisor":true,"manager":true}'::jsonb)
ON CONFLICT (menu_key) DO UPDATE SET label = EXCLUDED.label, roles_allowed = EXCLUDED.roles_allowed;
