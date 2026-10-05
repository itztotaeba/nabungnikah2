/**
 * timeAgo.ts
 * 
 * Helper function untuk format waktu relatif menggunakan date-fns
 */

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format timestamp ke format "time ago" dalam Bahasa Indonesia
 * @param dateString - ISO timestamp string
 * @returns Formatted string (contoh: "5 menit yang lalu")
 */
export const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'Belum pernah diubah';
  
  try {
    const date = new Date(dateString);
    
    // Validasi date
    if (isNaN(date.getTime())) {
      return 'Waktu tidak valid';
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: id 
    });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Waktu tidak valid';
  }
};

/**
 * Format audit info lengkap untuk display
 * @param updatedBy - Email user yang mengubah
 * @param updatedAt - ISO timestamp
 * @returns Formatted string (contoh: "✏️ user@example.com • 5 menit yang lalu")
 */
export const formatAuditInfo = (updatedBy?: string, updatedAt?: string): string => {
  if (!updatedBy && !updatedAt) {
    return 'Belum pernah diubah';
  }

  const user = updatedBy || 'Sistem';
  const time = formatTimeAgo(updatedAt);

  return `✏️ ${user} • ${time}`;
};
