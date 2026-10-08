import { useState } from 'react';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { Calendar, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, resetData, budgetItems, savings, guests, vendors, tasks } = useWeddingStore();
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    updateSettings({ weddingDate });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetData();
    setWeddingDate('');
    setShowConfirm(false);
  };

  const handleExport = () => {
    const data = {
      settings,
      budgetItems,
      savings,
      guests,
      vendors,
      tasks,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weddingplan-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) updateSettings(data.settings);
        alert('Data berhasil diimport!');
      } catch (error) {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-1">Atur detail pernikahan dan preferensi</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tanggal Pernikahan</h3>
            <p className="text-xs text-gray-400">Atur tanggal pernikahan Anda</p>
          </div>
        </div>

        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
        />

        <button
          onClick={handleSave}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          Simpan Pengaturan
        </button>

        {saved && (
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Tersimpan!</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Download size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Backup & Restore</h3>
            <p className="text-xs text-gray-400">Export dan import data pernikahan</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Download size={18} />
            Export Data (JSON)
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all font-medium cursor-pointer">
            <Upload size={18} />
            Import Data (JSON)
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Export data secara berkala untuk backup
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Informasi Data</h3>
            <p className="text-xs text-gray-400">Ringkasan data yang tersimpan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{budgetItems.length}</p>
            <p className="text-xs text-gray-500">Item Anggaran</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{savings.length}</p>
            <p className="text-xs text-gray-500">Catatan Tabungan</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{guests.length}</p>
            <p className="text-xs text-gray-500">Daftar Tamu</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{vendors.length}</p>
            <p className="text-xs text-gray-500">Vendor</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            <p className="text-xs text-gray-500">Tugas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700">Zona Berbahaya</h3>
            <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium"
          >
            Reset Semua Data
          </button>
        ) : (
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-sm text-red-700 font-medium mb-2">⚠️ Konfirmasi Penghapusan</p>
            <p className="text-xs text-red-600 mb-4">
              Semua data akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 border border-gray-200 text-sm font-medium"
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
