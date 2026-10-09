import { X, LogOut } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal konfirmasi untuk exit PWA
 * Ditampilkan saat user press back button di homepage
 */
export default function ExitConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: ExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
              <LogOut size={20} className="text-amber-600" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              Keluar Aplikasi?
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin keluar dari M&A Wedding Plan? Data Anda akan tetap tersimpan.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-md border-[#E5DED0] shadow-sm transition-all text-sm font-medium"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
