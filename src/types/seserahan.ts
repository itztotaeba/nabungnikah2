/**
 * types/seserahan.ts
 *
 * Type definitions untuk fitur Daftar Seserahan.
 * Dipisah dari types.ts agar tidak mengganggu type yang sudah ada.
 *
 * Terinspirasi dari konsep halaman seserahan amarawedding.id:
 * - Barang dicatat per baki/kategori (Alat Sholat, Masakan & Buah, dll)
 * - Estimasi biaya per barang + progres belanja (sudah dibeli / belum)
 * - Brand/merek, tautan belanja, catatan, badge label (misal "Rekomendasi")
 */

// Kategori baki/kotak seserahan (mengikuti adat Jawa/Sunda pada umumnya)
export type SeserahanCategory =
  | 'Alat Sholat'
  | 'Pakaian & Busana'
  | 'Perhiasan'
  | 'Masakan & Buah'
  | 'Paket Makanan'
  | 'Alat Rumahan'
  | 'Kosmetik & Skincare'
  | 'Sepatu & Tas'
  | 'Lainnya';

export const SESERAHAN_CATEGORIES: SeserahanCategory[] = [
  'Alat Sholat',
  'Pakaian & Busana',
  'Perhiasan',
  'Masakan & Buah',
  'Paket Makanan',
  'Alat Rumahan',
  'Kosmetik & Skincare',
  'Sepatu & Tas',
  'Lainnya',
];

export interface SeserahanItem {
  id: string;
  title: string; // Nama barang, misal: "Mukena bordir"
  category: SeserahanCategory; // Baki/kategori penempatan
  brand?: string; // Brand/merk toko (opsional)
  estimatedCost: number; // Estimasi harga barang
  isBought: boolean; // Status sudah terbeli (auto-sync ke status anggaran)
  link?: string; // Tautan belanja (Shopee/Tokopedia/dll)
  label?: string; // Badge label, misal "Rekomendasi"
  notes?: string; // Catatan tambahan
  updatedBy?: string; // Email user yang terakhir mengubah (audit trail)
  updatedAt?: string; // ISO timestamp (audit trail)
}
