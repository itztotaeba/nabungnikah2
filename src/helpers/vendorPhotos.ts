/**
 * helpers/vendorPhotos.ts
 *
 * Utilitas untuk foto contoh vendor (maksimal 5 foto per vendor).
 * - Kompres gambar di browser (canvas) agar hemat storage/localStorage
 * - Upload ke Supabase Storage (bucket "vendor-photos") jika cloud sync tersedia
 * - Fallback: simpan sebagai base64 data URL (mode offline/local)
 */

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../authStore';
import type { VendorPhoto } from '../types';

export const MAX_VENDOR_PHOTOS = 5;
const BUCKET = 'vendor-photos';
const MAX_INPUT_SIZE = 15 * 1024 * 1024; // 15MB batas file mentah
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface VendorPhotoValidationResult {
  valid: boolean;
  error?: string;
}

/** Validasi tipe & ukuran file sebelum diproses */
export function validateVendorPhotoFile(file: File): VendorPhotoValidationResult {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const typeOk =
    ACCEPTED_TYPES.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  if (!typeOk) {
    return { valid: false, error: `Format "${file.name}" tidak didukung. Gunakan JPG/PNG/WebP.` };
  }
  if (file.size > MAX_INPUT_SIZE) {
    return { valid: false, error: `Ukuran foto "${file.name}" terlalu besar (maks 15MB).` };
  }
  return { valid: true };
}

/** Baca file sebagai DataURL (base64) */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

/** Muat HTMLImageElement dari src (data URL atau blob URL) */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}

/**
 * Kompres gambar: resize maksimal `maxDim` px (terpanjang), encode JPEG quality `quality`.
 * Hasilnya base64 data URL yang jauh lebih kecil dari file asli.
 */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.8
): Promise<{ dataUrl: string; blob: Blob }> {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung browser ini');
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
  );
  if (!blob) throw new Error('Gagal mengompres gambar');

  const compressedDataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca hasil kompresi'));
    reader.readAsDataURL(blob);
  });

  return { dataUrl: compressedDataUrl, blob };
}

/** Apakah cloud sync (Supabase) tersedia dan user sudah login? */
function isCloudAvailable(): boolean {
  if (!supabase) return false;
  const { user } = useAuthStore.getState();
  return !!user;
}

/**
 * Proses satu file menjadi VendorPhoto.
 * Coba upload ke Supabase Storage; jika gagal/tidak tersedia, fallback ke base64.
 */
export async function processVendorPhotoFile(file: File): Promise<VendorPhoto> {
  const validation = validateVendorPhotoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { dataUrl, blob } = await compressImage(file);
  const base: Omit<VendorPhoto, 'url'> = {
    id: `vp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fileName: file.name,
    createdAt: new Date().toISOString(),
  };

  if (isCloudAvailable()) {
    try {
      const { user } = useAuthStore.getState();
      const filePath = `${user!.id}/${base.id}.jpg`;
      const { error: uploadError } = await supabase!.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = supabase!.storage
          .from(BUCKET)
          .getPublicUrl(filePath);
        return { ...base, url: urlData.publicUrl };
      }
      console.warn('Upload foto vendor ke storage gagal, fallback ke base64:', uploadError.message);
    } catch (err) {
      // Jangan pernah mengganggu alur input: fallback diam-diam ke base64
      console.warn('Upload foto vendor error, fallback ke base64:', err);
    }
  }

  return { ...base, url: dataUrl };
}

/** Hapus file dari Supabase Storage (best-effort, aman dipanggil untuk data URL) */
export async function deleteVendorPhotoFromStorage(photo: VendorPhoto): Promise<void> {
  if (!isCloudAvailable() || !photo.url.startsWith('http')) return;
  try {
    const marker = `/${BUCKET}/`;
    const idx = photo.url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(photo.url.slice(idx + marker.length));
    await supabase!.storage.from(BUCKET).remove([path]);
  } catch (err) {
    console.warn('Gagal menghapus foto dari storage (diabaikan):', err);
  }
}
