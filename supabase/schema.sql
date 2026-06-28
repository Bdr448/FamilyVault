-- Family Digital Vault - PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor.

-- Enable pgvector (comment out if not supported or not needed)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles Table (resolves permissions based on Auth role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'family')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT,
    occupation TEXT,
    photo_url TEXT,
    relation TEXT,
    dob DATE,
    marriage_anniversary DATE,
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    medical_conditions TEXT,
    insurance_number TEXT,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 3. Folders Table (to organize documents hierarchically)
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Insert default folders
INSERT INTO public.folders (id, name) VALUES 
('10000000-0000-0000-0000-000000000001', 'Personal'),
('20000000-0000-0000-0000-000000000002', 'Medical'),
('30000000-0000-0000-0000-000000000003', 'Finance'),
('40000000-0000-0000-0000-000000000004', 'Vehicle'),
('50000000-0000-0000-0000-000000000005', 'Property'),
('60000000-0000-0000-0000-000000000006', 'Education')
ON CONFLICT (id) DO NOTHING;

-- 4. Documents Table (with soft-deletes, versioning tags, password protection, and OCR/AI ready columns)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g. Aadhaar, PAN, Passport, Insurance, Gas Bill etc.
    folder_id UUID REFERENCES public.folders ON DELETE SET NULL,
    owner_id UUID REFERENCES public.family_members ON DELETE SET NULL,
    owner_name TEXT, -- Fallback / manual entry
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    expiry_date DATE,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    is_password_protected BOOLEAN DEFAULT FALSE NOT NULL,
    password_pin TEXT, -- Access PIN (only checked client-side/custom hook for demo simplicity)
    downloads_count INTEGER DEFAULT 0 NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- OCR Fields
    ocr_text TEXT,
    ocr_language TEXT,
    ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    ocr_processed_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Fields
    ai_summary TEXT,
    ai_keywords TEXT[] DEFAULT '{}'::TEXT[],
    ai_tags TEXT[] DEFAULT '{}'::TEXT[],
    ai_document_type TEXT,
    ai_confidence_score NUMERIC
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 5. Document Versions Table (tracks document history)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents ON DELETE CASCADE NOT NULL,
    version INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Food', 'Medical', 'Travel', 'Shopping', 'Bills', 'Education', 'Fuel', 'Investment', 'Other')),
    expense_date DATE NOT NULL,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 7. Events Table (Calendar inputs: birthdays, renew deadlines, due dates)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('birthday', 'expiry', 'due_date', 'insurance', 'other')),
    reference_id UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 8. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role_or_relation TEXT NOT NULL, -- e.g. Doctor, Hospital, Insurance agent, Police, Ambulance
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    email TEXT,
    address TEXT,
    details TEXT, -- e.g. Medicine list, Policy Number etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Insert some default emergency services
INSERT INTO public.emergency_contacts (name, role_or_relation, phone, details) VALUES
('Police', 'Emergency Services', '100 / 112', 'Universal emergency helper line'),
('Fire Station', 'Emergency Services', '101', 'Fire departments'),
('Ambulance', 'Emergency Services', '102 / 108', 'Medical support services')
ON CONFLICT DO NOTHING;

-- 9. Activity Logs Table (like Google Drive activity feed)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. 'upload', 'edit', 'delete', 'restore', etc.
    details TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'documents', 'expenses', 'family_members', 'emergency_contacts', etc.
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. Audit Trails Table (for tracking old/new value changes)
CREATE TABLE IF NOT EXISTS public.audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_trails ENABLE ROW LEVEL SECURITY;


-- SECURITY HELPER FUNCTIONS
-- Checks if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Checks if current user belongs to the family vault (admin or family role)
CREATE OR REPLACE FUNCTION public.is_family_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'family')
  );
$$ LANGUAGE SQL SECURITY DEFINER;


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles
CREATE POLICY "Allow members select profiles" ON public.profiles
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow admin edit profiles" ON public.profiles
    FOR ALL USING (is_admin());

-- Family Members
CREATE POLICY "Allow members view family members" ON public.family_members
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow admin manage family members" ON public.family_members
    FOR ALL USING (is_admin());

-- Folders
CREATE POLICY "Allow members manage folders" ON public.folders
    FOR ALL USING (is_family_member());

-- Documents
CREATE POLICY "Allow members view documents" ON public.documents
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow members upload/edit documents" ON public.documents
    FOR INSERT WITH CHECK (is_family_member());

CREATE POLICY "Allow members update metadata" ON public.documents
    FOR UPDATE USING (is_family_member());

CREATE POLICY "Allow admin delete documents" ON public.documents
    FOR DELETE USING (is_admin());

-- Document Versions
CREATE POLICY "Allow members view versions" ON public.document_versions
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow members create versions" ON public.document_versions
    FOR INSERT WITH CHECK (is_family_member());

CREATE POLICY "Allow admin purge versions" ON public.document_versions
    FOR DELETE USING (is_admin());

-- Expenses
CREATE POLICY "Allow members manage expenses" ON public.expenses
    FOR ALL USING (is_family_member());

-- Events
CREATE POLICY "Allow members view calendar events" ON public.events
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow admin manage calendar events" ON public.events
    FOR ALL USING (is_admin());

-- Emergency Contacts
CREATE POLICY "Allow members view emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow admin manage emergency contacts" ON public.emergency_contacts
    FOR ALL USING (is_admin());

-- Activity Logs (Automatically populated via database triggers)
CREATE POLICY "Allow members read activities" ON public.activity_logs
    FOR SELECT USING (is_family_member());

CREATE POLICY "Allow admin delete activities" ON public.activity_logs
    FOR DELETE USING (is_admin());

-- Audit Trails
CREATE POLICY "Only admin access audit trails" ON public.audit_trails
    FOR SELECT USING (is_admin());


-- SYSTEM DB TRIGGERS

-- A. Auto Sync Auth User to Public Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'family')
  );
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Auto Log Activity Trigger
CREATE OR REPLACE FUNCTION public.log_activity_trigger()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  action_name TEXT;
  detail_msg TEXT;
  ref_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Extract email or set fallback
  BEGIN
    current_user_email := COALESCE(auth.jwt() ->> 'email', 'System');
  EXCEPTION WHEN OTHERS THEN
    current_user_email := 'System';
  END;

  IF TG_TABLE_NAME = 'documents' THEN
    ref_id := COALESCE(NEW.id, OLD.id);
    IF TG_OP = 'INSERT' THEN
      action_name := 'upload';
      detail_msg := current_user_email || ' uploaded document "' || NEW.title || '"';
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        action_name := 'delete';
        detail_msg := current_user_email || ' moved "' || NEW.title || '" to Trash';
      ELSIF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
        action_name := 'restore';
        detail_msg := current_user_email || ' restored "' || NEW.title || '" from Trash';
      ELSE
        action_name := 'edit';
        detail_msg := current_user_email || ' updated document details of "' || NEW.title || '"';
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'purge';
      detail_msg := current_user_email || ' permanently deleted document "' || OLD.title || '"';
      ref_id := OLD.id;
    END IF;
    
  ELSIF TG_TABLE_NAME = 'expenses' THEN
    ref_id := COALESCE(NEW.id, OLD.id);
    IF TG_OP = 'INSERT' THEN
      action_name := 'add_expense';
      detail_msg := current_user_email || ' logged expense: "' || NEW.title || '" (₹' || NEW.amount || ')';
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        action_name := 'delete_expense';
        detail_msg := current_user_email || ' moved expense "' || NEW.title || '" to Trash';
      ELSIF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
        action_name := 'restore_expense';
        detail_msg := current_user_email || ' restored expense "' || NEW.title || '"';
      ELSE
        action_name := 'edit_expense';
        detail_msg := current_user_email || ' edited expense "' || NEW.title || '"';
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'purge_expense';
      detail_msg := current_user_email || ' permanently deleted expense "' || OLD.title || '"';
      ref_id := OLD.id;
    END IF;
    
  ELSIF TG_TABLE_NAME = 'family_members' THEN
    ref_id := COALESCE(NEW.id, OLD.id);
    IF TG_OP = 'INSERT' THEN
      action_name := 'add_member';
      detail_msg := current_user_email || ' added family member: ' || NEW.name;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        action_name := 'delete_member';
        detail_msg := current_user_email || ' deleted family member profile of ' || NEW.name;
      ELSIF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
        action_name := 'restore_member';
        detail_msg := current_user_email || ' restored family member profile of ' || NEW.name;
      ELSE
        action_name := 'edit_member';
        detail_msg := current_user_email || ' updated profile for ' || NEW.name;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'purge_member';
      detail_msg := current_user_email || ' permanently deleted family profile of ' || OLD.name;
      ref_id := OLD.id;
    END IF;
  END IF;

  -- Create activity log
  INSERT INTO public.activity_logs (user_id, user_email, action, details, entity_type, entity_id)
  VALUES (current_user_id, current_user_email, action_name, detail_msg, TG_TABLE_NAME, ref_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Bind activity triggers
CREATE OR REPLACE TRIGGER on_document_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

CREATE OR REPLACE TRIGGER on_expense_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();

CREATE OR REPLACE TRIGGER on_member_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.log_activity_trigger();


-- C. Auto Log Detailed Audit Trail Changes for Edits
CREATE OR REPLACE FUNCTION public.log_audit_trail_trigger()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  old_data JSONB;
  new_data JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Write to audit trails
    INSERT INTO public.audit_trails (entity_type, entity_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_data, new_data, current_user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Bind audit triggers
CREATE OR REPLACE TRIGGER audit_document_changes
  AFTER UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail_trigger();

CREATE OR REPLACE TRIGGER audit_expense_changes
  AFTER UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail_trigger();

CREATE OR REPLACE TRIGGER audit_member_changes
  AFTER UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail_trigger();

-- D. Trigger to automatically link Documents to Calendar Events on upload/update with Expiry Dates
CREATE OR REPLACE FUNCTION public.sync_expiry_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove existing event if there was one
  DELETE FROM public.events WHERE reference_id = COALESCE(NEW.id, OLD.id) AND type = 'expiry';
  
  -- Create new event if new date is set and not deleted
  IF TG_OP <> 'DELETE' AND NEW.expiry_date IS NOT NULL AND NEW.is_deleted = FALSE THEN
    INSERT INTO public.events (title, description, event_date, type, reference_id)
    VALUES (
      'Expiry: ' || NEW.title,
      'Document ' || NEW.category || ' expires today.',
      NEW.expiry_date,
      'expiry',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_doc_expiry_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_expiry_event();

-- E. Trigger to automatically link Family Birthdays to Events
CREATE OR REPLACE FUNCTION public.sync_birthday_event()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.events WHERE reference_id = COALESCE(NEW.id, OLD.id) AND type = 'birthday';
  
  IF TG_OP <> 'DELETE' AND NEW.dob IS NOT NULL AND NEW.is_deleted = FALSE THEN
    INSERT INTO public.events (title, description, event_date, type, reference_id)
    VALUES (
      'Birthday: ' || NEW.name,
      Relation: || COALESCE(NEW.relation, 'Family Member'),
      NEW.dob,
      'birthday',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_member_birthday_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_birthday_event();
