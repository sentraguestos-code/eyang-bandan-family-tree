import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Calendar, FileText, Save, ArrowLeft, Upload, X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchMemberById, addMember, fetchAllMembers } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddMemberForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const parentIdParam = searchParams.get('parentId');

  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [parentMember, setParentMember] = useState<FamilyMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingParent, setLoadingParent] = useState(false);

  const [form, setForm] = useState({
    name: '',
    gender: '' as 'male' | 'female' | '',
    bio: '',
    birth_date: '',
    death_date: '',
    location_city: '',
    location_lat: '',
    location_lng: '',
    parent_id: parentIdParam ?? '',
    photo_url: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [parentResults, setParentResults] = useState<FamilyMember[]>([]);
  const [showParentSearch, setShowParentSearch] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    async function load() {
      const members = await fetchAllMembers();
      setAllMembers(members);

      if (parentIdParam) {
        setLoadingParent(true);
        const parent = await fetchMemberById(parentIdParam);
        if (parent) setParentMember(parent);
        setLoadingParent(false);
      }
    }
    load();
  }, [parentIdParam]);

  const handleParentSearch = (q: string) => {
    setParentSearch(q);
    if (!q.trim()) { setParentResults([]); return; }
    const lower = q.toLowerCase();
    setParentResults(allMembers.filter((m) => m.name.toLowerCase().includes(lower)).slice(0, 8));
  };

  const selectParent = (m: FamilyMember) => {
    setParentMember(m);
    setForm((f) => ({ ...f, parent_id: m.id }));
    setShowParentSearch(false);
    setParentSearch('');
    setParentResults([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      setForm((f) => ({ ...f, photo_url: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleGeocode = async () => {
    if (!form.location_city.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location_city)}`
      );
      const results = await res.json();
      if (results?.length > 0) {
        const { lat, lon } = results[0];
        setForm((f) => ({ ...f, location_lat: lat, location_lng: lon }));
      } else {
        alert('Lokasi tidak ditemukan. Coba nama yang lebih spesifik.');
      }
    } catch {
      alert('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setGeocoding(false);
    }
  };

  const isRoot = allMembers.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrorMsg('Nama wajib diisi'); setStatus('error'); return; }
    if (!isRoot && !form.parent_id) { setErrorMsg('Pilih orang tua terlebih dahulu'); setStatus('error'); return; }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const parent = form.parent_id ? allMembers.find((m) => m.id === form.parent_id) ?? null : null;
      const generation = parent ? parent.generation + 1 : 1;

      await addMember({
        name: form.name.trim(),
        gender: (form.gender as 'male' | 'female') || null,
        bio: form.bio.trim() || null,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        location_city: form.location_city.trim() || null,
        location_lat: form.location_lat ? parseFloat(form.location_lat) : null,
        location_lng: form.location_lng ? parseFloat(form.location_lng) : null,
        parent_id: form.parent_id || null,
        photo_url: form.photo_url || null,
        generation,
      });

      setStatus('success');
      setTimeout(() => navigate('/tree'), 1800);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Terjadi kesalahan saat menyimpan data');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/tree" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pohon Keluarga
        </Link>
        <h1 className="text-3xl font-bold text-stone-800 mb-1">
          {isRoot ? 'Tambah Eyang Bandan' : 'Tambah Anggota Keluarga'}
        </h1>
        <p className="text-stone-500 text-sm">
          {isRoot ? 'Masukkan data akar keluarga' : 'Lengkapi data anggota baru'}
        </p>
      </div>

      {/* Status banners */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4"
          >
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">Berhasil disimpan!</p>
              <p className="text-sm text-emerald-600">Mengalihkan ke pohon keluarga...</p>
            </div>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent selector */}
        {!isRoot && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
            <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              Orang Tua
            </h2>

            {loadingParent ? (
              <LoadingSpinner size="sm" />
            ) : parentMember ? (
              <div className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-700 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{parentMember.name}</p>
                    <p className="text-xs text-stone-500">Generasi {parentMember.generation}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setParentMember(null); setForm((f) => ({ ...f, parent_id: '' })); }}
                  className="p-2 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowParentSearch(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-stone-300 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all text-stone-500 hover:text-amber-700"
                >
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Cari Orang Tua</span>
                </button>

                <AnimatePresence>
                  {showParentSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e) => handleParentSearch(e.target.value)}
                        placeholder="Ketik nama orang tua..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                        autoFocus
                      />
                      {parentResults.length > 0 && (
                        <div className="mt-2 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                          {parentResults.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => selectParent(m)}
                              className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-0"
                            >
                              <p className="font-medium text-stone-800 text-sm">{m.name}</p>
                              <p className="text-xs text-stone-400">Generasi {m.generation}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-5">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Informasi Dasar
          </h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Jenis Kelamin</label>
            <div className="flex gap-3">
              {[
                { value: 'male', label: 'Laki-laki' },
                { value: 'female', label: 'Perempuan' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g.value as 'male' | 'female' }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                    ${form.gender === g.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Foto (Opsional)</label>
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="Preview" className="w-28 h-28 object-cover rounded-2xl shadow-md" />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setForm((f) => ({ ...f, photo_url: '' })); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <input type="file" id="photo" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <label
                  htmlFor="photo"
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-stone-300 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-600 text-sm">Upload Foto</p>
                    <p className="text-xs text-stone-400">PNG, JPG hingga 5MB</p>
                  </div>
                </label>
              </>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Bio Singkat (Opsional)</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Ceritakan sedikit tentang anggota keluarga ini..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal Lahir</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal Wafat</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  value={form.death_date}
                  onChange={(e) => setForm((f) => ({ ...f, death_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Lokasi (Opsional)
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={form.location_city}
              onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))}
              placeholder="Contoh: Jakarta, Bogor..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {geocoding ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              Cari
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.location_lat}
                onChange={(e) => setForm((f) => ({ ...f, location_lat: e.target.value }))}
                placeholder="-6.2088"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.location_lng}
                onChange={(e) => setForm((f) => ({ ...f, location_lng: e.target.value }))}
                placeholder="106.8456"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {form.location_lat && form.location_lng && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Koordinat ditemukan: {parseFloat(form.location_lat).toFixed(4)}, {parseFloat(form.location_lng).toFixed(4)}
            </p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting || status === 'success'}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><LoadingSpinner size="sm" /><span>Menyimpan...</span></>
          ) : (
            <><Save className="w-5 h-5" /><span>Simpan Data</span></>
          )}
        </motion.button>
      </form>
    </div>
  );
}
