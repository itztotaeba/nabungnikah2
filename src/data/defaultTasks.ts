import { Task } from '../types';

/**
 * Default tasks template untuk perencanaan pernikahan
 * Berisi checklist standar yang direkomendasikan untuk calon pengantin
 */
export const defaultTasks: Omit<Task, 'id' | 'isCompleted' | 'completedAt'>[] = [
  // ============================================
  // 12 BULAN SEBELUM
  // ============================================
  {
    title: 'Tentukan tanggal pernikahan',
    description: 'Pilih tanggal yang sesuai untuk kedua belah pihak keluarga',
    category: 'Administrasi',
    monthsBefore: 12,
    isDefault: true,
  },
  {
    title: 'Buat anggaran awal',
    description: 'Hitung estimasi budget total pernikahan',
    category: 'Administrasi',
    monthsBefore: 12,
    isDefault: true,
  },
  {
    title: 'Booking venue/gedung',
    description: 'Survey dan booking venue pernikahan',
    category: 'Vendor',
    monthsBefore: 12,
    isDefault: true,
  },
  {
    title: 'Tentukan konsep pernikahan',
    description: 'Adat, modern, outdoor, indoor, dll',
    category: 'Dekorasi',
    monthsBefore: 12,
    isDefault: true,
  },

  // ============================================
  // 9 BULAN SEBELUM
  // ============================================
  {
    title: 'Booking WO atau paket All-in',
    description: 'Pilih wedding organizer atau paket lengkap',
    category: 'Vendor',
    monthsBefore: 9,
    isDefault: true,
  },
  {
    title: 'Booking MUA (Makeup Artist)',
    description: 'Coba makeup dan pilih stylist',
    category: 'Pakaian',
    monthsBefore: 9,
    isDefault: true,
  },
  {
    title: 'Booking fotografer & videografer',
    description: 'Pilih paket dokumentasi pernikahan',
    category: 'Vendor',
    monthsBefore: 9,
    isDefault: true,
  },
  {
    title: 'Buat daftar tamu awal',
    description: 'List nama-nama tamu yang akan diundang',
    category: 'Administrasi',
    monthsBefore: 9,
    isDefault: true,
  },

  // ============================================
  // 6 BULAN SEBELUM
  // ============================================
  {
    title: 'Pilih gaun/jas pengantin',
    description: 'Coba berbagai model dan pilih yang terbaik',
    category: 'Pakaian',
    monthsBefore: 6,
    isDefault: true,
  },
  {
    title: 'Pilih gaun bridesmaid & jas groomsmen',
    description: 'Koordinasi dengan teman/keluarga dekat',
    category: 'Pakaian',
    monthsBefore: 6,
    isDefault: true,
  },
  {
    title: 'Booking dekorasi & bunga',
    description: 'Pilih tema dan vendor dekorasi',
    category: 'Dekorasi',
    monthsBefore: 6,
    isDefault: true,
  },
  {
    title: 'Booking entertainment',
    description: 'MC, band, atau DJ untuk acara',
    category: 'Vendor',
    monthsBefore: 6,
    isDefault: true,
  },

  // ============================================
  // 3 BULAN SEBELUM
  // ============================================
  {
    title: 'Desain & cetak undangan',
    description: 'Buat desain undangan dan cetak',
    category: 'Undangan',
    monthsBefore: 3,
    isDefault: true,
  },
  {
    title: 'Pilih cincin pernikahan',
    description: 'Beli cincin untuk akad/nikah',
    category: 'Administrasi',
    monthsBefore: 3,
    isDefault: true,
  },
  {
    title: 'Booking katering',
    description: 'Pilih menu dan vendor katering',
    category: 'Vendor',
    monthsBefore: 3,
    isDefault: true,
  },
  {
    title: 'Pilih souvenir',
    description: 'Pilih dan pesan souvenir untuk tamu',
    category: 'Lainnya',
    monthsBefore: 3,
    isDefault: true,
  },

  // ============================================
  // 1 BULAN SEBELUM
  // ============================================
  {
    title: 'Sebar undangan',
    description: 'Kirim undangan ke semua tamu',
    category: 'Undangan',
    monthsBefore: 1,
    isDefault: true,
  },
  {
    title: 'Final fitting pakaian',
    description: 'Coba ulang gaun/jas untuk penyesuaian',
    category: 'Pakaian',
    monthsBefore: 1,
    isDefault: true,
  },
  {
    title: 'Meeting teknis dengan vendor',
    description: 'Koordinasi detail dengan semua vendor',
    category: 'Vendor',
    monthsBefore: 1,
    isDefault: true,
  },
  {
    title: 'Siapkan dokumen administrasi',
    description: 'KTP, KK, surat nikah, dll',
    category: 'Administrasi',
    monthsBefore: 1,
    isDefault: true,
  },

  // ============================================
  // 1 MINGGU SEBELUM (0.25 BULAN)
  // ============================================
  {
    title: 'Konfirmasi kehadiran tamu',
    description: 'Hubungi tamu yang belum konfirmasi',
    category: 'Undangan',
    monthsBefore: 0,
    isDefault: true,
  },
  {
    title: 'Siapkan amplop & angpao',
    description: 'Siapkan amplop untuk vendor dan keluarga',
    category: 'Administrasi',
    monthsBefore: 0,
    isDefault: true,
  },
  {
    title: 'Gladi bersih',
    description: 'Rehearsal acara pernikahan',
    category: 'Lainnya',
    monthsBefore: 0,
    isDefault: true,
  },
  {
    title: 'Istirahat cukup',
    description: 'Jaga kesehatan dan istirahat yang cukup',
    category: 'Lainnya',
    monthsBefore: 0,
    isDefault: true,
  },
];
