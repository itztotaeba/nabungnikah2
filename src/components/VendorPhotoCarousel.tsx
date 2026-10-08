/**
 * VendorPhotoCarousel.tsx
 *
 * Carousel foto gaya postingan Instagram:
 * - Slide per slide (tidak tampil semua sekaligus)
 * - Bisa digeser (swipe) di layar sentuh, tombol panah di desktop
 * - Dot indicator + counter "2/5"
 */

import { useEffect, useRef, useState } from 'react';
import type { VendorPhoto } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  photos: VendorPhoto[];
  className?: string; // kelas tambahan untuk kontainer
}

export default function VendorPhotoCarousel({ photos, className = '' }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const count = photos.length;

  // Jaga index tetap valid jika daftar foto berubah
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  if (count === 0) return null;

  const goTo = (i: number) => setIndex(Math.min(count - 1, Math.max(0, i)));
  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const goNext = () => setIndex((i) => (i < count - 1 ? i + 1 : i));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      {/* Track geser halus ala Instagram */}
      <div
        className="flex transition-transform duration-300 ease-out select-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((photo) => (
          <div key={photo.id} className="w-full flex-shrink-0">
            <img
              src={photo.url}
              alt={photo.fileName || 'Foto contoh vendor'}
              className="w-full h-64 sm:h-80 object-contain bg-black"
              draggable={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Counter sudut kanan atas (ala Instagram) */}
      {count > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium pointer-events-none">
          {index + 1}/{count}
        </div>
      )}

      {/* Panah kiri/kanan (desktop) */}
      {count > 1 && index > 0 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Foto sebelumnya"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-800" />
        </button>
      )}
      {count > 1 && index < count - 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Foto berikutnya"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronRight size={16} className="text-gray-800" />
        </button>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Ke foto ${i + 1}`}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
