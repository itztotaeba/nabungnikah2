import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Check if supabase is configured
          if (!supabase) {
            console.warn('⚠️ Supabase not configured, skipping auth initialization');
            set({ isLoading: false, isInitialized: true });
            return;
          }
          
          // Get current session dengan error handling
          let session = null;
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('❌ Error getting session:', error);
              // Jangan throw error, biarkan aplikasi tetap berjalan
              session = null;
            } else {
              session = currentSession;
            }
          } catch (sessionError) {
            console.error('❌ Session fetch error:', sessionError);
            session = null;
          }
          
          set({ 
            session, 
            user: session?.user || null, 
            isLoading: false, 
            isInitialized: true 
          });
          

          
          // Listener sudah di-setup di useAuthSync hook
          // Tidak perlu setup di sini untuk menghindari duplikasi
        } catch (error) {
          console.error('❌ Error initializing auth:', error);
          // Reset state ke default jika error
          set({ 
            isLoading: false, 
            isInitialized: true,
            user: null,
            session: null
          });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          if (!supabase) {
            return { error: 'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.' };
          }
          
          set({ isLoading: true });
          
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ isLoading: false });
            return { error: error.message };
          }
          
          set({ isLoading: false });
          return { error: null };
        } catch (error: any) {
          set({ isLoading: false });
          return { error: error.message || 'Terjadi kesalahan' };
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          if (!supabase) {
            return { error: 'Supabase tidak dikonfigurasi. Cloud Sync tidak tersedia.' };
          }
          
          set({ isLoading: true });
          
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) {
            set({ isLoading: false });
            return { error: error.message };
          }
          
          set({ isLoading: false });
          return { error: null };
        } catch (error: any) {
          set({ isLoading: false });
          return { error: error.message || 'Terjadi kesalahan' };
        }
      },

      signOut: async () => {
        try {
          if (!supabase) {
            set({ user: null, session: null });
            return;
          }
          
          await supabase.auth.signOut();
          set({ user: null, session: null });
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
    }),
    {
      name: 'weddingplan-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
