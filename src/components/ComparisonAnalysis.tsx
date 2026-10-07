import { useState } from 'react';
import { useWeddingStore, Vendor } from '../store';
import { formatCurrency } from '../helpers';
import { TrendingUp, Check, X, Star, ChevronDown, ArrowRight } from 'lucide-react';
import { getChecklistForCategory, countCheckedItems } from '../helpers/vendorChecklist';

interface ComparisonAnalysisProps {
  isVisible: boolean;
  onClose: () => void;
}

type ComparisonMode = 'overview' | 'specific';

export default function ComparisonAnalysis({ isVisible, onClose }: ComparisonAnalysisProps) {
  const { settings, vendors } = useWeddingStore();
  const [mode, setMode] = useState<ComparisonMode>('overview');
  const [selectedVendor1, setSelectedVendor1] = useState<Vendor | null>(null);
  const [selectedVendor2, setSelectedVendor2] = useState<Vendor | null>(null);

  if (!isVisible) return null;

  // Calculate totals for overview mode
  const totalAllIn = vendors
    .filter(v => v.type === 'All-in')
    .reduce((sum, v) => sum + v.dealPrice, 0);
  
  const totalSatuan = vendors
    .filter(v => v.type === 'Satuan')
    .reduce((sum, v) => sum + v.dealPrice, 0);

  const difference = Math.abs(totalAllIn - totalSatuan);
  const isAllInCheaper = totalAllIn < totalSatuan;
  const percentageDiff = totalSatuan > 0 ? ((difference / totalSatuan) * 100).toFixed(1) : '0';

  // Specific comparison calculations
  const specificDifference = selectedVendor1 && selectedVendor2 
    ? Math.abs(selectedVendor1.dealPrice - selectedVendor2.dealPrice)
    : 0;
  
  const isVendor1Cheaper = selectedVendor1 && selectedVendor2 
    ? selectedVendor1.dealPrice < selectedVendor2.dealPrice
    : false;

  // Comparison matrix for overview
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

  // Generate recommendation for overview
  const getOverviewRecommendation = () => {
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

  // Generate recommendation for specific comparison
  const getSpecificRecommendation = () => {
    if (!selectedVendor1 || !selectedVendor2) {
      return 'Silakan pilih 2 vendor untuk dibandingkan.';
    }

    const vendor1Name = selectedVendor1.name;
    const vendor2Name = selectedVendor2.name;
    const vendor1Type = selectedVendor1.type;
    const vendor2Type = selectedVendor2.type;

    if (isVendor1Cheaper) {
      return `${vendor1Name} (${vendor1Type}) lebih hemat ${formatCurrency(specificDifference, settings.currency)} dibandingkan ${vendor2Name} (${vendor2Type}). Namun, pertimbangkan juga faktor lain seperti checklist, rating, dan review.`;
    } else if (selectedVendor1.dealPrice === selectedVendor2.dealPrice) {
      return `Kedua vendor memiliki harga yang sama (${formatCurrency(selectedVendor1.dealPrice, settings.currency)}). Pertimbangkan faktor lain seperti checklist, rating, dan review untuk membuat keputusan.`;
    } else {
      return `${vendor2Name} (${vendor2Type}) lebih hemat ${formatCurrency(specificDifference, settings.currency)} dibandingkan ${vendor1Name} (${vendor1Type}). Namun, pertimbangkan juga faktor lain seperti checklist, rating, dan review.`;
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

  const renderVendorCard = (vendor: Vendor, label: string) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <h5 className="font-semibold text-gray-800">{vendor.name}</h5>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              vendor.type === 'All-in' 
                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {vendor.type}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {vendor.category}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Harga:</span>
          <span className="font-bold text-gray-800">{formatCurrency(vendor.dealPrice, settings.currency)}</span>
        </div>
        {vendor.rating && (
          <div className="flex justify-between">
            <span className="text-gray-500">Rating:</span>
            <div className="flex items-center gap-1">
              {renderStars(vendor.rating)}
              <span className="text-xs text-gray-600">({vendor.rating}/5)</span>
            </div>
          </div>
        )}
        {vendor.checklist && (
          <div className="flex justify-between">
            <span className="text-gray-500">Checklist:</span>
            <span className="font-medium text-gray-700">
              {countCheckedItems(vendor.checklist)} item termasuk
            </span>
          </div>
        )}
        {vendor.review && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 italic">"{vendor.review}"</p>
          </div>
        )}
      </div>
    </div>
  );

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

      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('overview')}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'overview'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
              : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
          }`}
        >
          📊 Overview (Total)
        </button>
        <button
          onClick={() => setMode('specific')}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'specific'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
          }`}
        >
          🎯 Perbandingan Spesifik
        </button>
      </div>

      {/* Overview Mode */}
      {mode === 'overview' && (
        <>
          {/* Kalkulator Selisih */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
            <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
              Kalkulator Selisih (Total)
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
              💡 Rekomendasi
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getOverviewRecommendation()}
            </p>
          </div>
        </>
      )}

      {/* Specific Comparison Mode */}
      {mode === 'specific' && (
        <>
          {/* Vendor Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
              Pilih Vendor untuk Dibandingkan
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Vendor 1 Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor 1
                </label>
                <div className="relative">
                  <select
                    value={selectedVendor1?.id || ''}
                    onChange={(e) => {
                      const vendor = vendors.find(v => v.id === e.target.value);
                      setSelectedVendor1(vendor || null);
                    }}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white appearance-none pr-10"
                  >
                    <option value="">Pilih vendor...</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Vendor 2 Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor 2
                </label>
                <div className="relative">
                  <select
                    value={selectedVendor2?.id || ''}
                    onChange={(e) => {
                      const vendor = vendors.find(v => v.id === e.target.value);
                      setSelectedVendor2(vendor || null);
                    }}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white appearance-none pr-10"
                  >
                    <option value="">Pilih vendor...</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Comparison Result */}
            {selectedVendor1 && selectedVendor2 && (
              <div className={`rounded-lg p-4 border-2 ${
                isVendor1Cheaper 
                  ? 'bg-blue-50 border-blue-200' 
                  : selectedVendor1.dealPrice === selectedVendor2.dealPrice
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-indigo-50 border-indigo-200'
              }`}>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {selectedVendor1.dealPrice === selectedVendor2.dealPrice 
                    ? '💰 Harga Sama!' 
                    : isVendor1Cheaper 
                    ? `🎉 ${selectedVendor1.name} Lebih Hemat!` 
                    : `🎉 ${selectedVendor2.name} Lebih Hemat!`}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  Selisih: {formatCurrency(specificDifference, settings.currency)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedVendor1.dealPrice === selectedVendor2.dealPrice
                    ? 'Kedua vendor memiliki harga yang sama'
                    : isVendor1Cheaper
                    ? `${selectedVendor1.name} lebih murah ${((specificDifference / selectedVendor2.dealPrice) * 100).toFixed(1)}%`
                    : `${selectedVendor2.name} lebih murah ${((specificDifference / selectedVendor1.dealPrice) * 100).toFixed(1)}%`}
                </p>
              </div>
            )}
          </div>

          {/* Vendor Details Comparison */}
          {selectedVendor1 && selectedVendor2 && (
            <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
              <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
                Detail Perbandingan
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderVendorCard(selectedVendor1, 'Vendor 1')}
                
                <div className="flex items-center justify-center sm:hidden">
                  <ArrowRight size={24} className="text-gray-400 rotate-90" />
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <ArrowRight size={24} className="text-gray-400" />
                </div>
                
                {renderVendorCard(selectedVendor2, 'Vendor 2')}
              </div>

              {/* Checklist Comparison */}
              {(selectedVendor1.checklist || selectedVendor2.checklist) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-3">Perbandingan Checklist</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{selectedVendor1.name}</p>
                      <div className="space-y-1">
                        {selectedVendor1.checklist && getChecklistForCategory(selectedVendor1.category).map(item => {
                          const isChecked = selectedVendor1.checklist?.[item.id]?.checked;
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              {isChecked ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <X size={14} className="text-gray-400" />
                              )}
                              <span className={isChecked ? 'text-gray-800' : 'text-gray-500'}>
                                {item.question}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{selectedVendor2.name}</p>
                      <div className="space-y-1">
                        {selectedVendor2.checklist && getChecklistForCategory(selectedVendor2.category).map(item => {
                          const isChecked = selectedVendor2.checklist?.[item.id]?.checked;
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              {isChecked ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <X size={14} className="text-gray-400" />
                              )}
                              <span className={isChecked ? 'text-gray-800' : 'text-gray-500'}>
                                {item.question}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rekomendasi */}
          <div className="bg-gradient-to-br from-[#87A878]/10 to-[#B76E79]/10 rounded-xl p-5 border border-[#87A878]/20">
            <h4 className="font-heading text-base font-semibold text-gray-800 mb-3">
              💡 Rekomendasi
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getSpecificRecommendation()}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
