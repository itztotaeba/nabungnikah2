import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface VendorPhotoCarouselProps {
  photos: string[];
  vendorName?: string;
}

/**
 * Carousel foto gaya Instagram post: satu foto tampil, dot indicator,
 * tombol prev/next, swipe support, dan klik untuk fullscreen.
 */
export default function VendorPhotoCarousel({ photos, vendorName }: VendorPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const safeIndex = Math.min(index, photos.length - 1);
  const goTo = (i: number) => setIndex(((i + photos.length) % photos.length));
  const next = () => goTo(safeIndex + 1);
  const prev = () => goTo(safeIndex - 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    setTouchStartX(null);
  };

  const counterBadge = (
    <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
      {safeIndex + 1}/{photos.length}
    </span>
  );

  const dots = (
    <div className="flex items-center justify-center gap-1.5 mt-2">
      {photos.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={`Foto ${i + 1}`}
          className={`h-1.5 rounded-full transition-all ${
            i === safeIndex ? 'w-5 bg-[#B76E79]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="select-none">
        <div
          className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden group cursor-zoom-in"
          onClick={() => setFullscreen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track foto (fade transition ala IG) */}
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${vendorName || 'Vendor'} ${i + 1}`}
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                i === safeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {counterBadge}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 active:opacity-100 hover:bg-black/60 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Foto berikutnya"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 active:opacity-100 hover:bg-black/60 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
        {photos.length > 1 && dots}
      </div>

      {/* Fullscreen viewer */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(false);
            }}
          >
            <X size={22} />
          </button>

          <img
            src={photos[safeIndex]}
            alt={`${vendorName || 'Vendor'} ${safeIndex + 1}`}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[85vh] object-contain select-none"
          />

          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/80 text-xs font-medium">
              {safeIndex + 1} / {photos.length}
            </span>
            {photos.length > 1 && (
              <div className="flex items-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto sebelumnya"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                aria-label="Foto berikutnya"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
