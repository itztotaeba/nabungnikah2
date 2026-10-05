'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverride: () => void;
  itemName: string;
  itemType: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export default function ConflictModal({
  isOpen,
  onClose,
  onOverride,
  itemName,
  itemType,
  lastUpdatedBy,
  lastUpdatedAt,
}: ConflictModalProps) {
  if (!isOpen) return null;

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'waktu tidak diketahui';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'waktu tidak valid';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-gray-900">
              Konflik Terdeteksi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-900 font-medium mb-2">
              ⚠️ Data ini telah diubah oleh user lain
            </p>
            <div className="space-y-1 text-xs text-amber-800">
              <p>
                <strong>{itemType}:</strong> {itemName}
              </p>
              {lastUpdatedBy && (
                <p>
                  <strong>Diubah oleh:</strong> {lastUpdatedBy}
                </p>
              )}
              {lastUpdatedAt && (
                <p>
                  <strong>Waktu:</strong> {formatTime(lastUpdatedAt)}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Perubahan yang Anda buat akan menimpa perubahan dari user lain. 
            Pilih tindakan yang ingin Anda lakukan:
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Pilihan:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Timpa:</strong> Simpan perubahan Anda dan abaikan perubahan user lain</li>
              <li>• <strong>Batal:</strong> Tutup modal dan muat data terbaru dari cloud</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={onOverride}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            Timpa Data
          </button>
        </div>
      </div>
    </div>
  );
}
