import { useState, useRef } from 'react';
import { useWeddingStore, Vendor, VendorType, VendorCategory, ContractStatus, CustomChecklistItem } from '../store';
import { formatCurrency } from '../helpers';
import { formatAuditInfo } from '../helpers/timeAgo';
import { getChecklistForCategory, getDefaultChecklistValues, countCheckedItems, migrateChecklistFormat, ChecklistValue } from '../helpers/vendorChecklist';
import { MAX_VENDOR_PHOTOS, validatePhotoFile, uploadVendorPhoto, deleteVendorPhoto } from '../helpers/vendorPhotos';
import { useToastStore } from '../toastStore';
import ComparisonAnalysis from './ComparisonAnalysis';
import VendorDetailModal from './VendorDetailModal';
import VendorPhotoCarousel from './VendorPhotoCarousel';
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
  CheckSquare,
  Square,
  ListChecks,
  Image as ImageIcon,
  Eye,
  UploadCloud,
} from 'lucide-react';

const VENDOR_CATEGORIES: VendorCategory[] = ['WO', 'Katering', 'Venue', 'MUA', 'Fotografi', 'Dekorasi', 'Entertainment', 'Busana', 'MC', 'Undangan & Souvenir', 'Lainnya'];
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
  const [checklist, setChecklist] = useState<Record<string, ChecklistValue>>({});
  const [customChecklist, setCustomChecklist] = useState<CustomChecklistItem[]>([]);
  const [showCustomChecklistForm, setShowCustomChecklistForm] = useState(false);
  const [customChecklistQuestion, setCustomChecklistQuestion] = useState('');
  const [customChecklistDescription, setCustomChecklistDescription] = useState('');

  // Foto contoh vendor (maksimal 5)
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Detail modal
  const [detailVendorId, setDetailVendorId] = useState<string | null>(null);
  const detailVendor = vendors.find((v) => v.id === detailVendorId) || null;

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
    setChecklist({});
    setCustomChecklist([]);
    setShowCustomChecklistForm(false);
    setCustomChecklistQuestion('');
    setCustomChecklistDescription('');
    setPhotos([]);
    setIsUploadingPhotos(false);
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
      checklist: Object.keys(checklist).length > 0 ? checklist : undefined,
      customChecklist: customChecklist.length > 0 ? customChecklist : undefined,
      photos: photos.length > 0 ? photos : undefined,
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
    // Migrate checklist format jika data lama
    setChecklist(migrateChecklistFormat(vendor.checklist, vendor.category));
    // Load custom checklist
    setCustomChecklist(vendor.customChecklist || []);
    // Load foto contoh vendor
    setPhotos(vendor.photos || []);
    setEditingId(vendor.id);
    setShowForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, vendorName: string) => {
    if (window.confirm(`Hapus vendor "${vendorName}"?`)) {
      const vendor = vendors.find((v) => v.id === id);
      // Bersihkan foto dari storage jika ada
      if (vendor?.photos && vendor.photos.length > 0) {
        vendor.photos.forEach((url) => deleteVendorPhoto(url));
      }
      deleteVendor(id);
      if (detailVendorId === id) setDetailVendorId(null);
      addToast('Vendor berhasil dihapus', 'success');
    }
  };

  // ---- Foto contoh vendor ----
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_VENDOR_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      addToast(`Maksimal ${MAX_VENDOR_PHOTOS} foto vendor`, 'error');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    const selected = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      addToast(`Hanya ${remainingSlots} foto pertama yang diambil (maksimal ${MAX_VENDOR_PHOTOS} foto)`, 'info');
    }

    setIsUploadingPhotos(true);
    const uploaded: string[] = [];
    for (const file of selected) {
      const error = validatePhotoFile(file);
      if (error) {
        addToast(`${file.name}: ${error}`, 'error');
        continue;
      }
      try {
        const url = await uploadVendorPhoto(file);
        uploaded.push(url);
      } catch {
        addToast(`Gagal upload ${file.name}`, 'error');
      }
    }
    if (uploaded.length > 0) {
      setPhotos((prev) => [...prev, ...uploaded].slice(0, MAX_VENDOR_PHOTOS));
      addToast(`${uploaded.length} foto berhasil ditambahkan`, 'success');
    }
    setIsUploadingPhotos(false);

    // Reset input agar file yang sama bisa dipilih ulang
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const removed = photos[index];
    if (removed) deleteVendorPhoto(removed);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleChecklist = (itemId: string) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: {
        checked: !prev[itemId]?.checked,
        notes: prev[itemId]?.notes || ''
      }
    }));
  };

  const handleChangeChecklistNote = (itemId: string, notes: string) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: {
        checked: prev[itemId]?.checked || false,
        notes
      }
    }));
  };

  const handleCategoryChange = (newCategory: VendorCategory) => {
    setCategory(newCategory);
    // Reset checklist dengan kategori baru
    setChecklist(getDefaultChecklistValues(newCategory));
  };

  const handleAddCustomChecklist = () => {
    if (!customChecklistQuestion.trim()) {
      addToast('Pertanyaan checklist wajib diisi', 'error');
      return;
    }

    const newItem: CustomChecklistItem = {
      id: `custom_${Date.now()}`,
      question: customChecklistQuestion.trim(),
      description: customChecklistDescription.trim() || undefined,
    };

    setCustomChecklist([...customChecklist, newItem]);
    setCustomChecklistQuestion('');
    setCustomChecklistDescription('');
    setShowCustomChecklistForm(false);
    addToast('Checklist custom berhasil ditambahkan', 'success');
  };

  const handleRemoveCustomChecklist = (itemId: string) => {
    setCustomChecklist(customChecklist.filter(item => item.id !== itemId));
    // Hapus juga dari checklist state jika ada
    setChecklist(prev => {
      const newChecklist = { ...prev };
      delete newChecklist[itemId];
      return newChecklist;
    });
    addToast('Checklist custom berhasil dihapus', 'success');
  };

  // Filter vendors, lalu urutkan berdasarkan data terbaru (last update di atas)
  const lastUpdated = (v: Vendor) => new Date(v.updatedAt || v.createdAt || 0).getTime();
  const filteredVendors = (filterType === 'Semua'
    ? vendors
    : vendors.filter(v => v.type === filterType)
  ).slice().sort((a, b) => lastUpdated(b) - lastUpdated(a));

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
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              <TrendingUp size={16} />
              Analisis
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => { 
                resetForm(); 
                setChecklist(getDefaultChecklistValues('Katering')); // Initialize dengan kategori default
                setShowForm(true); 
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] hover:bg-[#9A5560] text-white rounded-md transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Vendor
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
              <Building2 size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[13px] text-gray-500">Total All-in</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalAllIn, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
              <Building2 size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[13px] text-gray-500">Total Satuan</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalSatuan, settings.currency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-5 border border-[#E8E0D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#87A878]/10 rounded-md flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-[13px] text-gray-500">Total Vendor</p>
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
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
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

      {/* Inline Form - DIPINDAH KE ATAS */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-[#E8E0D4] shadow-sm space-y-5">
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
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
                  className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 transition-colors ${
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
              onChange={(e) => handleCategoryChange(e.target.value as VendorCategory)}
              disabled={type === 'All-in'}
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {VENDOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {type === 'All-in' && (
              <p className="text-xs text-gray-500 mt-1">Kategori otomatis WO untuk tipe All-in</p>
            )}
          </div>

          {/* Checklist Detail */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <ListChecks size={16} className="inline mr-2" />
                Checklist Detail Paket
              </label>
              <span className="text-xs text-gray-500">
                {countCheckedItems(checklist)} dari {getChecklistForCategory(category).length + customChecklist.length} item
                {customChecklist.length > 0 && ` (${customChecklist.length} custom)`}
              </span>
            </div>
            <div className="bg-[#FDFBF7] rounded-md p-4 border border-[#E8E0D4] space-y-2 max-h-96 overflow-y-auto">
              {getChecklistForCategory(category).map((item) => {
                const isChecked = checklist[item.id]?.checked || false;
                const notes = checklist[item.id]?.notes || '';
                
                return (
                  <div key={item.id} className="p-2 hover:bg-white rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(item.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isChecked ? (
                          <CheckSquare size={20} className="text-[#87A878]" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${isChecked ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                          {item.question}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        )}
                        {/* Input notes selalu muncul dengan styling berbeda */}
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => handleChangeChecklistNote(item.id, e.target.value)}
                          placeholder={isChecked ? "Tambahkan catatan (opsional)..." : "Catatan (misal: biaya upgrade...)"}
                          className={`w-full mt-2 text-xs px-3 py-1.5 border-l-2 rounded-r-lg focus:ring-2 outline-none transition-colors ${
                            isChecked 
                              ? 'border-[#B76E79] bg-white focus:ring-[#B76E79]/30 focus:border-[#B76E79]' 
                              : 'border-gray-300 bg-gray-50 focus:ring-gray-300/30 focus:border-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Checklist Section */}
            {customChecklist.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <ListChecks size={16} className="inline mr-2 text-[#D4A843]" />
                    Checklist Custom
                  </label>
                  <span className="text-xs text-gray-500">
                    {customChecklist.filter(item => checklist[item.id]?.checked).length} dari {customChecklist.length} item
                  </span>
                </div>
                <div className="bg-[#FFF9E6] rounded-md p-4 border border-[#D4A843]/30 space-y-2">
                  {customChecklist.map((item) => {
                    const isChecked = checklist[item.id]?.checked || false;
                    const notes = checklist[item.id]?.notes || '';
                    
                    return (
                      <div key={item.id} className="p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleChecklist(item.id)}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {isChecked ? (
                              <CheckSquare size={20} className="text-[#D4A843]" />
                            ) : (
                              <Square size={20} className="text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`text-sm ${isChecked ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                  {item.question}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomChecklist(item.id)}
                                className="flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Hapus checklist custom"
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                            {/* Input notes selalu muncul dengan styling berbeda */}
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => handleChangeChecklistNote(item.id, e.target.value)}
                              placeholder={isChecked ? "Tambahkan catatan (opsional)..." : "Catatan (misal: biaya upgrade...)"}
                              className={`w-full mt-2 text-xs px-3 py-1.5 border-l-2 rounded-r-lg focus:ring-2 outline-none transition-colors ${
                                isChecked 
                                  ? 'border-[#D4A843] bg-white focus:ring-[#D4A843]/30 focus:border-[#D4A843]' 
                                  : 'border-gray-300 bg-gray-50 focus:ring-gray-300/30 focus:border-gray-400'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Custom Checklist Button/Form */}
            <div className="mt-4">
              {!showCustomChecklistForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomChecklistForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#D4A843]/50 text-[#D4A843] rounded-md hover:bg-[#FFF9E6] hover:border-[#D4A843] transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Tambah Checklist Custom
                </button>
              ) : (
                <div className="bg-[#FFF9E6] rounded-md p-4 border border-[#D4A843]/30 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pertanyaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customChecklistQuestion}
                      onChange={(e) => setCustomChecklistQuestion(e.target.value)}
                      placeholder="Contoh: Apakah termasuk biaya transportasi?"
                      className="w-full px-4 py-2.5 border border-[#D4A843]/30 rounded-md focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Deskripsi (opsional)
                    </label>
                    <input
                      type="text"
                      value={customChecklistDescription}
                      onChange={(e) => setCustomChecklistDescription(e.target.value)}
                      placeholder="Penjelasan detail pertanyaan..."
                      className="w-full px-4 py-2.5 border border-[#D4A843]/30 rounded-md focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] outline-none bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomChecklistForm(false);
                        setCustomChecklistQuestion('');
                        setCustomChecklistDescription('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomChecklist}
                      className="flex-1 px-4 py-2 bg-[#D4A843] hover:bg-[#B8922F] text-white rounded-md transition-colors text-sm font-medium"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] resize-none"
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jatuh Tempo Pelunasan</label>
              <input
                type="date"
                value={dueDateFinal}
                onChange={(e) => setDueDateFinal(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
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
                  className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
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
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7] resize-none"
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
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Review</label>
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Review singkat..."
                className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-md focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Foto Contoh Vendor (maksimal 5) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <ImageIcon size={16} className="inline mr-1.5 text-[#B76E79]" />
              Foto Contoh Vendor ({photos.length}/{MAX_VENDOR_PHOTOS})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {photos.map((url, i) => (
                <div key={`${url.slice(-24)}-${i}`} className="relative aspect-square rounded-md overflow-hidden border border-[#E8E0D4] group/photo">
                  <img src={url} alt={`Contoh ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    aria-label="Hapus foto"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover/photo:opacity-100 hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
                    {i + 1}
                  </span>
                </div>
              ))}
              {photos.length < MAX_VENDOR_PHOTOS && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhotos}
                  className="aspect-square rounded-md border-2 border-dashed border-[#B76E79]/40 text-[#B76E79] flex flex-col items-center justify-center gap-1 hover:bg-[#B76E79]/5 hover:border-[#B76E79] transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isUploadingPhotos ? (
                    <>
                      <UploadCloud size={18} className="animate-pulse" />
                      <span className="text-[10px] font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span className="text-[10px] font-medium">Tambah</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Upload contoh hasil kerja vendor (makanan, dekorasi, venue, dll). Maksimal {MAX_VENDOR_PHOTOS} foto, format PNG/JPG/WEBP.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-5 py-2.5 bg-[#F5F0E8] text-gray-600 rounded-md hover:bg-[#E8E0D4] transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-[#2F6A43] hover:bg-[#1E4A2E] text-white rounded-md transition-colors text-sm font-medium"
            >
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#E8E0D4]">
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-lg flex items-center justify-center mx-auto mb-4">
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
              <div key={vendor.id} className="bg-white rounded-md border border-[#E8E0D4] p-5 transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => setDetailVendorId(vendor.id)}
                    className="flex-1 min-w-0 text-left group/name"
                    title="Lihat detail vendor"
                  >
                    <h3 className="font-semibold text-gray-800 truncate group-hover/name:text-[#6B8A5E] group-hover/name:underline transition-colors">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${typeBadge(vendor.type)}`}>
                        {vendor.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {vendor.category}
                      </span>
                    </div>
                  </button>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ml-2 ${statusBadge(vendor.contractStatus)}`}>
                    {vendor.contractStatus}
                  </span>
                </div>

                {/* Preview foto (carousel ala Instagram, tidak tampil semua) */}
                {vendor.photos && vendor.photos.length > 0 && (
                  <div className="mb-3">
                    <VendorPhotoCarousel photos={vendor.photos} vendorName={vendor.name} />
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-3">
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

                {/* Checklist Summary */}
                {vendor.checklist && countCheckedItems(vendor.checklist) > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <ListChecks size={14} className="text-[#87A878]" />
                      <span className="font-medium">
                        {countCheckedItems(vendor.checklist)} item termasuk
                        {vendor.customChecklist && vendor.customChecklist.length > 0 && (
                          <span className="text-[#D4A843] ml-1">
                            ({vendor.customChecklist.filter(item => vendor.checklist?.[item.id]?.checked).length} custom)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {/* Template checklist items */}
                      {getChecklistForCategory(vendor.category)
                        .filter(item => vendor.checklist?.[item.id]?.checked)
                        .slice(0, 5)
                        .map(item => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-0.5 bg-[#87A878]/10 text-[#6B8A5E] rounded-full border border-[#87A878]/20"
                            title={vendor.checklist?.[item.id]?.notes || undefined}
                          >
                            {item.question}
                            {vendor.checklist?.[item.id]?.notes && (
                              <span className="ml-1 text-[10px] opacity-75">•</span>
                            )}
                          </span>
                        ))}
                      {/* Custom checklist items */}
                      {vendor.customChecklist
                        ?.filter(item => vendor.checklist?.[item.id]?.checked)
                        .slice(0, 5 - getChecklistForCategory(vendor.category).filter(item => vendor.checklist?.[item.id]?.checked).length)
                        .map(item => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-0.5 bg-[#D4A843]/10 text-[#B8922F] rounded-full border border-[#D4A843]/20"
                            title={vendor.checklist?.[item.id]?.notes || undefined}
                          >
                            {item.question}
                            {vendor.checklist?.[item.id]?.notes && (
                              <span className="ml-1 text-[10px] opacity-75">•</span>
                            )}
                          </span>
                        ))}
                      {countCheckedItems(vendor.checklist) > 5 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          +{countCheckedItems(vendor.checklist) - 5} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-right">
                    {formatAuditInfo(vendor.updatedBy, vendor.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setDetailVendorId(vendor.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-[#87A878]/10 text-[#6B8A5E] rounded-lg hover:bg-[#87A878]/20 transition-colors font-medium"
                  >
                    <Eye size={12} />
                    Detail
                  </button>
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

      {/* Detail Vendor Modal */}
      {detailVendor && (
        <VendorDetailModal
          vendor={detailVendor}
          onClose={() => setDetailVendorId(null)}
          onEdit={(v) => {
            setDetailVendorId(null);
            handleEdit(v);
          }}
        />
      )}
    </div>
  );
}
