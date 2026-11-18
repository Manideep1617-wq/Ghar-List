import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment variables or defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hshpfudhscrhwpkxkpbn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Goa7UMVsCP0DTUN5jaaNEQ_qoUk-vjp';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Real Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Type assertion, will use mock client if false

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. Running in Mock Local Mode.'
  );
}
