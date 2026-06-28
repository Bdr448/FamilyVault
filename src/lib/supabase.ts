import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we should operate in Demo Mode (Local Storage Mock Data)
export const isDemoMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'your_supabase_url' ||
  supabaseAnonKey === 'your_supabase_anon_key';

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);
