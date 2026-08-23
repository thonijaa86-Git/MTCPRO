import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

export const supabaseService = {
  // Profiles
  async getProfiles(): Promise<UserProfile[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      if (error || !data) return null;
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        avatar: p.avatar,
        phone: p.phone,
        specialization: p.specialization,
        department: p.department,
        joinedDate: p.joined_date
      }));
    } catch {
      return null;
    }
  },

  // Assets
  async getAssets(): Promise<Asset[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((a) => ({
        id: a.id,
        assetTag: a.asset_tag,
        name: a.name,
        category: a.category,
        location: a.location,
        status: a.status,
        condition: a.condition,
        manufacturer: a.manufacturer,
        model: a.model,
        serialNumber: a.serial_number,
        installDate: a.install_date,
        lastMaintenance: a.last_maintenance,
        nextMaintenance: a.next_maintenance,
        capacity: a.capacity,
        powerRating: a.power_rating,
        notes: a.notes
      }));
    } catch {
      return null;
    }
  },

  async insertAsset(asset: Omit<Asset, 'id'>) {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('assets').insert([{
        asset_tag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        status: asset.status,
        condition: asset.condition,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serial_number: asset.serialNumber,
        install_date: asset.installDate,
        last_maintenance: asset.lastMaintenance,
        next_maintenance: asset.nextMaintenance,
        capacity: asset.capacity,
        power_rating: asset.powerRating,
        notes: asset.notes
      }]).select().single();
      return data;
    } catch {
      return null;
    }
  },

  // Work Orders
  async getWorkOrders(): Promise<WorkOrder[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((w) => ({
        id: w.id,
        woNumber: w.wo_number,
        title: w.title,
        description: w.description,
        assetId: w.asset_id,
        assetName: w.asset_name,
        assetTag: w.asset_tag,
        category: w.category,
        location: w.location,
        priority: w.priority,
        status: w.status,
        assignedToId: w.assigned_to_id,
        assignedToName: w.assigned_to_name,
        createdById: w.created_by_id,
        createdByName: w.created_by_name,
        createdAt: w.created_at,
        dueDate: w.due_date,
        completedAt: w.completed_at,
        approvedById: w.approved_by_id,
        approvedByName: w.approved_by_name,
        approvedAt: w.approved_at,
        estimatedHours: Number(w.estimated_hours),
        actualHours: w.actual_hours ? Number(w.actual_hours) : undefined,
        stepsCompleted: w.steps_completed || [],
        totalSteps: w.total_steps || [],
        sparePartsUsed: w.spare_parts_used || [],
        technicianNotes: w.technician_notes,
        completionProofUrl: w.completion_proof_url
      }));
    } catch {
      return null;
    }
  },

  // Maintenance Schedules
  async getSchedules(): Promise<MaintenanceSchedule[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('maintenance_schedules').select('*').order('next_due_date', { ascending: true });
      if (error || !data) return null;
      return data.map((s) => ({
        id: s.id,
        scheduleCode: s.schedule_code,
        title: s.title,
        assetId: s.asset_id,
        assetName: s.asset_name,
        assetTag: s.asset_tag,
        category: s.category,
        frequency: s.frequency,
        lastRunDate: s.last_run_date,
        nextDueDate: s.next_due_date,
        assignedType: s.assigned_type,
        assignedToId: s.assigned_to_id,
        assignedToName: s.assigned_to_name,
        vendorId: s.vendor_id,
        vendorName: s.vendor_name,
        checklistItems: s.checklist_items || [],
        estimatedDuration: s.estimated_duration,
        status: s.status
      }));
    } catch {
      return null;
    }
  },

  // Spare Parts
  async getSpareParts(): Promise<SparePart[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('spare_parts').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.stock,
        minThreshold: p.min_threshold,
        unit: p.unit,
        unitCost: Number(p.unit_cost),
        locationRack: p.location_rack,
        compatibleAssets: p.compatible_assets || [],
        supplier: p.supplier,
        lastRestocked: p.last_restocked
      }));
    } catch {
      return null;
    }
  },

  // Vendors
  async getVendors(): Promise<Vendor[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map((v) => ({
        id: v.id,
        name: v.name,
        contactPerson: v.contact_person,
        email: v.email,
        phone: v.phone,
        specialization: v.specialization || [],
        contractStatus: v.contract_status,
        rating: Number(v.rating),
        address: v.address,
        activeJobsCount: v.active_jobs_count || 0,
        contractExpiry: v.contract_expiry
      }));
    } catch {
      return null;
    }
  },

  // Menu Permissions
  async getMenuPermissions(): Promise<MenuPermission[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('menu_permissions').select('*').order('menu_number', { ascending: true });
      if (error || !data) return null;
      return data.map((m) => ({
        menuKey: m.menu_key,
        label: m.label,
        iconName: m.icon_name,
        menuNumber: m.menu_number,
        description: m.description,
        rolesAllowed: m.roles_allowed
      }));
    } catch {
      return null;
    }
  },

  async updateMenuPermissionInDb(menuKey: string, rolesAllowed: any) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('menu_permissions').update({ roles_allowed: rolesAllowed, updated_at: new Date().toISOString() }).eq('menu_key', menuKey);
    } catch {
      // ignore
    }
  }
};
