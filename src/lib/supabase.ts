import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// DEBUG: Check environment variables
// ============================================
console.log('====================================');
console.log('🔍 SUPABASE DEBUG INFO');
console.log('====================================');
console.log('ENV URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('ENV KEY ada:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('ENV KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0);
console.log('All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('====================================');

// Environment variables untuk Vite menggunakan prefix VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud Sync adalah fitur opsional, jadi tidak throw error jika credentials tidak ada
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase Configuration:');
  console.log('  URL:', supabaseUrl);
  console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client created successfully!');
} else {
  console.warn('⚠️ Supabase credentials not configured. Cloud Sync will be disabled.');
  if (!supabaseUrl) {
    console.warn('  ❌ Missing: VITE_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    console.warn('  ❌ Missing: VITE_SUPABASE_ANON_KEY');
  }
}

export { supabase };
