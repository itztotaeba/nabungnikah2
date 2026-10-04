import { useState } from 'react';
import { useWeddingStore } from '../store';
import { calculateRemainingMonths, formatRemainingTime, formatCurrency, calculateTotalBudget, calculateTotalSavings } from '../helpers';
import { Calendar, HardDrive, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetData, budgetItems, savings, guests } = useWeddingStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
  const [currency, setCurrency] = useState(settings.currency);
  const [saved, setSaved] = useState(false);

  // Preview calculations
  const remainingMonths = weddingDate ? calculateRemainingMonths(weddingDate) : 0;
  const remainingTimeText = weddingDate ? formatRemainingTime(weddingDate) : '';

  const handleSave = () => {
    updateSettings({ weddingDate, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetData();
    setWeddingDate('');
    setCurrency('IDR');
    setShowConfirm(false);
  };

  const totalBudget = calculateTotalBudget(budgetItems);
  const totalSavings = calculateTotalSavings(savings);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-1">Atur detail pernikahan dan preferensi aplikasi</p>
      </div>

      {/* Wedding Date Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#B76E79]/10 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-[#B76E79]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">Tanggal Pernikahan</h3>
            <p className="text-xs text-gray-400">Digunakan untuk menghitung countdown dan target tabungan</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Tanggal</label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full max-w-sm px-4 py-3 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] text-gray-800"
            />
          </div>

          {/* Countdown Preview */}
          {weddingDate && (
            <div className="bg-gradient-to-r from-[#B76E79]/5 to-[#87A878]/5 rounded-xl p-4 border border-[#E8E0D4]/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Sisa Waktu</p>
                  <p className="text-lg font-heading font-bold text-gray-800">{remainingTimeText}</p>
                  <p className="text-xs text-gray-400">{remainingMonths} bulan • {new Date(weddingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Currency Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center">
            <span className="text-lg">💱</span>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-800">Mata Uang</h3>
            <p className="text-xs text-gray-400">Pilih mata uang untuk menampilkan nominal</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: 'IDR', label: 'IDR', desc: 'Rupiah' },
            { value: 'USD', label: 'USD', desc: 'Dollar' },
            { value: 'MYR', label: 'MYR', desc: 'Ringgit' },
            { value: 'SGD', label: 'SGD', desc: 'Singapura' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCurrency(opt.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                currency === opt.value
                  ? 'border-[#87A878] bg-[#87A878]/5 shadow-sm'
                  : 'border-[#E8E0D4] hover:border-[#87A878]/50 bg-white'
              }`}
            >
              <p className={`text-sm font-bold ${currency === opt.value ? 'text-[#6B8A5E]' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-400">{opt.desc}</p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-4 text-sm text-gray-500">
          Preview: <span className="font-semibold text-gray-700">{formatCurrency(1000000, currency)}</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg hover:shadow-[#87A878]/20 transition-all font-medium"
        >
          Simpan Pengaturan
        </button>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Tersimpan!</span>
          </div>
        )}
      </div>

      {/* Data Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <HardDrive size={20} className="text-blue-500" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-gray-800">Informasi Data</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#F5F0E8] rounded-xl">
            <span className="text-lg">📦</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Data tersimpan di browser Anda (LocalStorage)</p>
              <p className="text-xs text-gray-500 mt-0.5">Data tetap ada meskipun browser ditutup</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F5F0E8] rounded-xl">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Perhitungan dikunci oleh sistem</p>
              <p className="text-xs text-gray-500 mt-0.5">Total, selisih, progress, dan sisa waktu tidak bisa dimanipulasi</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F5F0E8] rounded-xl">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Kontrol penuh atas data input</p>
              <p className="text-xs text-gray-500 mt-0.5">Anda menentukan nama item, kategori, dan nominal</p>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-4 pt-4 border-t border-[#E8E0D4]">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Ringkasan Data Tersimpan</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-[#FDFBF7] rounded-lg">
              <p className="text-lg font-bold text-gray-800">{budgetItems.length}</p>
              <p className="text-xs text-gray-500">Item Anggaran</p>
            </div>
            <div className="text-center p-2 bg-[#FDFBF7] rounded-lg">
              <p className="text-lg font-bold text-gray-800">{savings.length}</p>
              <p className="text-xs text-gray-500">Catatan Tabungan</p>
            </div>
            <div className="text-center p-2 bg-[#FDFBF7] rounded-lg">
              <p className="text-lg font-bold text-gray-800">{guests.length}</p>
              <p className="text-xs text-gray-500">Daftar Tamu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-red-700">Zona Berbahaya</h3>
            <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Reset Semua Data
          </button>
        ) : (
          <div className="bg-red-50 rounded-xl p-5 border border-red-200 animate-fade-in">
            <p className="text-sm text-red-700 font-medium mb-1">
              ⚠️ Konfirmasi Penghapusan
            </p>
            <p className="text-xs text-red-600 mb-4">
              Semua data akan dihapus permanen: {budgetItems.length} item anggaran ({formatCurrency(totalBudget, settings.currency)}), {savings.length} catatan tabungan ({formatCurrency(totalSavings, settings.currency)}), dan {guests.length} tamu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Ya, Hapus Semua Data
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors text-sm font-medium"
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
