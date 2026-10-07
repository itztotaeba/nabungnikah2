/**
 * auditTrail.ts
 * 
 * Helper functions untuk Audit Trail dan Conflict Detection
 * Mengatasi masalah "Last-Write-Wins" pada kolaborasi multi-user
 */

import { useAuthStore } from '../authStore';

/**
 * Get audit metadata untuk item yang sedang diubah
 * @returns Object dengan updatedBy dan updatedAt
 */
export function getAuditMetadata(): { updatedBy: string; updatedAt: string } {
  const user = useAuthStore.getState().user;
  
  // Ambil username sebelum @ dari email
  let username = 'Sistem';
  if (user?.email) {
    const emailParts = user.email.split('@');
    username = emailParts[0]; // Ambil bagian sebelum @
  }
  
  return {
    updatedBy: username,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Detect conflict antara local data dan remote data
 * @param localItem - Item dari local state
 * @param remoteItem - Item dari remote/cloud
 * @returns true jika ada konflik, false jika tidak
 */
export function detectConflict<T extends { id: string; updatedAt?: string; updatedBy?: string }>(
  localItem: T,
  remoteItem: T
): boolean {
  // Jika salah satu tidak punya updatedAt, tidak ada konflik
  if (!localItem.updatedAt || !remoteItem.updatedAt) {
    return false;
  }

  // Jika updatedAt sama, tidak ada konflik
  if (localItem.updatedAt === remoteItem.updatedAt) {
    return false;
  }

  // Jika updatedBy sama, tidak ada konflik (user yang sama mengedit)
  if (localItem.updatedBy === remoteItem.updatedBy) {
    return false;
  }

  // Jika berbeda, ada konflik
  return true;
}

/**
 * Resolve conflict dengan strategi "Remote Wins" (data dari cloud lebih baru)
 * @param localItem - Item dari local state
 * @param remoteItem - Item dari remote/cloud
 * @returns Item yang menang (remote jika lebih baru)
 */
export function resolveConflict<T extends { id: string; updatedAt?: string; updatedBy?: string }>(
  localItem: T,
  remoteItem: T
): T {
  // Jika salah satu tidak punya updatedAt, gunakan yang punya
  if (!localItem.updatedAt) return remoteItem;
  if (!remoteItem.updatedAt) return localItem;

  // Bandingkan timestamp, yang lebih baru menang
  const localTime = new Date(localItem.updatedAt).getTime();
  const remoteTime = new Date(remoteItem.updatedAt).getTime();

  return remoteTime >= localTime ? remoteItem : localItem;
}

/**
 * Merge array items dengan conflict detection
 * @param localItems - Array dari local state
 * @param remoteItems - Array dari remote/cloud
 * @param onConflict - Callback saat ada konflik (optional)
 * @returns Merged array
 */
export function mergeWithConflictDetection<T extends { id: string; updatedAt?: string; updatedBy?: string }>(
  localItems: T[],
  remoteItems: T[],
  onConflict?: (localItem: T, remoteItem: T) => void
): T[] {
  const merged = new Map<string, T>();

  // Add all remote items first
  remoteItems.forEach(item => {
    merged.set(item.id, item);
  });

  // Process local items
  localItems.forEach(localItem => {
    const remoteItem = merged.get(localItem.id);

    if (!remoteItem) {
      // Item hanya ada di local, tambahkan
      merged.set(localItem.id, localItem);
    } else {
      // Item ada di kedua sisi, cek konflik
      if (detectConflict(localItem, remoteItem)) {
        // Ada konflik, panggil callback jika ada
        if (onConflict) {
          onConflict(localItem, remoteItem);
        }

        // Resolve conflict (remote wins)
        const resolved = resolveConflict(localItem, remoteItem);
        merged.set(localItem.id, resolved);
      }
      // Jika tidak ada konflik, remote item sudah ada di map
    }
  });

  return Array.from(merged.values());
}

/**
 * Format audit trail untuk display
 * @param updatedBy - Email user
 * @param updatedAt - ISO timestamp
 * @returns Formatted string
 */
export function formatAuditInfo(updatedBy?: string, updatedAt?: string): string {
  if (!updatedBy || !updatedAt) {
    return 'Belum ada perubahan';
  }

  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo: string;
  if (diffMins < 1) {
    timeAgo = 'Baru saja';
  } else if (diffMins < 60) {
    timeAgo = `${diffMins} menit lalu`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} jam lalu`;
  } else {
    timeAgo = `${diffDays} hari lalu`;
  }

  return `Diubah oleh ${updatedBy} • ${timeAgo}`;
}
