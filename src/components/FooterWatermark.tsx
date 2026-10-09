import { Heart } from 'lucide-react';

/**
 * Footer Watermark "Made With Love"
 * Tampil di bagian bawah halaman utama (di atas bottom nav mobile).
 */
export default function FooterWatermark() {
  return (
    <footer className="w-full py-6 pb-24 lg:pb-8 select-none">
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <span className="font-medium">Made With</span>
        <Heart
          size={13}
          className="fill-rose-400 text-rose-400 animate-heartbeat inline-block"
        />
        <span className="font-heading italic font-semibold text-[#2F6A43]/70">
          Love
        </span>
      </div>
      <p className="text-center text-[10px] text-gray-300 mt-1">
        © {new Date().getFullYear()} Mahes&amp;Aira Budget and Wedding Plan
      </p>
    </footer>
  );
}
