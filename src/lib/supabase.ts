import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables untuk Vite menggunakan prefix VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud Sync adalah fitur opsional, jadi tidak throw error jika credentials tidak ada
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
