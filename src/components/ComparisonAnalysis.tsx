import { useState } from 'react';
import { useWeddingStore, Vendor } from '../store';
import { formatCurrency } from '../helpers';
import { TrendingUp, Check, X, Star, ChevronDown, ArrowRight, ArrowDown, Plus } from 'lucide-react';
import { getChecklistForCategory, countCheckedItems } from '../helpers/vendorChecklist';

interface ComparisonAnalysisProps {
  isVisible: boolean;
  onClose: () => void;
}

type ComparisonMode = 'overview' | 'specific';

/** Satu sisi perbandingan (Grup A atau Grup B) */
interface ComparisonGroup {
  vendorIds: string[];
}

const emptyGroup = (): ComparisonGroup => ({ vendorIds: [] });

export default function ComparisonAnalysis({ isVisible, onClose }: ComparisonAnalysisProps) {
  const { settings, vendors } = useWeddingStore();
  const [mode, setMode] = useState<ComparisonMode>('overview');
  const [groupA, setGroupA] = useState<ComparisonGroup>(emptyGroup);
  const [groupB, setGroupB] = useState<ComparisonGroup>(emptyGroup);
  // Dropdown "Tambah ke Grup A/B": id vendor yang sedang dipilih di select
  const [pickA, setPickA] = useState('');
  const [pickB, setPickB] = useState('');

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

  // ============================================
  // Specific comparison: multi-select groups
  // ============================================
  const resolveVendors = (ids: string[]): Vendor[] =>
    ids.map(id => vendors.find(v => v.id === id)).filter((v): v is Vendor => !!v);

  const addToGroup = (setter: React.Dispatch<React.SetStateAction<ComparisonGroup>>, vendorId: string) => {
    if (!vendorId) return;
    setter(g => (g.vendorIds.includes(vendorId) ? g : { vendorIds: [...g.vendorIds, vendorId] }));
  };

  const removeFromGroup = (setter: React.Dispatch<React.SetStateAction<ComparisonGroup>>, vendorId: string) => {
    setter(g => ({ vendorIds: g.vendorIds.filter(id => id !== vendorId) }));
  };

  const groupAVendors = resolveVendors(groupA.vendorIds);
  const groupBVendors = resolveVendors(groupB.vendorIds);

  const groupATotal = groupAVendors.reduce((s, v) => s + v.dealPrice, 0);
  const groupBTotal = groupBVendors.reduce((s, v) => s + v.dealPrice, 0);

  const canCompare = groupAVendors.length > 0 && groupBVendors.length > 0;
  const specificDifference = canCompare ? Math.abs(groupATotal - groupBTotal) : 0;
  const isGroupACheaper = canCompare ? groupATotal < groupBTotal : false;
  const isSameTotal = canCompare && groupATotal === groupBTotal;
  const cheaperBase = canCompare ? (isGroupACheaper ? groupBTotal : groupATotal) : 0;
  const percentageSpecificDiff = cheaperBase > 0 ? ((specificDifference / cheaperBase) * 100).toFixed(1) : '0';

  // Label grup otomatis berdasarkan tipe vendor di dalamnya
  const groupLabel = (list: Vendor[], fallback: string) => {
    if (list.length === 0) return fallback;
    const types = Array.from(new Set(list.map(v => v.type)));
    return types.join(' + ');
  };
  const labelA = groupLabel(groupAVendors, 'Grup A');
  const labelB = groupLabel(groupBVendors, 'Grup B');

  const availableForA = vendors.filter(v => !groupA.vendorIds.includes(v.id));
  const availableForB = vendors.filter(v => !groupB.vendorIds.includes(v.id));

  // Vendors yang muncul di kedua grup -> checklist comparison memakai irisan ini
  const sharedVendorIds = groupA.vendorIds.filter(id => groupB.vendorIds.includes(id));
  const sharedVendors = resolveVendors(sharedVendorIds);

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

  // Generate recommendation for specific (group) comparison
  const getSpecificRecommendation = () => {
    if (groupAVendors.length === 0 && groupBVendors.length === 0) {
      return 'Silakan pilih minimal satu vendor untuk Grup A dan satu vendor untuk Grup B. Anda bisa menambahkan beberapa vendor sekaligus (misalnya semua item Satuan) lalu bandingkan totalnya.';
    }
    if (groupAVendors.length === 0 || groupBVendors.length === 0) {
      return 'Lengkapi kedua grup terlebih dahulu — masing-masing grup bisa berisi beberapa vendor (All-in maupun Satuan), lalu total harganya akan dibandingkan.';
    }

    const summaryA = `${labelA} (${groupAVendors.length} vendor, total ${formatCurrency(groupATotal, settings.currency)})`;
    const summaryB = `${labelB} (${groupBVendors.length} vendor, total ${formatCurrency(groupBTotal, settings.currency)})`;

    if (isSameTotal) {
      return `Total ${summaryA} sama dengan ${summaryB}, yaitu ${formatCurrency(groupATotal, settings.currency)}. Pertimbangkan faktor lain seperti checklist, rating, dan review untuk membuat keputusan.`;
    }

    const cheaperSummary = isGroupACheaper ? summaryA : summaryB;
    const pricierSummary = isGroupACheaper ? summaryB : summaryA;

    return `${cheaperSummary} lebih hemat ${formatCurrency(specificDifference, settings.currency)} (${percentageSpecificDiff}%) dibandingkan ${pricierSummary}. Namun, pertimbangkan juga faktor lain seperti checklist, rating, dan review.`;
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

  /** Kartu daftar vendor dalam satu grup beserta subtotalnya */
  const renderGroupCard = (list: Vendor[], title: string, accent: 'purple' | 'blue') => {
    const total = list.reduce((s, v) => s + v.dealPrice, 0);
    const accentText = accent === 'purple' ? 'text-purple-700' : 'text-blue-700';
    const accentBadge = accent === 'purple'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
    const accentBorder = accent === 'purple' ? 'border-purple-100' : 'border-blue-100';

    return (
      <div className={`bg-white rounded-lg p-4 border ${accentBorder}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        {list.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-2">Belum ada vendor dipilih.</p>
        ) : (
          <>
            <ul className="space-y-2 mb-3">
              {list.map(v => (
                <li key={v.id} className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{v.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${accentBadge}`}>
                          {v.type}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {v.category}
                        </span>
                        {v.rating && (
                          <span className="text-[10px] text-amber-600">★ {v.rating}/5</span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-gray-700 whitespace-nowrap shrink-0">
                      {formatCurrency(v.dealPrice, settings.currency)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Subtotal ({list.length} vendor)
              </span>
              <span className={`text-base font-bold ${accentText}`}>
                {formatCurrency(total, settings.currency)}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  /** Panel pemilih vendor multi-select untuk satu grup */
  const renderGroupPicker = (
    title: string,
    list: Vendor[],
    available: Vendor[],
    pickValue: string,
    setPickValue: (id: string) => void,
    onAdd: (id: string) => void,
    onRemove: (id: string) => void,
    accent: 'purple' | 'blue',
  ) => {
    const ringClass = accent === 'purple'
      ? 'focus:ring-purple-300 focus:border-purple-400 border-purple-200'
      : 'focus:ring-blue-300 focus:border-blue-400 border-blue-200';
    const chipClass = accent === 'purple'
      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      : 'bg-blue-100 text-blue-800 hover:bg-blue-200';

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-gray-800">{title}</h5>
          <span className="text-xs text-gray-500">{list.length} dipilih</span>
        </div>

        {/* Vendor terpilih (chip dengan tombol hapus) */}
        {list.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {list.map(v => (
              <span key={v.id} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium ${chipClass}`}>
                <span className="max-w-[160px] truncate">
                  {v.name} <span className="opacity-70">({v.type})</span>
                </span>
                <button
                  onClick={() => onRemove(v.id)}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                  aria-label={`Hapus ${v.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tambah vendor */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <select
              value={pickValue}
              onChange={(e) => setPickValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 outline-none bg-white appearance-none pr-9 text-sm ${ringClass}`}
            >
              <option value="">Pilih vendor...</option>
              {available.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.type} · {formatCurrency(vendor.dealPrice, settings.currency)})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => {
              onAdd(pickValue);
              setPickValue('');
            }}
            disabled={!pickValue}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
        {available.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">Semua vendor sudah ditambahkan ke grup ini.</p>
        )}
      </div>
    );
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
          🎯 Analisis Detail
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
                  ({percentageDiff}% lebih murah)
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

      {/* Specific Comparison Mode (multi-vendor groups) */}
      {mode === 'specific' && (
        <>
          {/* Group Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h4 className="font-heading text-base font-semibold text-gray-800 mb-1">
              Pilih Vendor untuk Dibandingkan
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Tambahkan beberapa vendor sekaligus ke tiap grup (bebas campur All-in dan Satuan),
              lalu total jumlah keduanya yang akan dibandingkan.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {renderGroupPicker(
                'Grup A',
                groupAVendors,
                availableForA,
                pickA,
                setPickA,
                (id) => addToGroup(setGroupA, id),
                (id) => removeFromGroup(setGroupA, id),
                'purple',
              )}
              {renderGroupPicker(
                'Grup B',
                groupBVendors,
                availableForB,
                pickB,
                setPickB,
                (id) => addToGroup(setGroupB, id),
                (id) => removeFromGroup(setGroupB, id),
                'blue',
              )}
            </div>

            {(groupAVendors.length > 0 || groupBVendors.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    // Tukar isi Grup A dan Grup B
                    const a = groupA.vendorIds;
                    setGroupA({ vendorIds: groupB.vendorIds });
                    setGroupB({ vendorIds: a });
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ⇄ Tukar Grup A ↔ B
                </button>
                <button
                  onClick={() => {
                    setGroupA(emptyGroup());
                    setGroupB(emptyGroup());
                    setPickA('');
                    setPickB('');
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Reset Pilihan
                </button>
              </div>
            )}

            {/* Comparison Result */}
            {canCompare && (
              <div className={`mt-4 rounded-lg p-4 border-2 ${
                isSameTotal
                  ? 'bg-gray-50 border-gray-200'
                  : isGroupACheaper
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isSameTotal
                    ? '💰 Total Harga Sama!'
                    : `🎉 ${isGroupACheaper ? labelA : labelB} Lebih Hemat!`}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  Selisih: {formatCurrency(specificDifference, settings.currency)}
                </p>
                {!isSameTotal && (
                  <p className="text-sm text-gray-600 mt-1">
                    Total {isGroupACheaper ? 'Grup A' : 'Grup B'} lebih murah {percentageSpecificDiff}%
                  </p>
                )}
                {isSameTotal && (
                  <p className="text-sm text-gray-600 mt-1">
                    Kedua grup memiliki total harga yang sama
                  </p>
                )}
              </div>
            )}

            {!canCompare && (
              <p className="mt-4 text-xs text-gray-500 italic">
                Pilih minimal satu vendor di Grup A dan satu vendor di Grup B untuk melihat perbandingan total.
              </p>
            )}
          </div>

          {/* Group Details Comparison */}
          {canCompare && (
            <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
              <h4 className="font-heading text-base font-semibold text-gray-800 mb-4">
                Detail Perbandingan
              </h4>

              {/* Kartu bertumpuk vertikal di layar sempit, berdampingan di layar lebar (lg+) */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  {renderGroupCard(groupAVendors, `Grup A — ${labelA}`, 'purple')}
                </div>

                <div className="flex items-center justify-center shrink-0 py-1" aria-label="Dibandingkan dengan">
                  {/* Arah panah mengikuti tata letak kartu: ke bawah saat bertumpuk, ke kanan saat berjajar */}
                  <ArrowDown size={24} className="text-gray-400 lg:hidden" />
                  <ArrowRight size={24} className="text-gray-400 hidden lg:block" />
                </div>

                <div className="flex-1 min-w-0">
                  {renderGroupCard(groupBVendors, `Grup B — ${labelB}`, 'blue')}
                </div>
              </div>

              {/* Checklist Comparison — untuk vendor yang sama-sama ada di kedua grup */}
              {sharedVendors.length > 0 && sharedVendors.some(v => v.checklist) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-1">Perbandingan Checklist</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Menampilkan checklist vendor yang terpilih di kedua grup.
                  </p>
                  <div className="space-y-6">
                    {sharedVendors.filter(v => v.checklist).map(vendor => (
                      <div key={vendor.id}>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {vendor.name}{' '}
                          <span className="text-xs text-gray-500">
                            ({countCheckedItems(vendor.checklist)} item termasuk)
                          </span>
                        </p>
                        <div className="space-y-1">
                          {getChecklistForCategory(vendor.category).map(item => {
                            const isChecked = vendor.checklist?.[item.id]?.checked;
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
                    ))}
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
