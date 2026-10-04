import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables untuk Vite menggunakan prefix VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud Sync adalah fitur opsional, jadi tidak throw error jika credentials tidak ada
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  console.log('🔧 Supabase Configuration:');
  console.log('  URL:', supabaseUrl);
  console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Supabase credentials not configured. Cloud Sync will be disabled.');
}

export { supabase };
