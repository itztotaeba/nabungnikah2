import { useState } from 'react';
import { Vendor, VendorType, ContractStatus } from '../types';
import { useWeddingStore } from '../store';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { getChecklistForCategory, countCheckedItems, migrateChecklistFormat } from '../helpers/vendorChecklist';
import { Phone, Mail, MapPin, Calendar, Star, X, ChevronLeft, Pencil, ImageOff } from 'lucide-react';
import VendorPhotoCarousel from './VendorPhotoCarousel';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
  onEdit: (vendor: Vendor) => void;
}

const CONTRACT_STATUSES: ContractStatus[] = ['Belum Kontrak', 'Sudah DP', 'Lunas'];

const statusBadge = (status: ContractStatus) => {
  switch (status) {
    case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Sudah DP': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-red-100 text-red-700 border-red-200';
  }
};

const typeBadge = (type: VendorType) =>
  type === 'All-in'
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';

/**
 * Detail Vendor — menampilkan SEMUA informasi vendor yang diinput sebelumnya
 * beserta foto contoh dalam carousel ala Instagram.
 */
export default function VendorDetailModal({ vendor, onClose, onEdit }: VendorDetailModalProps) {
  const { settings } = useWeddingStore();
  const [tab, setTab] = useState<'info' | 'checklist'>('info');

  // Checklist (migrasi format lama agar tetap terbaca)
  const checklist = migrateChecklistFormat(vendor.checklist, vendor.category);
  const templateItems = getChecklistForCategory(vendor.category);
  const checkedTemplate = templateItems.filter((item) => checklist[item.id]?.checked);
  const checkedCustom = (vendor.customChecklist || []).filter((item) => checklist[item.id]?.checked);
  const uncheckedItems = templateItems.filter((item) => !checklist[item.id]?.checked);

  const progress = vendor.dealPrice > 0 ? (vendor.dpAmount / vendor.dealPrice) * 100 : 0;
  const photos = vendor.photos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-lg sm:rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E0D4] bg-[#FDFBF7]">
          <button
            onClick={onClose}
            aria-label="Kembali"
            className="p-2 -ml-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-gray-800 truncate">{vendor.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${typeBadge(vendor.type)}`}>
                {vendor.type}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {vendor.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => onEdit(vendor)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8E0D4]">
          {(['info', 'checklist'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-[#6B8A5E] border-b-2 border-[#87A878] bg-[#87A878]/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'info' ? '📋 Informasi & Foto' : `✅ Checklist (${countCheckedItems(checklist)})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {tab === 'info' ? (
            <>
              {/* Carousel Foto ala Instagram */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Contoh Foto Vendor {photos.length > 0 && `(${photos.length}/5)`}
                </p>
                {photos.length > 0 ? (
                  <VendorPhotoCarousel photos={photos} vendorName={vendor.name} />
                ) : (
                  <div className="w-full aspect-video bg-[#F5F0E8] rounded-md flex flex-col items-center justify-center gap-2 border border-dashed border-[#E8E0D4]">
                    <ImageOff size={24} className="text-gray-400" />
                    <p className="text-xs text-gray-400">Belum ada foto contoh vendor</p>
                  </div>
                )}
              </div>

              {/* Status & Pembayaran */}
              <div className="bg-[#FDFBF7] rounded-md p-4 border border-[#E8E0D4] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-500">Status Kontrak</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge(vendor.contractStatus)}`}>
                    {vendor.contractStatus}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress Pembayaran</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#87A878]transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg p-2.5 border border-[#E8E0D4]">
                    <p className="text-[10px] text-gray-500 uppercase">Harga Deal</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5 break-all">
                      {formatCurrency(vendor.dealPrice, settings.currency)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-[#E8E0D4]">
                    <p className="text-[10px] text-gray-500 uppercase">DP</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5 break-all">
                      {formatCurrency(vendor.dpAmount, settings.currency)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-[#E8E0D4]">
                    <p className="text-[10px] text-gray-500 uppercase">Sisa</p>
                    <p className="text-xs font-bold text-[#B76E79] mt-0.5 break-all">
                      {formatCurrency(vendor.remainingBalance, settings.currency)}
                    </p>
                  </div>
                </div>
                {(vendor.dueDateDP || vendor.dueDateFinal) && (
                  <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-600">
                    {vendor.dueDateDP && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-amber-500" />
                        Tempo DP: {new Date(vendor.dueDateDP).toLocaleDateString('id-ID')}
                      </span>
                    )}
                    {vendor.dueDateFinal && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-red-500" />
                        Tempo Pelunasan: {new Date(vendor.dueDateFinal).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Kontak */}
              <div className="bg-[#FDFBF7] rounded-md p-4 border border-[#E8E0D4] space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase">Kontak</p>
                <a
                  href={`https://wa.me/${vendor.contactWA.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-[#6B8A5E] transition-colors"
                >
                  <Phone size={14} className="text-[#87A878] flex-shrink-0" />
                  {vendor.contactWA}
                </a>
                {vendor.email && (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-[#6B8A5E] transition-colors break-all"
                  >
                    <Mail size={14} className="text-[#87A878] flex-shrink-0" />
                    {vendor.email}
                  </a>
                )}
                {vendor.address && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <MapPin size={14} className="text-[#87A878] flex-shrink-0 mt-0.5" />
                    {vendor.address}
                  </div>
                )}
              </div>

              {/* Rating & Review */}
              {(vendor.rating || vendor.review) && (
                <div className="bg-[#FDFBF7] rounded-md p-4 border border-[#E8E0D4]">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Penilaian</p>
                  {vendor.rating && (
                    <div className="flex items-center gap-1 mb-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s <= vendor.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{vendor.rating}/5</span>
                    </div>
                  )}
                  {vendor.review && <p className="text-sm text-gray-700 italic">"{vendor.review}"</p>}
                </div>
              )}

              {/* Catatan */}
              {vendor.notes && (
                <div className="bg-[#FDFBF7] rounded-md p-4 border border-[#E8E0D4]">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Catatan</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              )}

              {/* Audit info */}
              <p className="text-xs text-gray-400 text-right pb-2">
                {formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}
              </p>
            </>
          ) : (
            /* Tab Checklist */
            <div className="space-y-4">
              {checkedTemplate.length === 0 && checkedCustom.length === 0 && uncheckedItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Belum ada checklist untuk vendor ini.</p>
              ) : (
                <>
                  {checkedTemplate.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#6B8A5E] mb-2">
                        Termasuk dalam Paket ({checkedTemplate.length})
                      </p>
                      <div className="space-y-2">
                        {checkedTemplate.map((item) => (
                          <div key={item.id} className="bg-[#87A878]/5 border border-[#87A878]/20 rounded-lg px-3 py-2">
                            <p className="text-sm text-gray-800 font-medium">✓ {item.question}</p>
                            {checklist[item.id]?.notes && (
                              <p className="text-xs text-gray-500 mt-0.5 pl-4 border-l-2 border-[#B76E79] ml-0.5">
                                📝 {checklist[item.id].notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkedCustom.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#B8922F] mb-2">
                        Checklist Custom Termasuk ({checkedCustom.length})
                      </p>
                      <div className="space-y-2">
                        {checkedCustom.map((item) => (
                          <div key={item.id} className="bg-[#FFF9E6] border border-[#D4A843]/30 rounded-lg px-3 py-2">
                            <p className="text-sm text-gray-800 font-medium">✓ {item.question}</p>
                            {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                            {checklist[item.id]?.notes && (
                              <p className="text-xs text-gray-500 mt-0.5 pl-4 border-l-2 border-[#D4A843] ml-0.5">
                                📝 {checklist[item.id].notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uncheckedItems.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        Tidak Termasuk ({uncheckedItems.length})
                      </p>
                      <div className="space-y-1.5">
                        {uncheckedItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 opacity-70">
                            <p className="text-sm text-gray-500 line-through decoration-gray-300">✗ {item.question}</p>
                            {checklist[item.id]?.notes && (
                              <p className="text-xs text-gray-400 mt-0.5 no-underline">📝 {checklist[item.id].notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
