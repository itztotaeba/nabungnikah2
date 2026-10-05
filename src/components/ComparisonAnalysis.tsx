import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { TrendingUp, Check, X, Star } from 'lucide-react';

interface ComparisonAnalysisProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ComparisonAnalysis({ isVisible, onClose }: ComparisonAnalysisProps) {
  const { settings, vendors } = useWeddingStore();

  if (!isVisible) return null;

  // Calculate totals
  const totalAllIn = vendors
    .filter(v => v.type === 'All-in')
    .reduce((sum, v) => sum + v.dealPrice, 0);
  
  const totalSatuan = vendors
    .filter(v => v.type === 'Satuan')
    .reduce((sum, v) => sum + v.dealPrice, 0);

  const difference = Math.abs(totalAllIn - totalSatuan);
  const isAllInCheaper = totalAllIn < totalSatuan;
  const percentageDiff = totalSatuan > 0 ? ((difference / totalSatuan) * 100).toFixed(1) : '0';

  // Comparison matrix
  const comparisonData = [
    {
      aspect: 'Biaya',
      allIn: {
        score: isAllInCheaper ? 5 : 3,
        text: isAllInCheaper ? 'Lebih hemat' : 'Lebih mahal',
        positive: isAllInCheaper,
      },
      satuan: {
        score: isAllInCheaper ? 3 : 5,
        text: isAllInCheaper ? 'Lebih mahal' : 'Lebih hemat',
        positive: !isAllInCheaper,
      },
    },
    {
      aspect: 'Waktu & Energi',
      allIn: {
        score: 5,
        text: 'Hemat waktu, WO yang urus',
        positive: true,
      },
      satuan: {
        score: 2,
        text: 'Butuh waktu & effort besar',
        positive: false,
      },
    },
    {
      aspect: 'Fleksibilitas',
      allIn: {
        score: 2,
        text: 'Terbatas pada paket WO',
        positive: false,
      },
      satuan: {
        score: 5,
        text: 'Bebas pilih vendor sendiri',
        positive: true,
      },
    },
    {
      aspect: 'Kontrol Kualitas',
      allIn: {
        score: 3,
        text: 'Tergantung kualitas WO',
        positive: null,
      },
      satuan: {
        score: 5,
        text: 'Kontrol penuh setiap detail',
        positive: true,
      },
    },
    {
      aspect: 'Risiko',
      allIn: {
        score: 4,
        text: 'WO yang tanggung jawab',
        positive: true,
      },
      satuan: {
        score: 2,
        text: 'Risiko koordinasi sendiri',
        positive: false,
      },
    },
  ];

  // Generate recommendation
  const getRecommendation = () => {
    if (vendors.length === 0) {
      return 'Belum ada data vendor. Silakan tambahkan vendor terlebih dahulu untuk mendapatkan rekomendasi.';
    }

    if (totalAllIn === 0 && totalSatuan === 0) {
      return 'Belum ada data harga. Silakan lengkapi data harga vendor untuk analisis perbandingan.';
    }

    if (totalAllIn === 0) {
      return 'Anda hanya memiliki vendor satuan. Pertimbangkan untuk mencari paket All-in sebagai perbandingan.';
    }

    if (totalSatuan === 0) {
      return 'Anda hanya memiliki vendor All-in. Pertimbangkan untuk mencari vendor satuan sebagai perbandingan.';
    }

    if (isAllInCheaper) {
      return `Berdasarkan data Anda, Paket All-in lebih hemat ${formatCurrency(difference, settings.currency)} (${percentageDiff}%). Namun, jika Anda mengutamakan kebebasan memilih vendor dan kontrol penuh, opsi Satuan lebih direkomendasikan.`;
    } else {
      return `Berdasarkan data Anda, Vendor Satuan lebih hemat ${formatCurrency(difference, settings.currency)} (${percentageDiff}%). Namun, jika Anda mengutamakan kemudahan dan hemat waktu, paket All-in lebih direkomendasikan.`;
    }
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < score ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-6 animate-fade-in">
      {/* Header dengan judul & tombol close */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-purple-500" />
          Analisis Perbandingan
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Kalkulator Selisih */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
        <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
          Kalkulator Selisih
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total All-in</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(totalAllIn, settings.currency)}</p>
            <p className="text-xs text-gray-400 mt-1">{vendors.filter(v => v.type === 'All-in').length} vendor</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Satuan</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(totalSatuan, settings.currency)}</p>
            <p className="text-xs text-gray-400 mt-1">{vendors.filter(v => v.type === 'Satuan').length} vendor</p>
          </div>
        </div>

        {totalAllIn > 0 && totalSatuan > 0 && (
          <div className={`rounded-lg p-4 border-2 ${isAllInCheaper ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isAllInCheaper ? '🎉 All-in Lebih Hemat!' : '🎉 Satuan Lebih Hemat!'}
            </p>
            <p className="text-2xl font-bold text-gray-800">
              Selisih: {formatCurrency(difference, settings.currency)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ({percentageDiff}% lebih {isAllInCheaper ? 'murah' : 'murah'})
            </p>
          </div>
        )}
      </div>

      {/* Matriks Perbandingan */}
      <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
        <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
          Matriks Perbandingan
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Aspek</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-purple-700">All-in</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-blue-700">Satuan</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-sm font-medium text-gray-700">{item.aspect}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex">{renderStars(item.allIn.score)}</div>
                      <p className={`text-xs ${item.allIn.positive === true ? 'text-emerald-600' : item.allIn.positive === false ? 'text-red-600' : 'text-gray-600'}`}>
                        {item.allIn.text}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex">{renderStars(item.satuan.score)}</div>
                      <p className={`text-xs ${item.satuan.positive === true ? 'text-emerald-600' : item.satuan.positive === false ? 'text-red-600' : 'text-gray-600'}`}>
                        {item.satuan.text}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="bg-gradient-to-br from-[#87A878]/10 to-[#B76E79]/10 rounded-xl p-5 border border-[#87A878]/20">
        <h4 className="font-heading text-base font-semibold text-gray-800 mb-3">
          💡 Rekomendasi Cerdas
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {getRecommendation()}
        </p>
      </div>
    </div>
  );
}
