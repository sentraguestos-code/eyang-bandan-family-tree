import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Upload, X, Plus, Calendar, User,
  Tag, ChevronLeft, ChevronRight, Trash2,
  AlertCircle, CheckCircle, Search, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryPhoto {
  id: string;
  title: string;
  description?: string | null;
  photo_url: string;
  uploader_name: string;
  category: string;
  taken_at?: string | null;
  created_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchPhotos(category?: string, search?: string): Promise<GalleryPhoto[]> {
  let q = supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
  if (category && category !== 'semua') q = q.eq('category', category);
  if (search?.trim()) q = q.ilike('title', `%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

async function uploadPhoto(input: Omit<GalleryPhoto, 'id' | 'created_at'>): Promise<GalleryPhoto> {
  const { data, error } = await supabase.from('gallery_photos').insert([input]).select().single();
  if (error) throw error;
  return data;
}

async function deletePhoto(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
  if (error) throw error;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'semua',        label: 'Semua',        color: 'bg-stone-100 text-stone-700' },
  { value: 'umum',         label: 'Umum',         color: 'bg-amber-100 text-amber-700' },
  { value: 'silaturahmi',  label: 'Silaturahmi',  color: 'bg-emerald-100 text-emerald-700' },
  { value: 'pernikahan',   label: 'Pernikahan',   color: 'bg-pink-100 text-pink-700' },
  { value: 'wisuda',       label: 'Wisuda',        color: 'bg-blue-100 text-blue-700' },
  { value: 'lainnya',      label: 'Lainnya',      color: 'bg-purple-100 text-purple-700' },
];

const getCategoryColor = (cat: string) =>
  CATEGORIES.find((c) => c.value === cat)?.color ?? 'bg-stone-100 text-stone-700';

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    uploader_name: '',
    category: 'umum',
    taken_at: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran foto maksimal 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      setPhotoBase64(b64);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoBase64) { setError('Pilih foto terlebih dahulu'); return; }
    if (!form.title.trim()) { setError('Judul foto wajib diisi'); return; }
    if (!form.uploader_name.trim()) { setError('Nama pengunggah wajib diisi'); return; }

    setSubmitting(true);
    setError('');
    try {
      await uploadPhoto({
        title: form.title.trim(),
        description: form.description.trim() || null,
        uploader_name: form.uploader_name.trim(),
        category: form.category,
        taken_at: form.taken_at || null,
        photo_url: photoBase64,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal mengunggah foto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            Upload Foto
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo upload */}
          <div>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-56 object-cover rounded-2xl shadow-md" />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setPhotoBase64(''); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <input type="file" id="gallery-photo" accept="image/*" onChange={handleFile} className="hidden" />
                <label
                  htmlFor="gallery-photo"
                  className="flex flex-col items-center justify-center gap-3 w-full h-48 border-2 border-dashed border-stone-300 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                    <Images className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-stone-700">Klik untuk pilih foto</p>
                    <p className="text-sm text-stone-400">PNG, JPG hingga 5MB</p>
                  </div>
                </label>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Judul Foto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Contoh: Silaturahmi 2024 di Bogor"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
              required
            />
          </div>

          {/* Uploader name */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Nama Anda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.uploader_name}
              onChange={(e) => setForm((f) => ({ ...f, uploader_name: e.target.value }))}
              placeholder="Nama lengkap Anda"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.value !== 'semua').map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all
                    ${form.category === cat.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Keterangan (Opsional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ceritakan tentang foto ini..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal Foto (Opsional)</label>
            <input
              type="date"
              value={form.taken_at}
              onChange={(e) => setForm((f) => ({ ...f, taken_at: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-60"
          >
            {submitting ? <><LoadingSpinner size="sm" /><span>Mengunggah...</span></> : <><Upload className="w-5 h-5" /><span>Upload Foto</span></>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
  onDelete,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (id: string) => void;
}) {
  const photo = photos[index];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  const handleDelete = async () => {
    setDeleting(true);
    await deletePhoto(photo.id);
    onDelete(photo.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next */}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={photo.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full mx-4 md:mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.photo_url}
          alt={photo.title}
          className="w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl"
        />

        {/* Info bar */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{photo.title}</h3>
            {photo.description && (
              <p className="text-stone-400 text-sm mt-1">{photo.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />{photo.uploader_name}
              </span>
              {photo.taken_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{photo.taken_at}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(photo.category)}`}>
                {photo.category}
              </span>
            </div>
          </div>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 bg-white/10 hover:bg-red-500/30 text-stone-400 hover:text-red-400 rounded-xl transition-colors flex-shrink-0"
              title="Hapus foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-red-400 text-xs">Hapus?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors"
              >
                {deleting ? '...' : 'Ya'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 bg-white/10 text-stone-300 text-xs rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Counter */}
        <p className="text-center text-stone-600 text-xs mt-3">
          {index + 1} / {photos.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPhotos(activeCategory, searchQuery);
      setPhotos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeCategory]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    load();
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-1 flex items-center gap-3">
            <Images className="w-8 h-8 text-amber-600" />
            Galeri Keluarga
          </h1>
          <p className="text-stone-500">Kenangan dan momen keluarga besar Eyang Bandan</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Upload Foto</span>
        </button>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-semibold text-emerald-800">Foto berhasil diunggah!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari foto..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none bg-white transition-all"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2
              ${activeCategory === cat.value
                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                : 'border-stone-200 text-stone-600 hover:border-amber-300 bg-white'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Memuat galeri..." />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Images className="w-10 h-10 text-stone-400" />
          </div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">Belum Ada Foto</h3>
          <p className="text-stone-500 mb-6">Jadilah yang pertama mengunggah foto keluarga!</p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload Foto Pertama
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">{photos.length} foto ditemukan</p>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="break-inside-avoid cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm line-clamp-1">{photo.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(photo.category)}`}>
                        {photo.category}
                      </span>
                      <span className="text-stone-300 text-[10px]">{photo.uploader_name}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
            onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
