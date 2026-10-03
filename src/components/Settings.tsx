import { useState } from 'react';
import { useWeddingStore } from '../store';

export default function Settings() {
  const { settings, updateSettings, resetData } = useWeddingStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
  const [currency, setCurrency] = useState(settings.currency);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ weddingDate, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetData();
    setWeddingDate('');
    setCurrency('IDR');
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Pengaturan</h2>
        <p className="text-sm text-gray-500">Atur detail pernikahan dan preferensi aplikasi</p>
      </div>

      {/* Wedding Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-700 border-b border-gray-100 pb-3">Detail Pernikahan</h3>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Pernikahan</label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Digunakan untuk menghitung sisa waktu dan target tabungan bulanan</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Mata Uang</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          >
            <option value="IDR">IDR - Rupiah Indonesia</option>
            <option value="USD">USD - US Dollar</option>
            <option value="MYR">MYR - Ringgit Malaysia</option>
            <option value="SGD">SGD - Singapore Dollar</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            Simpan Pengaturan
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Tersimpan!</span>
          )}
        </div>
      </div>

      {/* Data Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-700 border-b border-gray-100 pb-3">Informasi Data</h3>

        <div className="space-y-2 text-sm text-gray-600">
          <p>📦 Data disimpan di <strong>LocalStorage</strong> browser kamu.</p>
          <p>🔒 Semua perhitungan (total, selisih, progress, sisa waktu) dikunci oleh sistem dan tidak bisa dimanipulasi.</p>
          <p>💡 Kamu memiliki kontrol penuh atas data input (nama item, kategori, nominal).</p>
          <p>⚡ Data akan tetap ada meskipun browser ditutup, selama cache browser tidak dihapus.</p>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 space-y-4">
        <h3 className="font-semibold text-red-600 border-b border-red-100 pb-3">⚠️ Zona Berbahaya</h3>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Reset Semua Data
          </button>
        ) : (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 font-medium mb-3">
              Apakah kamu yakin? Semua data anggaran, tabungan, dan tamu akan dihapus permanen!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
