/**
 * Vendor Checklist Definitions
 * 
 * Berisi daftar checklist untuk setiap kategori vendor pernikahan
 */

import { VendorCategory } from '../types';

export interface ChecklistItem {
  id: string;
  question: string;
  description?: string;
}

export const vendorChecklists: Record<VendorCategory, ChecklistItem[]> = {
  'WO': [
    { id: 'full_day', question: 'Full day coverage?', description: 'WO mendampingi dari pagi sampai malam' },
    { id: 'partial', question: 'Partial day?', description: 'WO hanya mendampingi di waktu tertentu' },
    { id: 'vendor_coordination', question: 'Koordinasi semua vendor?', description: 'WO mengatur timeline dan koordinasi dengan semua vendor' },
    { id: 'rundown', question: 'Termasuk pembuatan rundown?', description: 'WO membuat rundown acara detail' },
    { id: 'briefing', question: 'Briefing H-1?', description: 'Ada briefing dengan pengantin H-1 acara' },
    { id: 'team_size', question: 'Jumlah tim WO?', description: 'Berapa orang tim WO yang datang' },
    { id: 'pre_meeting', question: 'Meeting pra-event?', description: 'Ada meeting persiapan sebelum acara' },
    { id: 'emergency_kit', question: 'Emergency kit?', description: 'WO membawa peralatan darurat' },
  ],
  'Katering': [
    { id: 'appetizer', question: 'Termasuk appetizer?', description: 'Hidangan pembuka' },
    { id: 'main_course', question: 'Termasuk main course?', description: 'Hidangan utama' },
    { id: 'dessert', question: 'Termasuk dessert?', description: 'Hidangan penutup' },
    { id: 'wedding_cake', question: 'Termasuk wedding cake?', description: 'Kue pernikahan' },
    { id: 'standing_buffet', question: 'Standing buffet?', description: 'Hidangan standing buffet' },
    { id: 'prasmanan', question: 'Prasmanan?', description: 'Hidangan prasmanan' },
    { id: 'tasting', question: 'Free trial tasting?', description: 'Ada sesi percobaan makanan gratis' },
    { id: 'tableware', question: 'Termasuk peralatan makan?', description: 'Piring, sendok, garpu, gelas' },
    { id: 'waiter', question: 'Termasuk waiter/waitress?', description: 'Pramusaji untuk melayani tamu' },
    { id: 'portion_count', question: 'Jumlah porsi?', description: 'Berapa porsi yang disediakan' },
  ],
  'Venue': [
    { id: 'capacity', question: 'Kapasitas maksimal?', description: 'Berapa tamu yang bisa ditampung' },
    { id: 'parking', question: 'Termasuk parking?', description: 'Area parkir tersedia' },
    { id: 'ac', question: 'Termasuk AC?', description: 'Air conditioning tersedia' },
    { id: 'sound_system', question: 'Termasuk sound system?', description: 'Sound system dan microphone' },
    { id: 'lighting', question: 'Termasuk lighting?', description: 'Pencahayaan venue' },
    { id: 'duration', question: 'Durasi sewa?', description: 'Berapa jam sewa venue' },
    { id: 'cleaning', question: 'Termasuk cleaning?', description: 'Kebersihan venue setelah acara' },
    { id: 'backup_plan', question: 'Backup plan hujan?', description: 'Ada rencana cadangan jika hujan (outdoor)' },
    { id: 'bridal_room', question: 'Bridal room?', description: 'Ruang pengantin tersedia' },
    { id: 'loading_area', question: 'Loading area?', description: 'Area bongkar muat vendor' },
  ],
  'MUA': [
    { id: 'bride_makeup', question: 'Makeup pengantin wanita?', description: 'Makeup untuk bride' },
    { id: 'groom_makeup', question: 'Makeup pengantin pria?', description: 'Makeup untuk groom' },
    { id: 'bridesmaid_makeup', question: 'Makeup bridesmaid?', description: 'Makeup untuk bridesmaid' },
    { id: 'family_makeup', question: 'Makeup keluarga?', description: 'Makeup untuk keluarga pengantin' },
    { id: 'touchup', question: 'Berapa kali touch-up?', description: 'Jumlah touch-up selama acara' },
    { id: 'hairdo', question: 'Termasuk hairdo?', description: 'Tata rambut termasuk' },
    { id: 'trial_makeup', question: 'Trial makeup?', description: 'Ada sesi trial makeup sebelum acara' },
    { id: 'products', question: 'Produk yang digunakan?', description: 'Brand makeup yang digunakan' },
    { id: 'false_lashes', question: 'Termasuk false lashes?', description: 'Bulu mata palsu termasuk' },
    { id: 'hijab_styling', question: 'Hijab styling?', description: 'Tata hijab untuk pengantin muslimah' },
  ],
  'Fotografi': [
    { id: 'photographer_count', question: 'Jumlah fotografer?', description: 'Berapa fotografer yang datang' },
    { id: 'duration', question: 'Durasi coverage?', description: 'Berapa jam coverage fotografi' },
    { id: 'prewedding', question: 'Termasuk pre-wedding?', description: 'Sesi foto pre-wedding termasuk' },
    { id: 'album', question: 'Termasuk album?', description: 'Album foto fisik termasuk' },
    { id: 'print', question: 'Termasuk cetak foto?', description: 'Cetak foto dalam ukuran tertentu' },
    { id: 'digital_files', question: 'File digital?', description: 'File foto digital resolusi tinggi' },
    { id: 'drone', question: 'Termasuk drone?', description: 'Foto/video menggunakan drone' },
    { id: 'same_day_edit', question: 'Same day edit?', description: 'Video highlight diputar di hari yang sama' },
    { id: 'photobooth', question: 'Photobooth?', description: 'Photobooth untuk tamu tersedia' },
    { id: 'canvas', question: 'Canvas/print besar?', description: 'Cetak foto ukuran besar untuk dekorasi' },
  ],
  'Dekorasi': [
    { id: 'fresh_flowers', question: 'Bunga segar?', description: 'Menggunakan bunga segar' },
    { id: 'artificial_flowers', question: 'Bunga artificial?', description: 'Menggunakan bunga buatan' },
    { id: 'backdrop', question: 'Termasuk backdrop?', description: 'Backdrop untuk foto/pelaminan' },
    { id: 'pelaminan', question: 'Dekorasi pelaminan?', description: 'Dekorasi area pelaminan' },
    { id: 'guest_tables', question: 'Dekorasi meja tamu?', description: 'Dekorasi meja tamu dan centerpiece' },
    { id: 'lighting', question: 'Lighting dekorasi?', description: 'Lighting tambahan untuk dekorasi' },
    { id: 'signage', question: 'Signage/welcome sign?', description: 'Papan selamat datang dan signage' },
    { id: 'entrance', question: 'Dekorasi entrance?', description: 'Dekorasi area masuk' },
    { id: 'aisle', question: 'Dekorasi aisle?', description: 'Dekorasi jalan menuju pelaminan' },
    { id: 'photo_area', question: 'Photo area?', description: 'Area khusus untuk foto' },
  ],
  'Entertainment': [
    { id: 'band', question: 'Live band?', description: 'Band musik live' },
    { id: 'dj', question: 'DJ?', description: 'DJ untuk musik' },
    { id: 'traditional', question: 'Tarian tradisional?', description: 'Pertunjukan tarian tradisional' },
    { id: 'duration', question: 'Durasi entertainment?', description: 'Berapa lama entertainment tampil' },
    { id: 'sound_system', question: 'Sound system termasuk?', description: 'Sound system untuk entertainment' },
    { id: 'mc', question: 'MC termasuk?', description: 'Master of Ceremony termasuk' },
    { id: 'games', question: 'Games/entertainment tamu?', description: 'Games untuk menghibur tamu' },
    { id: 'fireworks', question: 'Kembang api?', description: 'Pertunjukan kembang api' },
    { id: 'traditional_music', question: 'Musik tradisional?', description: 'Gamelan atau musik tradisional lain' },
    { id: 'acoustic', question: 'Akustik?', description: 'Penyanyi akustik' },
  ],
  'Lainnya': [
    { id: 'custom_1', question: 'Fitur khusus 1?', description: 'Fitur atau layanan khusus pertama' },
    { id: 'custom_2', question: 'Fitur khusus 2?', description: 'Fitur atau layanan khusus kedua' },
    { id: 'custom_3', question: 'Fitur khusus 3?', description: 'Fitur atau layanan khusus ketiga' },
    { id: 'additional_services', question: 'Layanan tambahan?', description: 'Layanan tambahan yang tersedia' },
    { id: 'package_details', question: 'Detail paket?', description: 'Detail lengkap paket yang ditawarkan' },
  ],
};

/**
 * Get checklist items untuk kategori vendor tertentu
 */
export function getChecklistForCategory(category: VendorCategory): ChecklistItem[] {
  return vendorChecklists[category] || [];
}

/**
 * Get default checklist values (semua false)
 */
export function getDefaultChecklistValues(category: VendorCategory): Record<string, boolean> {
  const items = getChecklistForCategory(category);
  const values: Record<string, boolean> = {};
  items.forEach(item => {
    values[item.id] = false;
  });
  return values;
}

/**
 * Count checked items
 */
export function countCheckedItems(checklist: Record<string, boolean> | undefined): number {
  if (!checklist) return 0;
  return Object.values(checklist).filter(value => value === true).length;
}
