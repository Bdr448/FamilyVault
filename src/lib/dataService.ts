import { supabase, isDemoMode } from './supabase';

// Local storage seed helpers
const seedLocalStorage = () => {
  if (!localStorage.getItem('family-vault-seeded')) {
    // 1. Folders
    const defaultFolders = [
      { id: '10000000-0000-0000-0000-000000000001', name: 'Personal' },
      { id: '20000000-0000-0000-0000-000000000002', name: 'Medical' },
      { id: '30000000-0000-0000-0000-000000000003', name: 'Finance' },
      { id: '40000000-0000-0000-0000-000000000004', name: 'Vehicle' },
      { id: '50000000-0000-0000-0000-000000000005', name: 'Property' },
      { id: '60000000-0000-0000-0000-000000000006', name: 'Education' }
    ];
    localStorage.setItem('family-vault-folders', JSON.stringify(defaultFolders));

    // 2. Family Members
    const defaultMembers = [
      {
        id: 'member-1',
        name: 'Bhavya Shah',
        nickname: 'Bhavya',
        gender: 'Male',
        occupation: 'Software Engineer',
        photo_url: '',
        relation: 'Self',
        dob: '1998-05-15',
        marriage_anniversary: '',
        blood_group: 'B+',
        phone: '+91 98765 43210',
        email: 'bhavya@familyvault.com',
        address: '102, Ocean Heights, Marine Drive, Mumbai',
        emergency_contact: 'Father (+91 98765 43211)',
        medical_conditions: 'None',
        insurance_number: 'HI-987293-8',
        notes: 'Tech enthusiast, manages family digital credentials.',
        is_deleted: false
      },
      {
        id: 'member-2',
        name: 'Rajesh Shah',
        nickname: 'Papa',
        gender: 'Male',
        occupation: 'Business Owner',
        photo_url: '',
        relation: 'Father',
        dob: '1968-11-20',
        marriage_anniversary: '1995-02-14',
        blood_group: 'O+',
        phone: '+91 98765 43211',
        email: 'rajesh@familyvault.com',
        address: '102, Ocean Heights, Marine Drive, Mumbai',
        emergency_contact: 'Bhavya (+91 98765 43210)',
        medical_conditions: 'Hypertension (managed with Amlodipine)',
        insurance_number: 'HI-102934-1',
        notes: 'Primary family earner, holds all property documents.',
        is_deleted: false
      },
      {
        id: 'member-3',
        name: 'Nisha Shah',
        nickname: 'Mummy',
        gender: 'Female',
        occupation: 'Homemaker',
        photo_url: '',
        relation: 'Mother',
        dob: '1973-04-12',
        marriage_anniversary: '1995-02-14',
        blood_group: 'A+',
        phone: '+91 98765 43212',
        email: 'nisha@familyvault.com',
        address: '102, Ocean Heights, Marine Drive, Mumbai',
        emergency_contact: 'Rajesh (+91 98765 43211)',
        medical_conditions: 'Dust Allergy',
        insurance_number: 'HI-102934-2',
        notes: 'Keeps track of utility bills and household expense categories.',
        is_deleted: false
      }
    ];
    localStorage.setItem('family-vault-family_members', JSON.stringify(defaultMembers));

    // 3. Emergency Contacts
    const defaultEmergency = [
      { id: 'emerg-1', name: 'Police Helpline', role_or_relation: 'Emergency Services', phone: '100 / 112', details: 'General police desk' },
      { id: 'emerg-2', name: 'Fire Control Room', role_or_relation: 'Emergency Services', phone: '101', details: 'Fire hazards' },
      { id: 'emerg-3', name: 'Ambulance Center', role_or_relation: 'Emergency Services', phone: '102 / 108', details: 'Medical transport dispatch' },
      { id: 'emerg-4', name: 'Dr. Ramesh Mehta', role_or_relation: 'Family Physician', phone: '+91 99887 76655', details: 'Clinic: Bandra West. Available 10am - 8pm.' },
      { id: 'emerg-5', name: 'Lilavati Hospital Desk', role_or_relation: 'Hospital', phone: '022-26751000', details: 'Emergency ER Ward and ICU helpline.' }
    ];
    localStorage.setItem('family-vault-emergency_contacts', JSON.stringify(defaultEmergency));

    // 4. Expenses
    const defaultExpenses = [
      { id: 'exp-1', title: 'Monthly Groceries (D-Mart)', amount: 4850.00, category: 'Food', expense_date: '2026-06-25', notes: 'Monthly household stock', is_deleted: false, created_by: 'family-uuid' },
      { id: 'exp-2', title: 'Dad Hypertension Medicine', amount: 1250.00, category: 'Medical', expense_date: '2026-06-28', notes: 'Amlodipine 30-day stock', is_deleted: false, created_by: 'member-1' },
      { id: 'exp-3', title: 'Fuel for Honda City', amount: 3500.00, category: 'Fuel', expense_date: '2026-06-24', notes: 'Full tank refill', is_deleted: false, created_by: 'admin-uuid' },
      { id: 'exp-4', title: 'Electricity Bill May 2026', amount: 4200.00, category: 'Bills', expense_date: '2026-06-10', notes: 'BEST electricity bill payment', is_deleted: false, created_by: 'family-uuid' },
      { id: 'exp-5', title: 'Mutual Fund SIP', amount: 15000.00, category: 'Investment', expense_date: '2026-06-05', notes: 'HDFC Index Fund SIP', is_deleted: false, created_by: 'admin-uuid' },
      { id: 'exp-6', title: 'Clothing shopping', amount: 2800.00, category: 'Shopping', expense_date: '2026-06-18', notes: 'Zara summer collection', is_deleted: false, created_by: 'family-uuid' }
    ];
    localStorage.setItem('family-vault-expenses', JSON.stringify(defaultExpenses));

    // 5. Documents
    const defaultDocuments = [
      {
        id: 'doc-1',
        title: 'Bhavya Passport',
        description: 'Bhavya\'s Indian Passport. Valid until 2032.',
        category: 'Passport',
        folder_id: '10000000-0000-0000-0000-000000000001',
        owner_id: 'member-1',
        owner_name: 'Bhavya Shah',
        file_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600&auto=format&fit=crop',
        file_path: 'vault/documents/doc-1/passport.jpg',
        file_type: 'image/jpeg',
        file_size: 154200,
        expiry_date: '2032-12-15',
        tags: ['Passport', 'ID Proof', 'Travel'],
        is_pinned: true,
        is_favorite: true,
        is_password_protected: false,
        password_pin: '',
        downloads_count: 5,
        is_deleted: false,
        created_by: 'admin-uuid',
        created_at: '2026-01-10T12:00:00Z',
        updated_at: '2026-01-10T12:00:00Z'
      },
      {
        id: 'doc-2',
        title: 'Car RC Book - Honda City',
        description: 'Vehicle Registration Certificate for MH-02-CB-1234.',
        category: 'Vehicle RC',
        folder_id: '40000000-0000-0000-0000-000000000004',
        owner_id: 'member-2',
        owner_name: 'Rajesh Shah',
        file_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop',
        file_path: 'vault/documents/doc-2/rc.jpg',
        file_type: 'image/jpeg',
        file_size: 320400,
        expiry_date: '2026-07-23', // Expiring in ~25 days from current time 2026-06-28
        tags: ['RC', 'Car', 'Vehicle'],
        is_pinned: true,
        is_favorite: true,
        is_password_protected: false,
        password_pin: '',
        downloads_count: 12,
        is_deleted: false,
        created_by: 'family-uuid',
        created_at: '2026-02-14T09:30:00Z',
        updated_at: '2026-02-14T09:30:00Z'
      },
      {
        id: 'doc-3',
        title: 'Flat Property Sale Deed',
        description: 'Sale deed agreement of 102, Ocean Heights property.',
        category: 'Property Papers',
        folder_id: '50000000-0000-0000-0000-000000000005',
        owner_id: 'member-2',
        owner_name: 'Rajesh Shah',
        file_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop',
        file_path: 'vault/documents/doc-3/deed.jpg',
        file_type: 'image/jpeg',
        file_size: 4500000,
        expiry_date: '',
        tags: ['Property', 'House', 'Confidential'],
        is_pinned: true,
        is_favorite: true,
        is_password_protected: true,
        password_pin: '1234',
        downloads_count: 2,
        is_deleted: false,
        created_by: 'admin-uuid',
        created_at: '2026-03-01T15:20:00Z',
        updated_at: '2026-03-01T15:20:00Z'
      },
      {
        id: 'doc-4',
        title: 'Nisha Aadhaar Card',
        description: 'Mummy\'s Aadhaar Card photocopy.',
        category: 'Aadhaar',
        folder_id: '10000000-0000-0000-0000-000000000001',
        owner_id: 'member-3',
        owner_name: 'Nisha Shah',
        file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
        file_path: 'vault/documents/doc-4/aadhaar.jpg',
        file_type: 'image/jpeg',
        file_size: 98000,
        expiry_date: '',
        tags: ['Aadhaar', 'ID Card'],
        is_pinned: false,
        is_favorite: false,
        is_password_protected: false,
        password_pin: '',
        downloads_count: 1,
        is_deleted: false,
        created_by: 'family-uuid',
        created_at: '2026-04-18T10:10:00Z',
        updated_at: '2026-04-18T10:10:00Z'
      },
      {
        id: 'doc-5',
        title: 'Electricity Bill May 2026',
        description: 'Electricity bill of 102, Ocean Heights.',
        category: 'Electricity Bills',
        folder_id: '30000000-0000-0000-0000-000000000003',
        owner_id: 'member-3',
        owner_name: 'Nisha Shah',
        file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
        file_path: 'vault/documents/doc-5/bill.jpg',
        file_type: 'image/jpeg',
        file_size: 142000,
        expiry_date: '',
        tags: ['Bill', 'Utility'],
        is_pinned: false,
        is_favorite: false,
        is_password_protected: false,
        password_pin: '',
        downloads_count: 0,
        is_deleted: true, // Deleted to seed Recycle Bin
        deleted_at: '2026-06-27T14:30:00Z',
        created_by: 'family-uuid',
        created_at: '2026-06-02T11:00:00Z',
        updated_at: '2026-06-02T11:00:00Z'
      }
    ];
    localStorage.setItem('family-vault-documents', JSON.stringify(defaultDocuments));

    // 6. Document Versions
    const defaultVersions = [
      { id: 'ver-1', document_id: 'doc-3', version: 1, file_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop', file_path: 'vault/documents/doc-3/deed.jpg', file_size: 4500000, created_by: 'admin-uuid', created_at: '2026-03-01T15:20:00Z' }
    ];
    localStorage.setItem('family-vault-document_versions', JSON.stringify(defaultVersions));

    // 7. Activity Logs
    const defaultActivity = [
      { id: 'act-1', user_id: 'admin-uuid', user_email: 'admin@familyvault.com', action: 'add_member', details: 'admin@familyvault.com added family member: Rajesh Shah', entity_type: 'family_members', entity_id: 'member-2', created_at: '2026-06-28T16:00:00Z' },
      { id: 'act-2', user_id: 'family-uuid', user_email: 'family@familyvault.com', action: 'upload', details: 'family@familyvault.com uploaded document "Car RC Book - Honda City"', entity_type: 'documents', entity_id: 'doc-2', created_at: '2026-06-28T15:30:00Z' },
      { id: 'act-3', user_id: 'family-uuid', user_email: 'family@familyvault.com', action: 'add_expense', details: 'family@familyvault.com logged expense: "Dad Hypertension Medicine" (₹1250)', entity_type: 'expenses', entity_id: 'exp-2', created_at: '2026-06-28T12:00:00Z' },
      { id: 'act-4', user_id: 'admin-uuid', user_email: 'admin@familyvault.com', action: 'upload', details: 'admin@familyvault.com uploaded document "Flat Property Sale Deed"', entity_type: 'documents', entity_id: 'doc-3', created_at: '2026-06-28T10:15:00Z' },
      { id: 'act-5', user_id: 'family-uuid', user_email: 'family@familyvault.com', action: 'delete', details: 'family@familyvault.com moved "Electricity Bill May 2026" to Trash', entity_type: 'documents', entity_id: 'doc-5', created_at: '2026-06-27T14:30:00Z' }
    ];
    localStorage.setItem('family-vault-activity_logs', JSON.stringify(defaultActivity));

    // 8. Events
    const defaultEvents = [
      { id: 'evt-1', title: 'Birthday: Rajesh Shah', description: 'Relation: Father', event_date: '2026-11-20', type: 'birthday', reference_id: 'member-2', is_deleted: false },
      { id: 'evt-2', title: 'Birthday: Nisha Shah', description: 'Relation: Mother', event_date: '2026-04-12', type: 'birthday', reference_id: 'member-3', is_deleted: false },
      { id: 'evt-3', title: 'Birthday: Bhavya Shah', description: 'Relation: Self', event_date: '2026-05-15', type: 'birthday', reference_id: 'member-1', is_deleted: false },
      { id: 'evt-4', title: 'Expiry: Car RC Book - Honda City', description: 'Document Vehicle RC expires today.', event_date: '2026-07-23', type: 'expiry', reference_id: 'doc-2', is_deleted: false }
    ];
    localStorage.setItem('family-vault-events', JSON.stringify(defaultEvents));

    // Audit Trails
    const defaultAudits = [
      { id: 'aud-1', entity_type: 'documents', entity_id: 'doc-3', action: 'UPDATE', old_values: { is_password_protected: false }, new_values: { is_password_protected: true, password_pin: '1234' }, changed_by: 'admin-uuid', changed_at: '2026-06-28T11:00:00Z' }
    ];
    localStorage.setItem('family-vault-audit_trails', JSON.stringify(defaultAudits));

    localStorage.setItem('family-vault-seeded', 'true');
  }
};

// Seed storage immediately for demo
if (isDemoMode) {
  seedLocalStorage();
}

// Database helper functions
export const dataService = {
  // --- HELPERS ---
  getCurrentUserMeta: () => {
    if (isDemoMode) {
      const stored = localStorage.getItem('family-vault-session');
      return stored ? JSON.parse(stored) : { id: 'system-uuid', email: 'system@familyvault.com', role: 'admin', name: 'System' };
    }
    return null;
  },

  // Log activity
  logActivity: async (action: string, details: string, entityType: string, entityId: string) => {
    const meta = dataService.getCurrentUserMeta();
    if (isDemoMode) {
      const logs = JSON.parse(localStorage.getItem('family-vault-activity_logs') || '[]');
      const newLog = {
        id: Math.random().toString(),
        user_id: meta?.id || 'system',
        user_email: meta?.email || 'System',
        action,
        details,
        entity_type: entityType,
        entity_id: entityId,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('family-vault-activity_logs', JSON.stringify([newLog, ...logs]));
    } else if (supabase) {
      await supabase.from('activity_logs').insert({
        action,
        details,
        entity_type: entityType,
        entity_id: entityId,
        user_email: meta?.email || (await supabase.auth.getUser()).data.user?.email || 'Unknown'
      });
    }
  },

  // --- FAMILY MEMBERS ---
  getFamilyMembers: async (): Promise<any[]> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-family_members') || '[]');
      return list.filter((m: any) => !m.is_deleted);
    }
    try {
      const { data, error } = await supabase!
        .from('family_members')
        .select('*')
        .eq('is_deleted', false)
        .order('name');
      if (error) throw error;
      localStorage.setItem('family-vault-cache-family_members', JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem('family-vault-cache-family_members');
      return cached ? JSON.parse(cached) : [];
    }
  },

  saveFamilyMember: async (member: any): Promise<any> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-family_members') || '[]');
      let result;
      if (member.id) {
        // Edit
        const oldIndex = list.findIndex((m: any) => m.id === member.id);
        const oldVal = list[oldIndex];
        list[oldIndex] = { ...oldVal, ...member, updated_at: new Date().toISOString() };
        result = list[oldIndex];
        // Log Audit and Activity
        dataService.logActivity('edit_member', `Updated profile of ${member.name}`, 'family_members', member.id);
      } else {
        // Create
        result = {
          ...member,
          id: 'member-' + Math.random().toString().substring(2, 9),
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        list.push(result);
        dataService.logActivity('add_member', `Added family member: ${member.name}`, 'family_members', result.id);
      }
      localStorage.setItem('family-vault-family_members', JSON.stringify(list));
      
      // Update birthdays in events
      const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
      const filteredEvents = events.filter((e: any) => !(e.reference_id === result.id && e.type === 'birthday'));
      if (result.dob) {
        filteredEvents.push({
          id: 'evt-' + Math.random().toString(),
          title: `Birthday: ${result.name}`,
          description: `Relation: ${result.relation || 'Family Member'}`,
          event_date: result.dob,
          type: 'birthday',
          reference_id: result.id,
          is_deleted: false
        });
      }
      localStorage.setItem('family-vault-events', JSON.stringify(filteredEvents));

      return result;
    } else {
      const { data, error } = await supabase!
        .from('family_members')
        .upsert(member)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  softDeleteFamilyMember: async (id: string, name: string): Promise<void> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-family_members') || '[]');
      const index = list.findIndex((m: any) => m.id === id);
      if (index !== -1) {
        list[index].is_deleted = true;
        list[index].deleted_at = new Date().toISOString();
        localStorage.setItem('family-vault-family_members', JSON.stringify(list));
        dataService.logActivity('delete_member', `Deleted family member profile of ${name}`, 'family_members', id);
        
        // Remove birthday event from calendar
        const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
        const updatedEvents = events.map((e: any) => {
          if (e.reference_id === id && e.type === 'birthday') {
            return { ...e, is_deleted: true, deleted_at: new Date().toISOString() };
          }
          return e;
        });
        localStorage.setItem('family-vault-events', JSON.stringify(updatedEvents));
      }
    } else {
      const { error } = await supabase!
        .from('family_members')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- EXPENSES ---
  getExpenses: async (): Promise<any[]> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-expenses') || '[]');
      return list.filter((e: any) => !e.is_deleted);
    }
    try {
      const { data, error } = await supabase!
        .from('expenses')
        .select('*')
        .eq('is_deleted', false)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      localStorage.setItem('family-vault-cache-expenses', JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem('family-vault-cache-expenses');
      return cached ? JSON.parse(cached) : [];
    }
  },

  saveExpense: async (expense: any): Promise<any> => {
    const meta = dataService.getCurrentUserMeta();
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-expenses') || '[]');
      let result;
      if (expense.id) {
        const idx = list.findIndex((e: any) => e.id === expense.id);
        list[idx] = { ...list[idx], ...expense, updated_at: new Date().toISOString() };
        result = list[idx];
        dataService.logActivity('edit_expense', `Edited expense "${expense.title}"`, 'expenses', expense.id);
      } else {
        result = {
          ...expense,
          id: 'exp-' + Math.random().toString().substring(2, 9),
          is_deleted: false,
          created_by: meta?.id || 'family-uuid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        list.push(result);
        dataService.logActivity('add_expense', `Logged expense: "${expense.title}" (₹${expense.amount})`, 'expenses', result.id);
      }
      localStorage.setItem('family-vault-expenses', JSON.stringify(list));
      return result;
    } else {
      const { data, error } = await supabase!
        .from('expenses')
        .upsert({ ...expense, created_by: meta?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  softDeleteExpense: async (id: string, title: string): Promise<void> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-expenses') || '[]');
      const idx = list.findIndex((e: any) => e.id === id);
      if (idx !== -1) {
        list[idx].is_deleted = true;
        list[idx].deleted_at = new Date().toISOString();
        localStorage.setItem('family-vault-expenses', JSON.stringify(list));
        dataService.logActivity('delete_expense', `Moved expense "${title}" to Trash`, 'expenses', id);
      }
    } else {
      const { error } = await supabase!
        .from('expenses')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- FOLDERS ---
  getFolders: async (): Promise<any[]> => {
    if (isDemoMode) {
      return JSON.parse(localStorage.getItem('family-vault-folders') || '[]');
    }
    try {
      const { data, error } = await supabase!
        .from('folders')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    } catch {
      return [
        { id: '10000000-0000-0000-0000-000000000001', name: 'Personal' },
        { id: '20000000-0000-0000-0000-000000000002', name: 'Medical' },
        { id: '30000000-0000-0000-0000-000000000003', name: 'Finance' },
        { id: '40000000-0000-0000-0000-000000000004', name: 'Vehicle' },
        { id: '50000000-0000-0000-0000-000000000005', name: 'Property' },
        { id: '60000000-0000-0000-0000-000000000006', name: 'Education' }
      ];
    }
  },

  saveFolder: async (folder: any): Promise<any> => {
    if (isDemoMode) {
      const folders = JSON.parse(localStorage.getItem('family-vault-folders') || '[]');
      const newFolder = {
        ...folder,
        id: 'folder-' + Math.random().toString().substring(2, 9),
        created_at: new Date().toISOString()
      };
      folders.push(newFolder);
      localStorage.setItem('family-vault-folders', JSON.stringify(folders));
      dataService.logActivity('create_folder', `Created folder "${folder.name}"`, 'folders', newFolder.id);
      return newFolder;
    } else {
      const { data, error } = await supabase!
        .from('folders')
        .insert(folder)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<any[]> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-documents') || '[]');
      return list.filter((d: any) => !d.is_deleted);
    }
    try {
      const { data, error } = await supabase!
        .from('documents')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      localStorage.setItem('family-vault-cache-documents', JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem('family-vault-cache-documents');
      return cached ? JSON.parse(cached) : [];
    }
  },

  saveDocument: async (doc: any, fileObj?: File): Promise<any> => {
    const meta = dataService.getCurrentUserMeta();
    
    // Simulate Supabase Storage Upload if file is present
    let url = doc.file_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
    let path = doc.file_path || 'vault/documents/placeholder.jpg';
    let size = doc.file_size || 102400;
    let fileType = doc.file_type || 'image/jpeg';

    if (fileObj) {
      size = fileObj.size;
      fileType = fileObj.type;
      
      if (!isDemoMode && supabase) {
        // Upload to real Supabase Storage
        const fileExt = fileObj.name.split('.').pop();
        const randId = Math.random().toString().substring(2, 9);
        path = `vault/documents/${randId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('vault')
          .upload(path, fileObj, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage.from('vault').getPublicUrl(path);
        url = data.publicUrl;
      } else {
        // Mock URL in Demo mode
        url = URL.createObjectURL(fileObj);
        path = `vault/documents/${Math.random().toString().substring(2, 9)}_${fileObj.name}`;
      }
    }

    const payload = {
      ...doc,
      file_url: url,
      file_path: path,
      file_size: size,
      file_type: fileType,
      updated_at: new Date().toISOString()
    };

    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-documents') || '[]');
      let result;
      
      if (doc.id) {
        // Edit document metadata or upload new version
        const idx = list.findIndex((d: any) => d.id === doc.id);
        const oldVal = list[idx];
        
        // If file is changed, increment version history
        if (fileObj) {
          const versions = JSON.parse(localStorage.getItem('family-vault-document_versions') || '[]');
          // Resolve current max version number
          const docVers = versions.filter((v: any) => v.document_id === doc.id);
          const nextVersionNo = docVers.length + 1;
          
          versions.push({
            id: 'ver-' + Math.random().toString(),
            document_id: doc.id,
            version: nextVersionNo,
            file_url: oldVal.file_url,
            file_path: oldVal.file_path,
            file_size: oldVal.file_size,
            created_by: meta?.id || 'family-uuid',
            created_at: oldVal.updated_at || new Date().toISOString()
          });
          localStorage.setItem('family-vault-document_versions', JSON.stringify(versions));
        }

        list[idx] = { ...oldVal, ...payload };
        result = list[idx];
        dataService.logActivity(fileObj ? 'upload' : 'edit', fileObj ? `Uploaded new version of "${result.title}"` : `Updated details of "${result.title}"`, 'documents', result.id);
      } else {
        // Create new document
        result = {
          ...payload,
          id: 'doc-' + Math.random().toString().substring(2, 9),
          downloads_count: 0,
          is_pinned: false,
          is_favorite: false,
          is_deleted: false,
          created_by: meta?.id || 'family-uuid',
          created_at: new Date().toISOString()
        };
        list.push(result);
        dataService.logActivity('upload', `Uploaded document "${result.title}"`, 'documents', result.id);
      }
      
      localStorage.setItem('family-vault-documents', JSON.stringify(list));
      
      // Update expiry events
      const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
      const filteredEvents = events.filter((e: any) => !(e.reference_id === result.id && e.type === 'expiry'));
      if (result.expiry_date) {
        filteredEvents.push({
          id: 'evt-' + Math.random().toString(),
          title: `Expiry: ${result.title}`,
          description: `Document ${result.category} expires today.`,
          event_date: result.expiry_date,
          type: 'expiry',
          reference_id: result.id,
          is_deleted: false
        });
      }
      localStorage.setItem('family-vault-events', JSON.stringify(filteredEvents));

      return result;
    } else {
      // Supabase insert/upsert
      const { data, error } = await supabase!
        .from('documents')
        .upsert({ ...payload, created_by: meta?.id })
        .select()
        .single();
      if (error) throw error;
      
      // If updating with file, also save new version row
      if (doc.id && fileObj) {
        // Find existing versions count
        const { count } = await supabase!
          .from('document_versions')
          .select('*', { count: 'exact', head: true })
          .eq('document_id', doc.id);
        
        await supabase!.from('document_versions').insert({
          document_id: doc.id,
          version: (count || 0) + 1,
          file_url: url,
          file_path: path,
          file_size: size,
          created_by: meta?.id
        });
      }
      return data;
    }
  },

  softDeleteDocument: async (id: string, title: string): Promise<void> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-documents') || '[]');
      const idx = list.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        list[idx].is_deleted = true;
        list[idx].deleted_at = new Date().toISOString();
        localStorage.setItem('family-vault-documents', JSON.stringify(list));
        dataService.logActivity('delete', `Moved "${title}" to Trash`, 'documents', id);
        
        // Hide related expiry event
        const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
        const updatedEvents = events.map((e: any) => {
          if (e.reference_id === id && e.type === 'expiry') {
            return { ...e, is_deleted: true, deleted_at: new Date().toISOString() };
          }
          return e;
        });
        localStorage.setItem('family-vault-events', JSON.stringify(updatedEvents));
      }
    } else {
      const { error } = await supabase!
        .from('documents')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
  },

  getDocumentVersions: async (documentId: string): Promise<any[]> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-document_versions') || '[]');
      return list.filter((v: any) => v.document_id === documentId).sort((a: any, b: any) => b.version - a.version);
    }
    const { data, error } = await supabase!
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false });
    if (error) throw error;
    return data;
  },

  incrementDownloadCount: async (id: string): Promise<void> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-documents') || '[]');
      const idx = list.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        list[idx].downloads_count += 1;
        localStorage.setItem('family-vault-documents', JSON.stringify(list));
      }
    } else {
      const { data } = await supabase!.from('documents').select('downloads_count').eq('id', id).single();
      const count = (data?.downloads_count || 0) + 1;
      await supabase!.from('documents').update({ downloads_count: count }).eq('id', id);
    }
  },

  // --- CALENDAR EVENTS ---
  getEvents: async (): Promise<any[]> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
      return list.filter((e: any) => !e.is_deleted);
    }
    try {
      const { data, error } = await supabase!
        .from('events')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    } catch {
      return [];
    }
  },

  // --- EMERGENCY CONTACTS ---
  getEmergencyContacts: async (): Promise<any[]> => {
    if (isDemoMode) {
      return JSON.parse(localStorage.getItem('family-vault-emergency_contacts') || '[]');
    }
    try {
      const { data, error } = await supabase!
        .from('emergency_contacts')
        .select('*')
        .order('name');
      if (error) throw error;
      localStorage.setItem('family-vault-cache-emergency', JSON.stringify(data));
      return data;
    } catch {
      const cached = localStorage.getItem('family-vault-cache-emergency');
      return cached ? JSON.parse(cached) : [];
    }
  },

  saveEmergencyContact: async (contact: any): Promise<any> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-emergency_contacts') || '[]');
      let result;
      if (contact.id) {
        const idx = list.findIndex((c: any) => c.id === contact.id);
        list[idx] = { ...list[idx], ...contact };
        result = list[idx];
        dataService.logActivity('edit_contact', `Updated emergency contact ${contact.name}`, 'emergency_contacts', contact.id);
      } else {
        result = {
          ...contact,
          id: 'emerg-' + Math.random().toString().substring(2, 9),
          created_at: new Date().toISOString()
        };
        list.push(result);
        dataService.logActivity('add_contact', `Added emergency helpline ${contact.name}`, 'emergency_contacts', result.id);
      }
      localStorage.setItem('family-vault-emergency_contacts', JSON.stringify(list));
      return result;
    } else {
      const { data, error } = await supabase!
        .from('emergency_contacts')
        .upsert(contact)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteEmergencyContact: async (id: string, name: string): Promise<void> => {
    if (isDemoMode) {
      const list = JSON.parse(localStorage.getItem('family-vault-emergency_contacts') || '[]');
      const filtered = list.filter((c: any) => c.id !== id);
      localStorage.setItem('family-vault-emergency_contacts', JSON.stringify(filtered));
      dataService.logActivity('delete_contact', `Removed emergency contact ${name}`, 'emergency_contacts', id);
    } else {
      const { error } = await supabase!
        .from('emergency_contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- TIMELINE / ACTIVITY FEED ---
  getActivityLogs: async (): Promise<any[]> => {
    if (isDemoMode) {
      return JSON.parse(localStorage.getItem('family-vault-activity_logs') || '[]');
    }
    try {
      const { data, error } = await supabase!
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    } catch {
      return [];
    }
  },

  getAuditTrails: async (): Promise<any[]> => {
    if (isDemoMode) {
      return JSON.parse(localStorage.getItem('family-vault-audit_trails') || '[]');
    }
    const { data, error } = await supabase!
      .from('audit_trails')
      .select('*')
      .order('changed_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // --- RECYCLE BIN ---
  getDeletedItems: async (): Promise<{ documents: any[]; expenses: any[]; familyMembers: any[] }> => {
    if (isDemoMode) {
      const docs = JSON.parse(localStorage.getItem('family-vault-documents') || '[]');
      const exps = JSON.parse(localStorage.getItem('family-vault-expenses') || '[]');
      const members = JSON.parse(localStorage.getItem('family-vault-family_members') || '[]');
      return {
        documents: docs.filter((d: any) => d.is_deleted),
        expenses: exps.filter((e: any) => e.is_deleted),
        familyMembers: members.filter((m: any) => m.is_deleted)
      };
    }

    const { data: documents } = await supabase!.from('documents').select('*').eq('is_deleted', true);
    const { data: expenses } = await supabase!.from('expenses').select('*').eq('is_deleted', true);
    const { data: familyMembers } = await supabase!.from('family_members').select('*').eq('is_deleted', true);

    return {
      documents: documents || [],
      expenses: expenses || [],
      familyMembers: familyMembers || []
    };
  },

  restoreItem: async (type: 'documents' | 'expenses' | 'family_members', id: string): Promise<void> => {
    if (isDemoMode) {
      let key = `family-vault-${type}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = list.findIndex((item: any) => item.id === id);
      if (idx !== -1) {
        list[idx].is_deleted = false;
        list[idx].deleted_at = null;
        localStorage.setItem(key, JSON.stringify(list));
        
        const title = list[idx].title || list[idx].name;
        dataService.logActivity('restore', `Restored ${type.replace('_', ' ')}: "${title}"`, type, id);

        // Also restore events if document/member had birthday or expiry
        const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
        const updatedEvents = events.map((e: any) => {
          if (e.reference_id === id) {
            return { ...e, is_deleted: false, deleted_at: null };
          }
          return e;
        });
        localStorage.setItem('family-vault-events', JSON.stringify(updatedEvents));
      }
    } else {
      const { error } = await supabase!
        .from(type)
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id);
      if (error) throw error;
    }
  },

  purgeItem: async (type: 'documents' | 'expenses' | 'family_members', id: string): Promise<void> => {
    if (isDemoMode) {
      // Delete permanently
      let key = `family-vault-${type}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = list.filter((item: any) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));

      // Permanently remove linked versions or events
      if (type === 'documents') {
        const versions = JSON.parse(localStorage.getItem('family-vault-document_versions') || '[]');
        localStorage.setItem('family-vault-document_versions', JSON.stringify(versions.filter((v: any) => v.document_id !== id)));
      }
      const events = JSON.parse(localStorage.getItem('family-vault-events') || '[]');
      localStorage.setItem('family-vault-events', JSON.stringify(events.filter((e: any) => e.reference_id !== id)));
    } else {
      const { error } = await supabase!
        .from(type)
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // --- BACKUP & RESTORE ---
  exportBackup: () => {
    const backup: Record<string, any> = {};
    const tables = ['folders', 'family_members', 'emergency_contacts', 'expenses', 'documents', 'document_versions', 'events', 'activity_logs'];
    
    tables.forEach(table => {
      const data = localStorage.getItem(`family-vault-${table}`);
      if (data) {
        backup[table] = JSON.parse(data);
      }
    });

    backup.vaultPin = localStorage.getItem('family-vault-pin') || '1234';
    backup.backupDate = new Date().toISOString();

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `family_vault_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  restoreBackup: (backupJson: any): boolean => {
    try {
      const tables = ['folders', 'family_members', 'emergency_contacts', 'expenses', 'documents', 'document_versions', 'events', 'activity_logs'];
      
      tables.forEach(table => {
        if (backupJson[table]) {
          localStorage.setItem(`family-vault-${table}`, JSON.stringify(backupJson[table]));
        }
      });

      if (backupJson.vaultPin) {
        localStorage.setItem('family-vault-pin', backupJson.vaultPin);
      }

      localStorage.setItem('family-vault-seeded', 'true');
      return true;
    } catch {
      return false;
    }
  }
};
