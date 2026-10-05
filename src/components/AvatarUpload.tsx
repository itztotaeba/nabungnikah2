'use client';

import { useState, useRef, useEffect } from 'react';
import { useCollaborationStore } from '../collaborationStore';
import { useAuthStore } from '../authStore';
import { useToastStore } from '../toastStore';
import { Upload, User, Camera, X } from 'lucide-react';

export default function AvatarUpload() {
  const { uploadAvatar, fetchUserProfile } = useCollaborationStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile saat component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await fetchUserProfile();
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    };
    loadProfile();
  }, [user, fetchUserProfile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ketat: hanya PNG dan JPG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(file.type) || !['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
      addToast('Format file tidak valid. Hanya PNG dan JPG yang diperbolehkan.', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validasi ketat: maksimal 1MB
    const maxSize = 1 * 1024 * 1024; // 1MB dalam bytes
    if (file.size > maxSize) {
      addToast('Ukuran file terlalu besar. Maksimal 1MB.', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    const result = await uploadAvatar(file);
    setIsUploading(false);

    if (result.success && result.url) {
      setAvatarUrl(result.url);
      addToast('Foto profil berhasil diupdate!', 'success');
    } else {
      addToast(result.error ?? 'Gagal upload foto', 'error');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setIsUploading(true);
    
    try {
      // Import supabase dynamically
      const { supabase } = await import('../lib/supabase');
      
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      
      // Update profile dengan avatar_url null
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      setIsUploading(false);

      if (error) {
        addToast('Gagal menghapus foto: ' + error.message, 'error');
      } else {
        setAvatarUrl(null);
        addToast('Foto profil berhasil dihapus', 'success');
      }
    } catch (error: any) {
      setIsUploading(false);
      addToast('Gagal menghapus foto: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  // Generate initial avatar dari email
  const getInitialAvatar = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Camera size={20} className="text-purple-500" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-gray-800">Foto Profil</h3>
          <p className="text-xs text-gray-400">Upload foto profil Anda</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#2F6A43] shadow-lg bg-gray-100">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2F6A43] to-[#1E4A2E] text-white text-3xl font-bold">
                {getInitialAvatar()}
              </div>
            )}
          </div>
          
          {/* Remove button */}
          {avatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
              title="Hapus foto"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2F6A43] to-[#1E4A2E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Mengupload...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>{avatarUrl ? 'Ganti Foto' : 'Upload Foto'}</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Format: PNG, JPG. Maksimal 1MB.
          </p>
        </div>
      </div>
    </div>
  );
}
