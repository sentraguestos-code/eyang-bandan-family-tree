import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Calendar, FileText, Save, ArrowLeft, Upload, X, Search, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchMemberById, updateMember, deleteMember } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditMemberForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    gender: '' as 'male' | 'female' | '',
    bio: '',
    birth_date: '',
    death_date: '',
    location_city: '',
    location_lat: '',
    location_lng: '',
    photo_url: '',
    child_order: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const m = await fetchMemberById(id);
        if (!m) { navigate('/tree'); return; }
        setMember(m);
        setForm({
          name: m.name,
          gender: (m.gender as 'male' | 'female') ?? '',
          bio: m.bio ?? '',
          birth_date: m.birth_date ?? '',
          death_date: m.death_date ?? '',
          location_city: m.location_city ?? '',
          location_lat: m.location_lat?.toString() ?? '',
          location_lng: m.location_lng?.toString() ?? '',
          photo_url: m.photo_url ?? '',
          child_order: m.child_order?.toString() ?? '',
        });
        if (m.photo_url) setPhotoPreview(m.photo_url);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

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
        alert('Lokasi tidak ditemukan.');
      }
    } catch {
      alert('Gagal mencari lokasi.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.name.trim()) { setErrorMsg('Nama wajib diisi'); setStatus('error'); return; }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      await updateMember(id, {
        name: form.name.trim(),
        gender: (form.gender as 'male' | 'female') || null,
        bio: form.bio.trim() || null,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        location_city: form.location_city.trim() || null,
        location_lat: form.location_lat ? parseFloat(form.location_lat) : null,
        location_lng: form.location_lng ? parseFloat(form.location_lng) : null,
        photo_url: form.photo_url || null,
        child_order: form.child_order ? parseInt(form.child_order) : null,
      });
      setStatus('success');
      setTimeout(() => navigate('/tree'), 1500);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Terjadi kesalahan');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteMember(id);
      navigate('/tree');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Gagal menghapus');
      setStatus('error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data..." />
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/tree" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pohon Keluarga
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-1">Edit Profil</h1>
            <p className="text-stone-500 text-sm">{member.name} · Generasi {member.generation}</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>

      {/* Status banners */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="font-semibold text-emerald-800">Berhasil diperbarui!</p>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-5">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Informasi Dasar
          </h2>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
              required
            />
          </div>

          {/* Child order */}
          {member.parent_id && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Anak Ke- <span className="text-stone-400 font-normal">(urutan di antara saudara)</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.child_order}
                onChange={(e) => setForm((f) => ({ ...f, child_order: e.target.value }))}
                placeholder="Contoh: 1, 2, 3 ..."
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
              />
              <p className="text-xs text-stone-400 mt-1">Urutan anak dari orang tuanya. Anak pertama isi 1, anak ketiga isi 3.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Jenis Kelamin</label>
            <div className="flex gap-3">
              {[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }].map((g) => (
                <button key={g.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g.value as 'male' | 'female' }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                    ${form.gender === g.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Foto</label>
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="Preview" className="w-28 h-28 object-cover rounded-2xl shadow-md" />
                <button type="button"
                  onClick={() => { setPhotoPreview(null); setForm((f) => ({ ...f, photo_url: '' })); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <input type="file" id="photo" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <label htmlFor="photo"
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

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Bio Singkat</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal Lahir</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="date" value={form.birth_date}
                  onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal Wafat</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="date" value={form.death_date}
                  onChange={(e) => setForm((f) => ({ ...f, death_date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Lokasi
          </h2>
          <div className="flex gap-2">
            <input type="text" value={form.location_city}
              onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))}
              placeholder="Nama kota..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
            />
            <button type="button" onClick={handleGeocode} disabled={geocoding}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {geocoding ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              Cari
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Latitude</label>
              <input type="number" step="any" value={form.location_lat}
                onChange={(e) => setForm((f) => ({ ...f, location_lat: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Longitude</label>
              <input type="number" step="any" value={form.location_lng}
                onChange={(e) => setForm((f) => ({ ...f, location_lng: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <motion.button type="submit" disabled={isSubmitting || status === 'success'}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <><LoadingSpinner size="sm" /><span>Menyimpan...</span></> : <><Save className="w-5 h-5" /><span>Simpan Perubahan</span></>}
        </motion.button>
      </form>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 text-center mb-2">Hapus Anggota?</h3>
              <p className="text-stone-500 text-center text-sm mb-6">
                Data <strong>{member.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <LoadingSpinner size="sm" /> : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
