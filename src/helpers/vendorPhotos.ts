/**
 * Helper untuk upload & hapus foto contoh vendor.
 * - Jika Supabase configured: upload ke storage bucket "vendor-photos" (public).
 * - Fallback: simpan sebagai data URL (diresize via canvas) agar tetap tersimpan di LocalStorage store.
 */
import { supabase } from '../lib/supabase';

export const MAX_VENDOR_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB sebelum diresize
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const RESIZE_MAX_DIM = 1200;

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format file tidak valid. Hanya PNG, JPG, WEBP yang diperbolehkan.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran file terlalu besar. Maksimal 5MB per foto.';
  }
  return null;
}

/** Resize gambar via canvas agar hemat kuota/penyimpanan, mengembalikan File JPEG. */
async function resizeImageFile(file: File): Promise<File> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > RESIZE_MAX_DIM || height > RESIZE_MAX_DIM) {
    if (width >= height) {
      height = Math.round((height * RESIZE_MAX_DIM) / width);
      width = RESIZE_MAX_DIM;
    } else {
      width = Math.round((width * RESIZE_MAX_DIM) / height);
      height = RESIZE_MAX_DIM;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', 0.85)
  );
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}

/**
 * Upload satu foto vendor. Mengembalikan URL foto (Supabase public URL atau data URL).
 */
export async function uploadVendorPhoto(file: File): Promise<string> {
  const resized = await resizeImageFile(file);

  if (supabase) {
    const ext = resized.name.split('.').pop() || 'jpg';
    const path = `vendor-photos/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('vendor-photos')
      .upload(path, resized, { contentType: resized.type, upsert: false });

    if (error) {
      // Bucket belum dibuat / masalah storage -> fallback ke data URL lokal
      console.warn('Upload ke Supabase gagal, pakai penyimpanan lokal:', error.message);
      return readFileAsDataUrl(resized);
    }
    const { data } = supabase.storage.from('vendor-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  // Tanpa Supabase: simpan sebagai data URL (tersimpan bersama vendor di LocalStorage)
  return readFileAsDataUrl(resized);
}

/** Hapus foto dari Supabase storage jika berupa URL bucket (abaikan untuk data URL). */
export async function deleteVendorPhoto(url: string): Promise<void> {
  if (!supabase || url.startsWith('data:')) return;
  try {
    const marker = '/vendor-photos/';
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    await supabase.storage.from('vendor-photos').remove([path]);
  } catch (e) {
    console.warn('Gagal menghapus foto dari storage:', e);
  }
}
