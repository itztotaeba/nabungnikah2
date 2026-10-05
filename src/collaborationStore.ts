import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './lib/supabase';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';

interface WeddingMember {
  id: string;
  wedding_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface CollaborationState {
  currentWeddingId: string | null;
  userRole: 'owner' | 'member' | null;
  members: WeddingMember[];
  isLoading: boolean;
  
  // Actions
  initializeWedding: () => Promise<void>;
  initializeWeddingSession: () => Promise<void>;
  inviteMember: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: () => Promise<void>;
  setCurrentWeddingId: (id: string | null) => void;
  setUserRole: (role: 'owner' | 'member' | null) => void;
  resetData: () => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      currentWeddingId: null,
      userRole: null,
      members: [],
      isLoading: false,

      initializeWedding: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) {
          console.warn('⚠️ No user or supabase not configured');
          return;
        }

        try {
          set({ isLoading: true });

          // Check if user already has a wedding
          const { data: existingMembership, error: memberError } = await supabase
            .from('wedding_members')
            .select('*, profiles(email, full_name)')
            .eq('user_id', user.id)
            .maybeSingle();

          if (memberError && memberError.code !== 'PGRST116') {
            console.error('Member query error:', memberError);
            throw memberError;
          }

          if (existingMembership) {
            // User sudah punya wedding
            console.log('✅ User already has wedding:', existingMembership.wedding_id);
            set({
              currentWeddingId: existingMembership.wedding_id,
              userRole: existingMembership.role,
              isLoading: false,
            });
            
            // Fetch all members
            await get().fetchMembers();
            return;
          }

          // User belum punya wedding, buat baru menggunakan RPC
          console.log('🆕 Creating new wedding for user via RPC...');
          
          // Panggil fungsi database yang bypass RLS
          const { data: newWeddingId, error: createError } = await supabase
            .rpc('create_initial_wedding');

          if (createError) {
            console.error('RPC Error:', createError);
            throw createError;
          }

          if (!newWeddingId) {
            throw new Error('RPC did not return wedding_id');
          }

          // Validasi weddingId
          if (typeof newWeddingId !== 'string') {
            throw new Error('Invalid wedding_id type');
          }

          console.log('✅ New wedding created via RPC:', newWeddingId);
          set({
            currentWeddingId: newWeddingId,
            userRole: 'owner',
            isLoading: false,
          });

          // Fetch members
          await get().fetchMembers();

        } catch (error: any) {
          // Jangan tampilkan toast error, cukup log ke console
          console.error('❌ Gagal inisialisasi wedding:', error);
          console.log('💡 User bisa melakukan sync manual nanti jika diperlukan');
          
          // Reset state ke default jika error
          set({ 
            isLoading: false,
            currentWeddingId: null,
            userRole: null
          });
        }
      },

      initializeWeddingSession: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          console.warn('⚠️ No user logged in');
          return;
        }

        if (!supabase) {
          console.warn('⚠️ Supabase not configured');
          return;
        }

        try {
          set({ isLoading: true });

          // LANGKAH 1: Panggil RPC (fungsi di database sudah pintar, akan cek sendiri)
          console.log('🔄 Memanggil RPC create_initial_wedding...');
          const { data: weddingId, error: rpcError } = await supabase
            .rpc('create_initial_wedding');

          if (rpcError) {
            console.error('❌ RPC Error:', rpcError);
            throw new Error('Gagal inisialisasi wedding: ' + (rpcError.message || 'Unknown error'));
          }

          if (!weddingId) {
            throw new Error('RPC did not return wedding_id');
          }

          // Validasi tipe data
          if (typeof weddingId !== 'string') {
            throw new Error('Invalid wedding_id type: expected string, got ' + typeof weddingId);
          }

          console.log('✅ Wedding ID obtained:', weddingId);

          // LANGKAH 2: Ambil role user dari wedding_members
          const { data: memberData, error: memberError } = await supabase
            .from('wedding_members')
            .select('role')
            .eq('wedding_id', weddingId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (memberError && memberError.code !== 'PGRST116') {
            console.error('❌ Member query error:', memberError);
            // Jangan throw error, gunakan default role
          }

          const role = memberData?.role || 'owner';
          console.log('✅ User role:', role);

          // LANGKAH 3: Simpan ke store
          set({ 
            currentWeddingId: weddingId, 
            userRole: role as 'owner' | 'member',
            isLoading: false
          });

          console.log('✅ Wedding session initialized:', { weddingId, role });
          
        } catch (error: any) {
          console.error('❌ Init session error:', error);
          
          // Reset state ke default jika error
          set({ 
            isLoading: false,
            currentWeddingId: null,
            userRole: null
          });
          
          // Throw error agar SupabaseSyncProvider bisa handle
          throw error;
        }
      },

      inviteMember: async (email: string) => {
        const { currentWeddingId, userRole } = get();
        const { user } = useAuthStore.getState();

        if (!user || !supabase || !currentWeddingId) {
          return { success: false, error: 'Tidak ada wedding aktif' };
        }

        if (userRole !== 'owner') {
          return { success: false, error: 'Hanya owner yang bisa mengundang member' };
        }

        try {
          // Cari user berdasarkan email di profiles
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('email', email)
            .single();

          if (profileError || !profile) {
            return { 
              success: false, 
              error: 'Email belum terdaftar. Minta pasangan untuk daftar dulu.' 
            };
          }

          // Check apakah sudah menjadi member
          const { data: existingMember } = await supabase
            .from('wedding_members')
            .select('id')
            .eq('wedding_id', currentWeddingId)
            .eq('user_id', profile.id)
            .maybeSingle();

          if (existingMember) {
            return { success: false, error: 'User sudah menjadi member' };
          }

          // Insert ke wedding_members
          const { error: insertError } = await supabase
            .from('wedding_members')
            .insert({
              wedding_id: currentWeddingId,
              user_id: profile.id,
              role: 'member',
            });

          if (insertError) throw insertError;

          // Refresh members list
          await get().fetchMembers();

          useToastStore.getState().addToast(
            `${profile.email} berhasil diundang!`,
            'success'
          );

          return { success: true };

        } catch (error: any) {
          console.error('Error inviting member:', error);
          return { success: false, error: error.message || 'Gagal mengundang member' };
        }
      },

      removeMember: async (userId: string) => {
        const { currentWeddingId, userRole } = get();
        const { user } = useAuthStore.getState();

        if (!user || !supabase || !currentWeddingId) {
          return { success: false, error: 'Tidak ada wedding aktif' };
        }

        if (userRole !== 'owner') {
          return { success: false, error: 'Hanya owner yang bisa menghapus member' };
        }

        // Jangan izinkan owner menghapus diri sendiri
        if (userId === user.id) {
          return { success: false, error: 'Owner tidak bisa menghapus diri sendiri' };
        }

        try {
          const { error } = await supabase
            .from('wedding_members')
            .delete()
            .eq('wedding_id', currentWeddingId)
            .eq('user_id', userId);

          if (error) throw error;

          // Refresh members list
          await get().fetchMembers();

          useToastStore.getState().addToast('Member berhasil dihapus', 'success');

          return { success: true };

        } catch (error: any) {
          console.error('Error removing member:', error);
          return { success: false, error: error.message || 'Gagal menghapus member' };
        }
      },

      fetchMembers: async () => {
        const { currentWeddingId } = get();
        if (!currentWeddingId || !supabase) return;

        try {
          const { data, error } = await supabase
            .from('wedding_members')
            .select('*, profiles(email, full_name)')
            .eq('wedding_id', currentWeddingId)
            .order('joined_at', { ascending: true });

          if (error) throw error;

          set({ members: data || [] });

        } catch (error: any) {
          console.error('Error fetching members:', error);
        }
      },

      setCurrentWeddingId: (id) => set({ currentWeddingId: id }),
      setUserRole: (role) => set({ userRole: role }),
      resetData: () => set({ 
        currentWeddingId: null, 
        userRole: null, 
        members: [] 
      }),
    }),
    {
      name: 'weddingplan-collaboration',
      partialize: (state) => ({
        currentWeddingId: state.currentWeddingId,
        userRole: state.userRole,
      }),
    }
  )
);
