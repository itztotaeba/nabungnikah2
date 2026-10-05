import { useState, useEffect } from 'react';
import { useCollaborationStore } from '../collaborationStore';
import { useAuthStore } from '../authStore';
import { useToastStore } from '../toastStore';
import { Users, Mail, Trash2, Crown, UserPlus, Loader2 } from 'lucide-react';

export default function CollaborationSection() {
  const { currentWeddingId, userRole, members, isLoading, initializeWedding, inviteMember, removeMember, fetchMembers } = useCollaborationStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize wedding saat component mount
  useEffect(() => {
    if (user && !currentWeddingId && !isLoading) {
      handleInitialize();
    }
  }, [user, currentWeddingId, isLoading]);

  // Fetch members saat component mount atau saat currentWeddingId berubah
  useEffect(() => {
    if (currentWeddingId) {
      fetchMembers();
    }
  }, [currentWeddingId, fetchMembers]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    await initializeWedding();
    setIsInitializing(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      addToast('Email harus diisi', 'error');
      return;
    }

    setIsInviting(true);
    const result = await inviteMember(inviteEmail.trim());
    setIsInviting(false);

    if (result.success) {
      setInviteEmail('');
    } else {
      addToast(result.error || 'Gagal mengundang member', 'error');
    }
  };

  const handleRemove = async (userId: string, email: string) => {
    if (!window.confirm(`Hapus akses untuk ${email}?`)) {
      return;
    }

    const result = await removeMember(userId);
    if (!result.success) {
      addToast(result.error || 'Gagal menghapus member', 'error');
    }
  };

  // Loading state
  if (isLoading || isInitializing) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#87A878]" />
          <span className="ml-3 text-gray-600">Menginisialisasi wedding...</span>
        </div>
      </div>
    );
  }

  // Belum ada wedding
  if (!currentWeddingId) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">Kolaborasi & Tim</h3>
            <p className="text-xs text-gray-400">Undang pasangan untuk mengelola wedding bersama</p>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Belum ada wedding yang terhubung</p>
          <button
            onClick={handleInitialize}
            className="px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            Buat Wedding Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-purple-500" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-gray-800">Kolaborasi & Tim</h3>
          <p className="text-xs text-gray-400">
            {userRole === 'owner' ? 'Anda adalah owner' : 'Anda adalah member'} • {members.length} anggota
          </p>
        </div>
      </div>

      {/* Invite Form (hanya untuk owner) */}
      {userRole === 'owner' && (
        <form onSubmit={handleInvite} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Undang Pasangan
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@pasangan.com"
                className="w-full pl-10 pr-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {isInviting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              <span>Undang</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pasangan harus sudah mendaftar akun terlebih dahulu
          </p>
        </form>
      )}

      {/* Members List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Anggota Tim</h4>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={20} className="animate-spin text-[#87A878]" />
            <span className="ml-2 text-sm text-gray-600">Memuat anggota...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && members.length === 0 && (
          <div className="text-center py-6 bg-[#FDFBF7] rounded-xl border border-[#E8E0D4]">
            <Users size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Anda adalah satu-satunya anggota di event ini.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Undang pasangan Anda untuk mulai berkolaborasi!
            </p>
          </div>
        )}

        {/* Members list */}
        {!isLoading && members.length > 0 && (
          <div className="space-y-2">
            {members.map((member) => {
              const isOwner = member.role === 'owner';
              const isCurrentUser = member.user_id === user?.id;
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D4]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isOwner ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {isOwner ? (
                        <Crown size={16} className="text-amber-600" />
                      ) : (
                        <span className="text-sm font-semibold text-blue-600">
                          {member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {member.profiles?.email || 'Unknown'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-500">(Anda)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isOwner ? 'Owner' : 'Member'} • Bergabung {new Date(member.joined_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Remove button (hanya untuk owner dan bukan diri sendiri) */}
                  {userRole === 'owner' && !isCurrentUser && (
                    <button
                      onClick={() => handleRemove(member.user_id, member.profiles?.email || '')}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus akses"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-xs text-purple-700">
          💡 <strong>Tips:</strong> Semua anggota tim dapat melihat dan mengedit data wedding secara real-time. Perubahan akan otomatis tersinkron ke semua perangkat.
        </p>
      </div>
    </div>
  );
}
