import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  SystemNotification
} from '../types';

export const supabaseService = {
  // ==========================================
  // PROFILES / TEAM
  // ==========================================
  async getProfiles(): Promise<UserProfile[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      if (error || !data) {
        console.error('Error fetching profiles from Supabase:', error);
        return null;
      }

      return data
        .filter((p) => {
          const email = (p.email || '').toLowerCase().trim();
          const id = (p.id || '').toLowerCase().trim();
          return !email.endsWith('@mtcpro.co.id') && id !== 'usr-admin-01' && id !== 'usr-spv-01' && id !== 'usr-tek-01' && p.name !== 'Admin Facilities' && p.name !== 'Admin Facility MEP' && p.name !== 'Rian Pratama' && p.name !== 'Agus Santoso';
        })
        .map((p) => {
          return {
            id: p.id,
            name: p.name,
            email: p.email,
            password: p.password || '',
            role: p.role as UserRole,
            avatar: p.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
            phone: p.phone || '',
            company: p.company || p.department || 'PT DAHANA (Persero)',
            position: p.position || p.specialization || 'MEP Specialist',
            specialization: p.specialization || p.position || 'MEP Specialist',
            department: p.department || p.company || 'Maintenance & Operations',
            joinedDate: p.joined_date || (p.created_at ? p.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10)),
            status: (p.status as any) || 'Aktif'
          };
        });
    } catch (err) {
      console.error('Exception fetching profiles:', err);
      return null;
    }
  },

  async deleteDummyProfiles(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase
        .from('profiles')
        .delete()
        .or('email.ilike.%@mtcpro.co.id,id.eq.usr-admin-01,id.eq.usr-spv-01,id.eq.usr-tek-01');
    } catch (e) {
      console.warn('Delete dummy profiles failed:', e);
    }
  },

  async insertProfile(user: Omit<UserProfile, 'id'>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const targetStatus = user.status || 'Pending';
      // 1. Try inserting with all fields including password and status
      let res = await supabase.from('profiles').insert([{
        name: user.name,
        email: user.email,
        password: user.password || '',
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        position: user.position,
        specialization: user.position || user.specialization || 'MEP Specialist',
        department: user.company || user.department || 'Maintenance & Operations',
        joined_date: user.joinedDate || new Date().toISOString().substring(0, 10),
        status: targetStatus
      }]).select().single();

      // 2. If it fails (e.g. column company/position not found in schema cache), retry with status
      if (res.error) {
        console.warn('Extended profile insert failed, retrying with standard schema:', res.error.message);
        res = await supabase.from('profiles').insert([{
          name: user.name,
          email: user.email,
          password: user.password || '',
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          specialization: user.position || user.specialization || 'MEP Specialist',
          department: user.company || user.department || 'Maintenance & Operations',
          joined_date: user.joinedDate || new Date().toISOString().substring(0, 10),
          status: targetStatus
        }]).select().single();
      }

      if (res.error || !res.data) {
        console.error('Final insert profile to Supabase failed:', res.error);
        return null;
      }

      const data = res.data;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password || user.password || '',
        role: data.role,
        avatar: data.avatar,
        phone: data.phone || user.phone || '',
        company: data.company || data.department || user.company || 'PT DAHANA (Persero)',
        position: data.position || data.specialization || user.position || 'MEP Specialist',
        specialization: data.specialization || user.specialization || 'MEP Specialist',
        department: data.department || user.department || 'Maintenance & Operations',
        joinedDate: data.joined_date || user.joinedDate,
        status: (data.status as any) || targetStatus
      };
    } catch (err) {
      console.error('Exception inserting profile:', err);
      return null;
    }
  },

  async updateProfileRole(userId: string, newRole: UserRole) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) {
        console.error('Error updating user role in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception updating user role:', err);
      return false;
    }
  },

  async updateProfileStatus(userId: string, status: 'Aktif' | 'Pending' | 'Ditolak', newRole?: UserRole) {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload: any = { status };
      if (newRole) payload.role = newRole;
      const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
      if (error) {
        console.error('Error updating user status in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception updating user status:', err);
      return false;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.avatar !== undefined) payload.avatar = updates.avatar;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.company !== undefined) payload.company = updates.company;
      if (updates.position !== undefined) payload.position = updates.position;
      if (updates.specialization !== undefined) payload.specialization = updates.specialization;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.status !== undefined) payload.status = updates.status;

      const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
      if (error) {
        console.warn('Extended profile update failed, retrying with standard schema payload:', error.message);
        const standardPayload: any = {};
        if (updates.name !== undefined) standardPayload.name = updates.name;
        if (updates.email !== undefined) standardPayload.email = updates.email;
        if (updates.role !== undefined) standardPayload.role = updates.role;
        if (updates.avatar !== undefined) standardPayload.avatar = updates.avatar;
        if (updates.phone !== undefined) standardPayload.phone = updates.phone;
        if (updates.position !== undefined || updates.specialization !== undefined) {
          standardPayload.specialization = updates.position || updates.specialization;
        }
        if (updates.company !== undefined || updates.department !== undefined) {
          standardPayload.department = updates.company || updates.department;
        }
        await supabase.from('profiles').update(standardPayload).eq('id', userId);
      }
      return true;
    } catch (err) {
      console.error('Exception updating user:', err);
      return false;
    }
  },

  async deleteProfile(userId: string) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        console.error('Error deleting user profile from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception deleting user profile:', err);
      return false;
    }
  },

  async deleteBulkProfiles(userIds: string[]) {
    if (!isSupabaseConfigured() || userIds.length === 0) return false;
    try {
      const { error } = await supabase.from('profiles').delete().in('id', userIds);
      if (error) {
        console.error('Error deleting bulk profiles from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception bulk deleting profiles:', err);
      return false;
    }
  },

  // ==========================================
  // ASSETS
  // ==========================================
  async getAssets(): Promise<Asset[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        console.error('Error fetching assets from Supabase:', error);
        return null;
      }
      return data.map((a) => {
        let cat = a.category;
        let spec = a.notes || a.capacity || '';
        // Extract original detailed category if it was stored with fallback
        if (a.notes && typeof a.notes === 'string' && a.notes.startsWith('[Kategori: ')) {
          const match = a.notes.match(/^\[Kategori:\s*([^\]]+)\]\s*(.*)/);
          if (match) {
            cat = match[1];
            spec = match[2];
          }
        }
        return {
          id: a.id,
          assetTag: a.asset_tag,
          name: a.name,
          category: cat,
          location: a.location,
          specification: spec,
          manufactureYear: a.install_date ? a.install_date.substring(0, 4) : '2022',
          installYear: a.install_date ? a.install_date.substring(0, 4) : '2023',
          status: a.status || 'Operasional',
          condition: a.condition || 'Baik',
          manufacturer: a.manufacturer || '',
          model: a.model || '',
          serialNumber: a.serial_number || '',
          installDate: a.install_date,
          lastMaintenance: a.last_maintenance,
          nextMaintenance: a.next_maintenance,
          capacity: a.capacity || '',
          powerRating: a.power_rating || '',
          notes: a.notes || ''
        };
      });
    } catch (err) {
      console.error('Exception fetching assets:', err);
      return null;
    }
  },

  async insertAsset(asset: Omit<Asset, 'id'>): Promise<Asset | null> {
    if (!isSupabaseConfigured()) return null;

    // Helper to map category to valid postgres enum if needed
    const mapCategoryForEnum = (cat: string): 'Mechanical' | 'Electrical' | 'Plumbing' => {
      const c = (cat || '').toLowerCase();
      if (c.includes('listrik') || c.includes('genset') || c.includes('petir') || c.includes('cctv') || c.includes('alarm') || c.includes('audio') || c.includes('electric')) {
        return 'Electrical';
      }
      if (c.includes('air') || c.includes('hydrant') || c.includes('ipal') || c.includes('plumb')) {
        return 'Plumbing';
      }
      return 'Mechanical';
    };

    // Strategy 1: Full payload with native category
    try {
      const fullPayload = {
        asset_tag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        status: asset.status || 'Operasional',
        condition: asset.condition || 'Baik',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serial_number: asset.serialNumber || '',
        install_date: asset.installYear ? `${asset.installYear}-01-01` : (asset.installDate || new Date().toISOString().substring(0, 10)),
        last_maintenance: asset.lastMaintenance || new Date().toISOString().substring(0, 10),
        next_maintenance: asset.nextMaintenance || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        capacity: asset.specification || asset.capacity || '',
        power_rating: asset.powerRating || '',
        notes: asset.specification ? `[Kategori: ${asset.category}] ${asset.specification}` : (asset.notes || `[Kategori: ${asset.category}]`)
      };

      const { data, error } = await supabase.from('assets').insert([fullPayload]).select().single();

      if (!error && data) {
        return {
          id: data.id,
          assetTag: data.asset_tag,
          name: data.name,
          category: asset.category,
          location: data.location,
          specification: asset.specification || data.capacity || '',
          manufactureYear: asset.manufactureYear || '2022',
          installYear: asset.installYear || '2023',
          status: data.status,
          condition: data.condition,
          manufacturer: data.manufacturer,
          model: data.model,
          serialNumber: data.serial_number,
          installDate: data.install_date,
          lastMaintenance: data.last_maintenance,
          nextMaintenance: data.next_maintenance,
          capacity: data.capacity,
          powerRating: data.power_rating,
          notes: data.notes
        };
      }
      console.warn('Strategy 1 insertAsset error, attempting Strategy 2 with enum mapping...', error?.message);
    } catch (err) {
      console.warn('Exception during Strategy 1 insertAsset:', err);
    }

    // Strategy 2: Mapped category enum (for legacy enum mep_category constraint)
    try {
      const legacyCat = mapCategoryForEnum(asset.category);
      const fallbackPayload = {
        asset_tag: asset.assetTag,
        name: asset.name,
        category: legacyCat,
        location: asset.location,
        status: asset.status || 'Operasional',
        condition: asset.condition || 'Baik',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serial_number: asset.serialNumber || '',
        install_date: asset.installYear ? `${asset.installYear}-01-01` : (asset.installDate || new Date().toISOString().substring(0, 10)),
        last_maintenance: asset.lastMaintenance || new Date().toISOString().substring(0, 10),
        next_maintenance: asset.nextMaintenance || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        capacity: asset.specification || '',
        notes: `[Kategori: ${asset.category}] ${asset.specification || asset.notes || ''}`
      };

      const { data, error } = await supabase.from('assets').insert([fallbackPayload]).select().single();

      if (!error && data) {
        return {
          id: data.id,
          assetTag: data.asset_tag,
          name: data.name,
          category: asset.category,
          location: data.location,
          specification: asset.specification || data.capacity || '',
          manufactureYear: asset.manufactureYear || '2022',
          installYear: asset.installYear || '2023',
          status: data.status,
          condition: data.condition,
          manufacturer: data.manufacturer,
          model: data.model,
          serialNumber: data.serial_number,
          installDate: data.install_date,
          lastMaintenance: data.last_maintenance,
          nextMaintenance: data.next_maintenance,
          capacity: data.capacity,
          powerRating: data.power_rating,
          notes: data.notes
        };
      }
      console.warn('Strategy 2 insertAsset error, attempting Strategy 3 minimal...', error?.message);
    } catch (err) {
      console.warn('Exception during Strategy 2 insertAsset:', err);
    }

    // Strategy 3: Minimal standard columns
    try {
      const minimalPayload = {
        asset_tag: asset.assetTag,
        name: asset.name,
        category: mapCategoryForEnum(asset.category),
        location: asset.location,
        status: asset.status || 'Operasional',
        condition: asset.condition || 'Baik',
        notes: `[Kategori: ${asset.category}] ${asset.specification || ''}`
      };

      const { data, error } = await supabase.from('assets').insert([minimalPayload]).select().single();

      if (!error && data) {
        return {
          id: data.id,
          assetTag: data.asset_tag,
          name: data.name,
          category: asset.category,
          location: data.location,
          specification: asset.specification,
          manufactureYear: asset.manufactureYear || '2022',
          installYear: asset.installYear || '2023',
          status: data.status || 'Operasional',
          condition: data.condition || 'Baik',
          notes: data.notes
        };
      }
      console.error('All insertAsset strategies failed:', error);
      return null;
    } catch (err) {
      console.error('Fatal exception in insertAsset:', err);
      return null;
    }
  },

  async updateAsset(id: string, updates: Partial<Asset>) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.condition !== undefined) payload.condition = updates.condition;
      if (updates.specification !== undefined || updates.notes !== undefined) {
        payload.notes = `[Kategori: ${updates.category || 'MEP'}] ${updates.specification || updates.notes || ''}`;
        payload.capacity = updates.specification || '';
      }
      if (updates.powerRating !== undefined) payload.power_rating = updates.powerRating;
      if (updates.nextMaintenance !== undefined) payload.next_maintenance = updates.nextMaintenance;

      await supabase.from('assets').update(payload).eq('id', id);
    } catch (err) {
      console.error('Exception updating asset:', err);
    }
  },

  async deleteAsset(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('assets').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting asset:', err);
    }
  },

  async deleteBulkAssets(ids: string[]) {
    if (!isSupabaseConfigured() || ids.length === 0) return;
    try {
      await supabase.from('assets').delete().in('id', ids);
    } catch (err) {
      console.error('Exception bulk deleting assets:', err);
    }
  },

  // ==========================================
  // WORK ORDERS
  // ==========================================
  async getWorkOrders(): Promise<WorkOrder[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        console.error('Error fetching work orders from Supabase:', error);
        return null;
      }
      return data.map((w) => ({
        id: w.id,
        woNumber: w.wo_number,
        title: w.title,
        description: w.description,
        assetId: w.asset_id || '',
        assetName: w.asset_name || '',
        assetTag: w.asset_tag || '',
        category: w.category,
        location: w.location || '',
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
    } catch (err) {
      console.error('Exception fetching work orders:', err);
      return null;
    }
  },

  async insertWorkOrder(wo: Partial<WorkOrder>): Promise<WorkOrder | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const generatedNumber = wo.woNumber || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase.from('work_orders').insert([{
        wo_number: generatedNumber,
        title: wo.title || `Work Order ${wo.assetName}`,
        description: wo.description,
        asset_name: wo.assetName,
        asset_tag: wo.assetTag || 'AST-MEP',
        category: (wo.jobType as any) || (wo.category as any) || 'Mechanical',
        location: wo.location,
        priority: wo.priority,
        status: wo.status || 'Open',
        assigned_to_id: wo.assignedToId && wo.assignedToId.length > 20 ? wo.assignedToId : null,
        assigned_to_name: wo.assignedToName,
        created_by_name: wo.createdByName || 'Admin',
        due_date: wo.dueDate,
        estimated_hours: wo.estimatedHours || 4,
        total_steps: wo.totalSteps || [],
        steps_completed: wo.stepsCompleted || [],
        spare_parts_used: wo.materials || wo.sparePartsUsed || [],
        technician_notes: wo.technicianNotes,
        completion_proof_url: wo.photos && wo.photos.length > 0 ? wo.photos[0] : wo.completionProofUrl
      }]).select().single();

      if (error) {
        console.error('Error inserting work order to Supabase:', error);
        return null;
      }
      return {
        id: data.id,
        woNumber: data.wo_number,
        woDate: wo.woDate || data.created_at?.substring(0, 10),
        title: data.title,
        description: data.description,
        assetId: data.asset_id || '',
        assetName: data.asset_name,
        assetTag: data.asset_tag,
        category: data.category,
        location: data.location,
        priority: data.priority,
        woCategory: wo.woCategory,
        jobType: wo.jobType,
        vendorName: wo.vendorName,
        status: data.status,
        assignedToId: data.assigned_to_id,
        assignedToName: data.assigned_to_name,
        createdById: data.created_by_id,
        createdByName: data.created_by_name,
        createdAt: data.created_at,
        dueDate: data.due_date,
        estimatedHours: Number(data.estimated_hours),
        totalSteps: data.total_steps,
        stepsCompleted: data.steps_completed,
        sparePartsUsed: data.spare_parts_used,
        materials: wo.materials,
        photos: wo.photos
      };
    } catch (err) {
      console.error('Exception inserting work order:', err);
      return null;
    }
  },

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.assignedToId !== undefined) payload.assigned_to_id = updates.assignedToId && updates.assignedToId.length > 20 ? updates.assignedToId : null;
      if (updates.assignedToName !== undefined) payload.assigned_to_name = updates.assignedToName;
      if (updates.technicianNotes !== undefined) payload.technician_notes = updates.technicianNotes;
      if (updates.stepsCompleted !== undefined) payload.steps_completed = updates.stepsCompleted;
      if (updates.sparePartsUsed !== undefined) payload.spare_parts_used = updates.sparePartsUsed;
      if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
      if (updates.approvedById !== undefined) payload.approved_by_id = updates.approvedById && updates.approvedById.length > 20 ? updates.approvedById : null;
      if (updates.approvedByName !== undefined) payload.approved_by_name = updates.approvedByName;
      if (updates.approvedAt !== undefined) payload.approved_at = updates.approvedAt;

      await supabase.from('work_orders').update(payload).eq('id', id);
    } catch (err) {
      console.error('Exception updating work order in Supabase:', err);
    }
  },

  async deleteWorkOrder(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('work_orders').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting work order from Supabase:', err);
    }
  },

  async deleteBulkWorkOrders(ids: string[]) {
    if (!isSupabaseConfigured() || ids.length === 0) return;
    try {
      await supabase.from('work_orders').delete().in('id', ids);
    } catch (err) {
      console.error('Exception bulk deleting work orders:', err);
    }
  },

  // ==========================================
  // MAINTENANCE SCHEDULES
  // ==========================================
  async getSchedules(): Promise<MaintenanceSchedule[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('maintenance_schedules').select('*').order('next_due_date', { ascending: true });
      if (error || !data) {
        console.error('Error fetching schedules from Supabase:', error);
        return null;
      }
      return data.map((s) => ({
        id: s.id,
        scheduleCode: s.schedule_code,
        title: s.title,
        assetId: s.asset_id || '',
        assetName: s.asset_name || '',
        assetTag: s.asset_tag || '',
        category: s.category,
        frequency: s.frequency,
        lastRunDate: s.last_run_date,
        nextDueDate: s.next_due_date,
        assignedType: s.assigned_type || 'internal',
        assignedToId: s.assigned_to_id,
        assignedToName: s.assigned_to_name,
        vendorId: s.vendor_id,
        vendorName: s.vendor_name,
        checklistItems: s.checklist_items || [],
        estimatedDuration: s.estimated_duration || '3 Jam',
        status: s.status || 'Aktif'
      }));
    } catch (err) {
      console.error('Exception fetching schedules:', err);
      return null;
    }
  },

  async insertSchedule(schedule: Omit<MaintenanceSchedule, 'id' | 'scheduleCode'>): Promise<MaintenanceSchedule | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('maintenance_schedules').insert([{
        schedule_code: `SCH-PM-${schedule.category.substring(0, 3).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`,
        title: schedule.title,
        asset_name: schedule.assetName,
        asset_tag: schedule.assetTag,
        category: schedule.category,
        frequency: schedule.frequency,
        next_due_date: schedule.nextDueDate,
        assigned_type: schedule.assignedType,
        assigned_to_name: schedule.assignedToName,
        vendor_name: schedule.vendorName,
        checklist_items: schedule.checklistItems,
        estimated_duration: schedule.estimatedDuration,
        status: schedule.status
      }]).select().single();

      if (error) {
        console.error('Error inserting schedule to Supabase:', error);
        return null;
      }
      return {
        id: data.id,
        scheduleCode: data.schedule_code,
        title: data.title,
        assetId: data.asset_id || '',
        assetName: data.asset_name,
        assetTag: data.asset_tag,
        category: data.category,
        frequency: data.frequency,
        nextDueDate: data.next_due_date,
        assignedType: data.assigned_type,
        assignedToName: data.assigned_to_name,
        vendorName: data.vendor_name,
        checklistItems: data.checklist_items,
        estimatedDuration: data.estimated_duration,
        status: data.status
      };
    } catch (err) {
      console.error('Exception inserting schedule:', err);
      return null;
    }
  },

  async updateSchedule(id: string, updates: Partial<MaintenanceSchedule>) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.nextDueDate !== undefined) payload.next_due_date = updates.nextDueDate;
      if (updates.frequency !== undefined) payload.frequency = updates.frequency;
      if (updates.assignedToName !== undefined) payload.assigned_to_name = updates.assignedToName;
      if (updates.vendorName !== undefined) payload.vendor_name = updates.vendorName;
      if (updates.checklistItems !== undefined) payload.checklist_items = updates.checklistItems;
      if (updates.estimatedDuration !== undefined) payload.estimated_duration = updates.estimatedDuration;

      await supabase.from('maintenance_schedules').update(payload).eq('id', id);
    } catch (err) {
      console.error('Exception updating schedule in Supabase:', err);
    }
  },

  async deleteSchedule(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('maintenance_schedules').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting schedule from Supabase:', err);
    }
  },

  async deleteBulkSchedules(ids: string[]) {
    if (!isSupabaseConfigured() || ids.length === 0) return;
    try {
      await supabase.from('maintenance_schedules').delete().in('id', ids);
    } catch (err) {
      console.error('Exception bulk deleting schedules:', err);
    }
  },

  // ==========================================
  // SPARE PARTS
  // ==========================================
  async getSpareParts(): Promise<SparePart[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('spare_parts').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        console.error('Error fetching spare parts from Supabase:', error);
        return null;
      }
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
    } catch (err) {
      console.error('Exception fetching spare parts:', err);
      return null;
    }
  },

  async insertSparePart(part: Omit<SparePart, 'id'>): Promise<SparePart | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('spare_parts').insert([{
        sku: part.sku,
        name: part.name,
        category: part.category,
        stock: part.stock,
        min_threshold: part.minThreshold,
        unit: part.unit,
        unit_cost: part.unitCost,
        location_rack: part.locationRack,
        compatible_assets: part.compatibleAssets,
        supplier: part.supplier,
        last_restocked: part.lastRestocked
      }]).select().single();

      if (error) {
        console.error('Error inserting spare part to Supabase:', error);
        return null;
      }
      return {
        id: data.id,
        sku: data.sku,
        name: data.name,
        category: data.category,
        stock: data.stock,
        minThreshold: data.min_threshold,
        unit: data.unit,
        unitCost: Number(data.unit_cost),
        locationRack: data.location_rack,
        compatibleAssets: data.compatible_assets,
        supplier: data.supplier,
        lastRestocked: data.last_restocked
      };
    } catch (err) {
      console.error('Exception inserting spare part:', err);
      return null;
    }
  },

  async updateSparePart(id: string, updates: Partial<SparePart>) {
    if (!isSupabaseConfigured()) return;
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.sku !== undefined) payload.sku = updates.sku;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.minThreshold !== undefined) payload.min_threshold = updates.minThreshold;
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.unitCost !== undefined) payload.unit_cost = updates.unitCost;
      if (updates.locationRack !== undefined) payload.location_rack = updates.locationRack;
      if (updates.supplier !== undefined) payload.supplier = updates.supplier;
      if (updates.compatibleAssets !== undefined) payload.compatible_assets = updates.compatibleAssets;

      await supabase.from('spare_parts').update(payload).eq('id', id);
    } catch (err) {
      console.error('Exception updating spare part:', err);
    }
  },

  async deleteSparePart(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('spare_parts').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting spare part:', err);
    }
  },

  async deleteBulkSpareParts(ids: string[]) {
    if (!isSupabaseConfigured() || ids.length === 0) return;
    try {
      await supabase.from('spare_parts').delete().in('id', ids);
    } catch (err) {
      console.error('Exception bulk deleting spare parts:', err);
    }
  },

  async updateSparePartStock(id: string, newStock: number) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('spare_parts').update({
        stock: newStock,
        last_restocked: new Date().toISOString().substring(0, 10)
      }).eq('id', id);
    } catch (err) {
      console.error('Exception updating spare part stock:', err);
    }
  },


  async deleteBulkVendors(ids: string[]) {
    if (!isSupabaseConfigured() || ids.length === 0) return;
    try {
      await supabase.from('vendors').delete().in('id', ids);
    } catch (err) {
      console.error('Exception bulk deleting vendors:', err);
    }
  },

  // ==========================================
  // VENDORS
  // ==========================================
  async getVendors(): Promise<Vendor[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        console.error('Error fetching vendors from Supabase:', error);
        return null;
      }
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
    } catch (err) {
      console.error('Exception fetching vendors:', err);
      return null;
    }
  },

  async insertVendor(vendor: Omit<Vendor, 'id'>): Promise<Vendor | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('vendors').insert([{
        name: vendor.name,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        specialization: vendor.specialization,
        contract_status: vendor.contractStatus,
        rating: vendor.rating,
        address: vendor.address,
        active_jobs_count: vendor.activeJobsCount,
        contract_expiry: vendor.contractExpiry
      }]).select().single();

      if (error) {
        console.error('Error inserting vendor to Supabase:', error);
        return null;
      }
      return {
        id: data.id,
        name: data.name,
        contactPerson: data.contact_person,
        email: data.email,
        phone: data.phone,
        specialization: data.specialization,
        contractStatus: data.contract_status,
        rating: Number(data.rating),
        address: data.address,
        activeJobsCount: data.active_jobs_count,
        contractExpiry: data.contract_expiry
      };
    } catch (err) {
      console.error('Exception inserting vendor:', err);
      return null;
    }
  },

  async deleteVendor(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('vendors').delete().eq('id', id);
    } catch (err) {
      console.error('Exception deleting vendor:', err);
    }
  },

  // ==========================================
  // MENU PERMISSIONS
  // ==========================================
  async getMenuPermissions(): Promise<MenuPermission[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('menu_permissions').select('*').order('menu_number', { ascending: true });
      if (error || !data) {
        console.error('Error fetching permissions from Supabase:', error);
        return null;
      }
      return data.map((m) => ({
        menuKey: m.menu_key,
        label: m.label,
        iconName: m.icon_name,
        menuNumber: m.menu_number,
        description: m.description,
        rolesAllowed: m.roles_allowed
      }));
    } catch (err) {
      console.error('Exception fetching permissions:', err);
      return null;
    }
  },

  async updateMenuPermissionInDb(menuKey: string, rolesAllowed: any) {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('menu_permissions').update({
        roles_allowed: rolesAllowed,
        updated_at: new Date().toISOString()
      }).eq('menu_key', menuKey);
    } catch (err) {
      console.error('Exception updating menu permission:', err);
    }
  }
};
