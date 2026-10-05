import { useState } from 'react';
import { useWeddingStore, Vendor, VendorType, VendorCategory, ContractStatus } from '../store';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { useToastStore } from '../toastStore';
import ComparisonAnalysis from './ComparisonAnalysis';
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  FileText,
  TrendingUp,
  X,
} from 'lucide-react';

const VENDOR_CATEGORIES: VendorCategory[] = ['WO', 'Katering', 'Venue', 'MUA', 'Fotografi', 'Dekorasi', 'Entertainment', 'Lainnya'];
const CONTRACT_STATUSES: ContractStatus[] = ['Belum Kontrak', 'Sudah DP', 'Lunas'];

export default function VendorManager() {
  const { settings, vendors, addVendor, updateVendor, deleteVendor } = useWeddingStore();
  const { addToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'Semua' | VendorType>('Semua');

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<VendorType>('Satuan');
  const [category, setCategory] = useState<VendorCategory>('Katering');
  const [contactWA, setContactWA] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dpAmount, setDpAmount] = useState('');
  const [dueDateDP, setDueDateDP] = useState('');
  const [dueDateFinal, setDueDateFinal] = useState('');
  const [contractStatus, setContractStatus] = useState<ContractStatus>('Belum Kontrak');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');

  const resetForm = () => {
    setName('');
    setType('Satuan');
    setCategory('Katering');
    setContactWA('');
    setEmail('');
    setAddress('');
    setDealPrice('');
    setDpAmount('');
    setDueDateDP('');
    setDueDateFinal('');
    setContractStatus('Belum Kontrak');
    setNotes('');
    setRating('');
    setReview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      addToast('Nama vendor wajib diisi', 'error');
      return;
    }
    if (!contactWA.trim()) {
      addToast('Kontak WhatsApp wajib diisi', 'error');
      return;
    }
    if (!dealPrice || parseInt(dealPrice) <= 0) {
      addToast('Harga deal wajib diisi dan harus positif', 'error');
      return;
    }

    const vendorData = {
      name: name.trim(),
      type,
      category: type === 'All-in' ? 'WO' : category,
      contactWA: contactWA.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      dealPrice: parseInt(dealPrice),
      dpAmount: parseInt(dpAmount) || 0,
      dueDateDP: dueDateDP || undefined,
      dueDateFinal: dueDateFinal || undefined,
      contractStatus,
      notes: notes.trim() || undefined,
      rating: rating ? parseInt(rating) : undefined,
      review: review.trim() || undefined,
    };

    if (editingId) {
      updateVendor(editingId, vendorData);
      addToast('Vendor berhasil diupdate', 'success');
    } else {
      addVendor(vendorData);
      addToast('Vendor berhasil ditambahkan', 'success');
    }

    resetForm();
  };

  const handleEdit = (vendor: Vendor) => {
    setName(vendor.name);
    setType(vendor.type);
    setCategory(vendor.category);
    setContactWA(vendor.contactWA);
    setEmail(vendor.email || '');
    setAddress(vendor.address || '');
    setDealPrice(vendor.dealPrice.toString());
    setDpAmount(vendor.dpAmount.toString());
    setDueDateDP(vendor.dueDateDP || '');
    setDueDateFinal(vendor.dueDateFinal || '');
    setContractStatus(vendor.contractStatus);
    setNotes(vendor.notes || '');
    setRating(vendor.rating?.toString() || '');
    setReview(vendor.review || '');
    setEditingId(vendor.id);
    setShowForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, vendorName: string) => {
    if (window.confirm(`Hapus vendor "${vendorName}"?`)) {
      deleteVendor(id);
      addToast('Vendor berhasil dihapus', 'success');
    }
  };

  // Filter vendors
  const filteredVendors = filterType === 'Semua'
    ? vendors
    : vendors.filter(v => v.type === filterType);

  // Calculate stats
  const totalAllIn = vendors.filter(v => v.type === 'All-in').reduce((sum, v) => sum + v.dealPrice, 0);
  const totalSatuan = vendors.filter(v => v.type === 'Satuan').reduce((sum, v) => sum + v.dealPrice, 0);

  const statusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Sudah DP': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const typeBadge = (type: VendorType) => {
    return type === 'All-in'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Vendor</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola vendor pernikahan Anda</p>
        </div>
        <div className="flex gap-2">
          {!showComparison && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all text-sm font-medium"
            >
              <TrendingUp size={16} />
              Analisis
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9A5560] text-white rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/20 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Vendor
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total All-in</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalAllIn, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Satuan</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalSatuan, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Vendor</p>
              <p className="text-xl font-bold text-gray-800">{vendors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Analysis Inline Section */}
      <ComparisonAnalysis isVisible={showComparison} onClose={() => setShowComparison(false)} />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['Semua', 'All-in', 'Satuan'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              filterType === t
                ? 'border-[#87A878] bg-[#87A878]/10 text-[#6B8A5E]'
                : 'border-[#E8E0D4] bg-white text-gray-600 hover:border-[#87A878]/50'
            }`}
          >
            {t}
            {t !== 'Semua' && (
              <span className="ml-2 text-xs">
                ({vendors.filter(v => v.type === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada vendor</p>
          <p className="text-sm text-gray-400 mt-1">Mulai tambahkan vendor untuk pernikahan Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const progress = vendor.dealPrice > 0 ? (vendor.dpAmount / vendor.dealPrice) * 100 : 0;
            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-[#E8E0D4] p-5 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeBadge(vendor.type)}`}>
                        {vendor.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {vendor.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusBadge(vendor.contractStatus)}`}>
                    {vendor.contractStatus}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress Pembayaran</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#87A878] to-[#A8C49A] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga Deal:</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(vendor.dealPrice, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DP:</span>
                    <span className="font-medium text-gray-700">{formatCurrency(vendor.dpAmount, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sisa:</span>
                    <span className="font-medium text-[#B76E79]">{formatCurrency(vendor.remainingBalance, settings.currency)}</span>
                  </div>
                  {vendor.dueDateFinal && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <Calendar size={12} />
                      <span>Jatuh tempo: {new Date(vendor.dueDateFinal).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {/* Audit Info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-right">
                    {formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id, vendor.name)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 size={12} />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E8E0D4] shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-semibold text-gray-800">
              {editingId ? '✏️ Edit Vendor' : '✨ Tambah Vendor Baru'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama vendor..."
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              required
            />
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Vendor</label>
            <div className="flex gap-2">
              {(['All-in', 'Satuan'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'All-in') setCategory('WO');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    type === t
                      ? typeBadge(t) + ' border-current'
                      : 'border-[#E8E0D4] bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VendorCategory)}
              disabled={type === 'All-in'}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {VENDOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {type === 'All-in' && (
              <p className="text-xs text-gray-500 mt-1">Kategori otomatis WO untuk tipe All-in</p>
            )}
          </div>

          {/* Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactWA}
                onChange={(e) => setContactWA(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@vendor.com"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat vendor..."
              rows={2}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] resize-none"
            />
          </div>

          {/* Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Harga Deal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">DP</label>
              <input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo DP</label>
              <input
                type="date"
                value={dueDateDP}
                onChange={(e) => setDueDateDP(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo Pelunasan</label>
              <input
                type="date"
                value={dueDateFinal}
                onChange={(e) => setDueDateFinal(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Status Kontrak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Kontrak</label>
            <div className="flex gap-2 flex-wrap">
              {CONTRACT_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setContractStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    contractStatus === status
                      ? statusBadge(status) + ' border-current'
                      : 'border-[#E8E0D4] bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] resize-none"
            />
          </div>

          {/* Rating & Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating (1-5)</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1-5"
                min="1"
                max="5"
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Review</label>
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Review singkat..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-xl hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#87A878] to-[#6B8A5E] text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
