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
    avatar_url?: string;
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
  createWedding: () => Promise<{ success: boolean; error?: string }>;
  inviteMember: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  fetchUserProfile: () => Promise<{ avatar_url?: string } | null>;
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

          // LANGKAH 1: Cek apakah user sudah di-invite ke wedding lain

          const { data: existingMembership, error: memberError } = await supabase
            .from('wedding_members')
            .select('wedding_id, role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (memberError && memberError.code !== 'PGRST116') {
            console.error('❌ Member query error:', memberError);
            throw memberError;
          }

          let weddingId: string | null = null;
          let role: 'owner' | 'member' | null = null;

          if (existingMembership) {
            // ✅ User sudah di-invite ke wedding lain, gunakan wedding_id yang ada
            weddingId = existingMembership.wedding_id;
            role = existingMembership.role as 'owner' | 'member';

          } else {
            // ❌ User belum punya wedding, biarkan null (tidak otomatis buat)

            weddingId = null;
            role = null;
          }

          // LANGKAH 2: Simpan ke store
          set({ 
            currentWeddingId: weddingId, 
            userRole: role,
            isLoading: false
          });


          
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

      createWedding: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          return { success: false, error: 'User tidak terautentikasi' };
        }

        if (!supabase) {
          return { success: false, error: 'Supabase tidak dikonfigurasi' };
        }

        try {
          set({ isLoading: true });

          
          // Panggil RPC untuk buat wedding baru
          const { data: newWeddingId, error: rpcError } = await supabase
            .rpc('create_initial_wedding');

          if (rpcError) {
            console.error('❌ RPC Error:', rpcError);
            set({ isLoading: false });
            return { success: false, error: 'Gagal membuat wedding: ' + (rpcError.message || 'Unknown error') };
          }

          if (!newWeddingId) {
            set({ isLoading: false });
            return { success: false, error: 'RPC tidak mengembalikan wedding_id' };
          }

          if (typeof newWeddingId !== 'string') {
            set({ isLoading: false });
            return { success: false, error: 'Invalid wedding_id type' };
          }

          // Simpan ke store
          set({ 
            currentWeddingId: newWeddingId, 
            userRole: 'owner',
            isLoading: false
          });


          
          // Fetch members
          await get().fetchMembers();
          
          return { success: true };
          
        } catch (error: any) {
          console.error('❌ Create wedding error:', error);
          set({ isLoading: false });
          return { success: false, error: error.message || 'Unknown error' };
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
            .select('*, profiles(email, full_name, avatar_url)')
            .eq('wedding_id', currentWeddingId)
            .order('joined_at', { ascending: true });

          if (error) throw error;

          set({ members: data || [] });

        } catch (error: any) {
          console.error('Error fetching members:', error);
        }
      },

      uploadAvatar: async (file: File) => {
        const { user } = useAuthStore.getState();
        
        if (!user || !supabase) {
          return { success: false, error: 'User tidak terautentikasi' };
        }

        try {
          // Validasi ketat: hanya PNG dan JPG
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
          const fileExtension = file.name.toLowerCase().split('.').pop();
          
          if (!allowedTypes.includes(file.type) || !['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
            return { success: false, error: 'Format file tidak valid. Hanya PNG dan JPG yang diperbolehkan.' };
          }

          // Validasi ketat: maksimal 2MB
          const maxSize = 2 * 1024 * 1024; // 2MB dalam bytes
          if (file.size > maxSize) {
            return { success: false, error: 'Ukuran file terlalu besar. Maksimal 2MB.' };
          }

          // Generate unique filename dengan timestamp untuk mencegah cache issue
          const fileExt = fileExtension;
          const timestamp = Date.now();
          const fileName = `${user.id}/avatar-${timestamp}.${fileExt}`;
          const filePath = `${fileName}`;

          // Upload ke Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, error: 'Gagal upload foto: ' + uploadError.message };
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          // Update profile dengan avatar_url
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          if (updateError) {
            console.error('Update profile error:', updateError);
            return { success: false, error: 'Gagal update profil: ' + updateError.message };
          }


          return { success: true, url: publicUrl };

        } catch (error: any) {
          console.error('Error uploading avatar:', error);
          return { success: false, error: error.message || 'Gagal upload foto' };
        }
      },

      fetchUserProfile: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user || !supabase) {
          return null;
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return null;
          }

          return data;

        } catch (error: any) {
          console.error('Error fetching profile:', error);
          return null;
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
