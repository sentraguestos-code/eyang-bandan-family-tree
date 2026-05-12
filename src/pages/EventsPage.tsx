import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, MapPin, Clock, Users, Plus, X, CheckCircle,
  AlertCircle, ChevronRight, Search, UserCheck, Trash2, Info,
  Phone, FileText, PartyPopper
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchAllMembers } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  event_time?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  banner_url?: string | null;
  created_at: string;
}

interface Registration {
  id: string;
  event_id: string;
  member_id?: string | null;
  member_name: string;
  generation?: number | null;
  parent_lineage?: string | null;
  phone?: string | null;
  will_attend: boolean;
  attendee_count: number;
  notes?: string | null;
  created_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events').select('*').order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function createEvent(input: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  const { data, error } = await supabase.from('events').insert([input]).select().single();
  if (error) throw error;
  return data;
}

async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

async function fetchRegistrations(eventId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('event_registrations').select('*')
    .eq('event_id', eventId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function registerToEvent(input: Omit<Registration, 'id' | 'created_at'>): Promise<Registration> {
  const { data, error } = await supabase
    .from('event_registrations').insert([input]).select().single();
  if (error) throw error;
  return data;
}

async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase.from('event_registrations').delete().eq('id', id);
  if (error) throw error;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  upcoming:  { label: 'Akan Datang', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ongoing:   { label: 'Sedang Berlangsung', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: 'Selesai', color: 'bg-stone-100 text-stone-600 border-stone-200' },
};

// ─── Create Event Modal ───────────────────────────────────────────────────────

function CreateEventModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    event_date: '', event_time: '', status: 'upcoming' as Event['status'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date) { setError('Nama acara dan tanggal wajib diisi'); return; }
    setSubmitting(true);
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        event_date: form.event_date,
        event_time: form.event_time || null,
        status: form.status,
        banner_url: null,
      });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal membuat acara');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" /> Buat Acara Baru
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Nama Acara <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Contoh: Silaturahmi Akbar Ke-4"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" value={form.event_date} onChange={(e) => setForm(f => ({ ...f, event_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Waktu</label>
              <input type="time" value={form.event_time} onChange={(e) => setForm(f => ({ ...f, event_time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Lokasi</label>
            <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Contoh: Gedung Serbaguna, Bogor"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Status</label>
            <div className="flex gap-2">
              {(['upcoming', 'ongoing', 'completed'] as Event['status'][]).map((s) => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                    ${form.status === s ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600'}`}>
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Deskripsi / Informasi Acara</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Informasi lengkap tentang acara, dress code, agenda, dll..."
              rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-60">
            {submitting ? <><LoadingSpinner size="sm" /><span>Menyimpan...</span></> : <><Plus className="w-5 h-5" /><span>Buat Acara</span></>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Register Modal ───────────────────────────────────────────────────────────

function RegisterModal({ event, onClose, onSuccess }: { event: Event; onClose: () => void; onSuccess: () => void }) {
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState({
    phone: '', attendee_count: '1', notes: '', will_attend: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    fetchAllMembers().then(m => { setAllMembers(m); setLoadingMembers(false); });
  }, []);

  const filtered = searchQuery.trim()
    ? allMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  // Build parent lineage string
  const getLineage = (member: FamilyMember): string => {
    const memberMap = new Map(allMembers.map(m => [m.id, m]));
    const parts: string[] = [];
    let cur: FamilyMember | undefined = member;
    while (cur?.parent_id) {
      cur = memberMap.get(cur.parent_id);
      if (cur) parts.unshift(cur.name);
    }
    return parts.length > 0 ? parts.join(' → ') : 'Eyang Bandan';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) { setError('Pilih nama Anda dari daftar'); return; }
    setSubmitting(true);
    try {
      await registerToEvent({
        event_id: event.id,
        member_id: selectedMember.id,
        member_name: selectedMember.name,
        generation: selectedMember.generation,
        parent_lineage: getLineage(selectedMember),
        phone: form.phone.trim() || null,
        will_attend: form.will_attend,
        attendee_count: parseInt(form.attendee_count) || 1,
        notes: form.notes.trim() || null,
      });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal mendaftar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" /> Daftar Hadir
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Member search */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Cari Nama Anda <span className="text-red-500">*</span>
            </label>
            {selectedMember ? (
              <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4">
                <div>
                  <p className="font-bold text-stone-800">{selectedMember.name}</p>
                  <p className="text-xs text-stone-500">Generasi {selectedMember.generation} · {getLineage(selectedMember)}</p>
                </div>
                <button type="button" onClick={() => setSelectedMember(null)}
                  className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama Anda..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all" />
                {loadingMembers && <div className="mt-2"><LoadingSpinner size="sm" /></div>}
                {filtered.length > 0 && (
                  <div className="mt-2 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(m => (
                      <button key={m.id} type="button" onClick={() => { setSelectedMember(m); setSearchQuery(''); }}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-0">
                        <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                        <p className="text-xs text-stone-400">Generasi {m.generation} · {getLineage(m)}</p>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && filtered.length === 0 && !loadingMembers && (
                  <p className="mt-2 text-sm text-stone-400 text-center py-2">
                    Nama tidak ditemukan. Minta admin untuk menambahkan Anda ke database.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Konfirmasi Kehadiran</label>
            <div className="flex gap-3">
              {[{ val: true, label: '✅ Hadir' }, { val: false, label: '❌ Tidak Hadir' }].map(opt => (
                <button key={String(opt.val)} type="button"
                  onClick={() => setForm(f => ({ ...f, will_attend: opt.val }))}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all
                    ${form.will_attend === opt.val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attendee count */}
          {form.will_attend && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Jumlah yang Hadir (termasuk Anda)</label>
              <input type="number" min="1" max="50" value={form.attendee_count}
                onChange={(e) => setForm(f => ({ ...f, attendee_count: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all" />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">No. HP / WhatsApp (Opsional)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Catatan (Opsional)</label>
            <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Pesan atau catatan tambahan..."
              rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-500 outline-none transition-all resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={submitting || !selectedMember}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-60">
            {submitting ? <><LoadingSpinner size="sm" /><span>Mendaftar...</span></> : <><UserCheck className="w-5 h-5" /><span>Konfirmasi Kehadiran</span></>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────

function EventDetailModal({ event, onClose, onRegister }: {
  event: Event; onClose: () => void; onRegister: () => void;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations(event.id).then(r => { setRegistrations(r); setLoading(false); });
  }, [event.id]);

  const totalAttendees = registrations.filter(r => r.will_attend).reduce((s, r) => s + r.attendee_count, 0);
  const confirmed = registrations.filter(r => r.will_attend).length;
  const notAttending = registrations.filter(r => !r.will_attend).length;

  const handleDeleteReg = async (id: string) => {
    await deleteRegistration(id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
    setShowDeleteConfirm(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-t-3xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG[event.status].color} mb-3 inline-block`}>
                {STATUS_CONFIG[event.status].label}
              </span>
              <h2 className="text-2xl font-bold mb-3">{event.title}</h2>
              <div className="space-y-1.5 text-stone-300 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-amber-400" />
                  {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {event.event_time && <span>· {event.event_time} WIB</span>}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors ml-4">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {event.description && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" /> Informasi Acara
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: registrations.length, label: 'Pendaftar', color: 'text-amber-600' },
              { value: confirmed, label: 'Hadir', color: 'text-emerald-600' },
              { value: totalAttendees, label: 'Total Orang', color: 'text-blue-600' },
            ].map((s, i) => (
              <div key={i} className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-200">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Register button */}
          {event.status !== 'completed' && (
            <button onClick={onRegister}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all">
              <UserCheck className="w-5 h-5" />
              Daftar / Konfirmasi Kehadiran Saya
            </button>
          )}

          {/* Registrations list */}
          <div>
            <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Daftar Peserta ({registrations.length})
            </h3>
            {loading ? (
              <div className="flex justify-center py-6"><LoadingSpinner size="sm" /></div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada yang mendaftar</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {registrations.map((reg) => (
                  <div key={reg.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${reg.will_attend ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${reg.will_attend ? 'bg-emerald-600 text-white' : 'bg-stone-400 text-white'}`}>
                          {reg.will_attend ? `✓ ${reg.attendee_count} org` : '✗'}
                        </span>
                        <p className="font-semibold text-stone-800 text-sm truncate">{reg.member_name}</p>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Gen {reg.generation} · {reg.parent_lineage}
                        {reg.phone && ` · ${reg.phone}`}
                      </p>
                      {reg.notes && <p className="text-xs text-stone-500 italic mt-0.5">"{reg.notes}"</p>}
                    </div>
                    {showDeleteConfirm === reg.id ? (
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => handleDeleteReg(reg.id)}
                          className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg">Hapus</button>
                        <button onClick={() => setShowDeleteConfirm(null)}
                          className="text-xs px-2 py-1 bg-stone-200 text-stone-600 rounded-lg">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowDeleteConfirm(reg.id)}
                        className="ml-2 p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Event['status']>('all');

  const load = async () => {
    setLoading(true);
    try { setEvents(await fetchEvents()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
    setSelectedEvent(null);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filtered = filterStatus === 'all' ? events : events.filter(e => e.status === filterStatus);

  const upcoming = events.filter(e => e.status === 'upcoming').length;
  const ongoing  = events.filter(e => e.status === 'ongoing').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-1 flex items-center gap-3">
            <PartyPopper className="w-8 h-8 text-amber-600" />
            Acara & Kegiatan
          </h1>
          <p className="text-stone-500">Informasi dan pendaftaran acara keluarga besar Eyang Bandan</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Buat Acara</span>
        </button>
      </div>

      {/* Success */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-semibold text-emerald-800">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: events.length, label: 'Total Acara', color: 'from-amber-500 to-amber-600' },
            { value: upcoming, label: 'Akan Datang', color: 'from-blue-500 to-blue-600' },
            { value: ongoing, label: 'Berlangsung', color: 'from-emerald-500 to-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-2`}>
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-stone-800">{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'upcoming', label: 'Akan Datang' },
          { value: 'ongoing', label: 'Berlangsung' },
          { value: 'completed', label: 'Selesai' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilterStatus(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
              ${filterStatus === f.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300 bg-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Memuat acara..." /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">Belum Ada Acara</h3>
          <p className="text-stone-500 mb-6">Buat acara pertama untuk keluarga besar!</p>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" /> Buat Acara
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-stretch">
                {/* Date sidebar */}
                <div className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-4 text-white
                  ${event.status === 'upcoming' ? 'bg-gradient-to-b from-amber-600 to-amber-700'
                    : event.status === 'ongoing' ? 'bg-gradient-to-b from-emerald-600 to-emerald-700'
                    : 'bg-gradient-to-b from-stone-500 to-stone-600'}`}>
                  <p className="text-2xl font-bold leading-none">
                    {new Date(event.event_date).getDate()}
                  </p>
                  <p className="text-xs font-medium opacity-80 mt-1">
                    {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(event.event_date).getFullYear()}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[event.status].color}`}>
                          {STATUS_CONFIG[event.status].label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-800">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-stone-500">
                        {event.event_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{event.event_time} WIB
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-stone-500 text-sm mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => setSelectedEvent(event)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-colors border border-amber-200">
                        <Info className="w-3.5 h-3.5" /> Detail
                      </button>
                      <Link to={`/events/${event.id}/attendees`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-200">
                        <Users className="w-3.5 h-3.5" /> Peserta
                      </Link>
                      {event.status !== 'completed' && (
                        <button onClick={() => setRegisterEvent(event)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors border border-emerald-200">
                          <UserCheck className="w-3.5 h-3.5" /> Daftar
                        </button>
                      )}
                      {deleteConfirm === event.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteEvent(event.id)}
                            className="px-2 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">Hapus</button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-medium">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(event.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors border border-red-200">
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateEventModal onClose={() => setShowCreate(false)}
            onSuccess={() => { load(); showSuccess('Acara berhasil dibuat!'); }} />
        )}
        {selectedEvent && !registerEvent && (
          <EventDetailModal event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onRegister={() => { setRegisterEvent(selectedEvent); setSelectedEvent(null); }} />
        )}
        {registerEvent && (
          <RegisterModal event={registerEvent}
            onClose={() => setRegisterEvent(null)}
            onSuccess={() => showSuccess('Pendaftaran berhasil! Terima kasih.')} />
        )}
      </AnimatePresence>
    </div>
  );
}
