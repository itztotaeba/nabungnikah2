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
          console.warn('No user or supabase not configured');
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

          // User belum punya wedding, buat baru
          console.log('🆕 Creating new wedding for user');
          
          // Insert wedding_data baru
          const { data: newWedding, error: weddingError } = await supabase
            .from('wedding_data')
            .insert({
              user_id: user.id,
              settings: {},
              budget_items: [],
              savings: [],
              guests: [],
              vendors: [],
              tasks: [],
            })
            .select()
            .single();

          if (weddingError) throw weddingError;

          // Insert ke wedding_members sebagai owner
          const { error: memberInsertError } = await supabase
            .from('wedding_members')
            .insert({
              wedding_id: newWedding.id,
              user_id: user.id,
              role: 'owner',
            });

          if (memberInsertError) throw memberInsertError;

          console.log('✅ New wedding created:', newWedding.id);
          set({
            currentWeddingId: newWedding.id,
            userRole: 'owner',
            isLoading: false,
          });

          // Fetch members
          await get().fetchMembers();

        } catch (error: any) {
          console.error('Error initializing wedding:', error);
          set({ isLoading: false });
          useToastStore.getState().addToast(
            'Gagal menginisialisasi wedding: ' + (error.message || 'Unknown error'),
            'error'
          );
        }
      },

      initializeWeddingSession: async () => {
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            throw new Error('No user found');
          }

          // 1. Cari wedding_id dari tabel wedding_members
          const { data: memberData, error: memberError } = await supabase
            .from('wedding_members')
            .select('wedding_id, role')
            .eq('user_id', userData.user.id)
            .single();

          if (memberError && memberError.code !== 'PGRST116') {
            throw memberError;
          }

          let weddingId = memberData?.wedding_id;
          let role = memberData?.role || 'owner';

          // 2. Jika user baru dan belum punya wedding, buat wedding baru
          if (!weddingId) {
            const { data: newWedding, error: createError } = await supabase
              .from('wedding_data')
              .insert([{ 
                user_id: userData.user.id, // WAJIB untuk memenuhi RLS policy
                settings: {}, 
                budget_items: [], 
                savings: [], 
                guests: [], 
                vendors: [], 
                tasks: [] 
              }])
              .select()
              .single();
            
            if (createError) throw createError;
            weddingId = newWedding.id;

            // Daftarkan user sebagai owner di wedding_members
            const { error: memberInsertError } = await supabase
              .from('wedding_members')
              .insert({
                wedding_id: weddingId,
                user_id: userData.user.id,
                role: 'owner'
              });

            if (memberInsertError) throw memberInsertError;
          }

          // 3. Simpan ke store
          set({ 
            currentWeddingId: weddingId, 
            userRole: role as 'owner' | 'member'
          });

          console.log('✅ Wedding session initialized:', { weddingId, role });
          
        } catch (error: any) {
          console.error('Init session error:', error);
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
