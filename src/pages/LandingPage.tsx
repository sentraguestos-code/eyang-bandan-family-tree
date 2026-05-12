import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, MapPin, ArrowRight, Plus, BookOpen, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchFamilyStats, fetchRootMember } from '../lib/familyData';
import type { FamilyStats } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LandingPage() {
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [hasRoot, setHasRoot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [root, s] = await Promise.all([fetchRootMember(), fetchFamilyStats()]);
        setHasRoot(!!root);
        setStats(s);
      } catch {
        // supabase not configured yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #92400e 0%, transparent 40%),
                              radial-gradient(circle at 60% 80%, #78350f 0%, transparent 40%)`,
          }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-28 h-28 rounded-full overflow-hidden shadow-2xl border-4 border-amber-500/30 mx-auto mb-6"
            >
              <img src="/Logo.png" alt="Eyang Bandan" className="w-full h-full object-cover" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif font-bold text-white mb-4 leading-tight"
            >
              Eyang
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Bandan
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-stone-300 font-serif italic mb-4"
            >
              Family Tree
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-stone-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Platform silsilah keluarga yang menghubungkan generasi ke generasi,
              menyimpan kenangan, dan memetakan sebaran keturunan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : hasRoot ? (
                <>
                  <Link
                    to="/tree"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 transition-all duration-300"
                  >
                    <Network className="w-5 h-5" />
                    Lihat Pohon Keluarga
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold backdrop-blur-sm transition-all duration-300"
                  >
                    <MapPin className="w-5 h-5" />
                    Peta Sebaran
                  </Link>
                </>
              ) : (
                <Link
                  to="/add"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-amber-900/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Mulai Silsilah Keluarga
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-500"
        >
          <div className="w-6 h-10 border-2 border-stone-600 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-stone-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      {stats && stats.total_members > 0 && (
        <section className="bg-gradient-to-r from-amber-700 to-amber-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: stats.total_members, label: 'Total Anggota', icon: Users },
                { value: stats.total_generations, label: 'Generasi', icon: TreePine },
                { value: stats.members_with_location, label: 'Dengan Lokasi', icon: MapPin },
                { value: stats.members_with_photo, label: 'Dengan Foto', icon: Users },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold text-white mb-1">{s.value.toLocaleString()}</p>
                  <p className="text-amber-200 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
              Fitur Utama
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mendokumentasikan silsilah keluarga
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Network,
                title: 'Pohon Keluarga Interaktif',
                desc: 'Telusuri silsilah dengan sistem expand/collapse yang intuitif. Cari nama anggota keluarga secara instan.',
                color: 'from-amber-500 to-amber-700',
                delay: 0.1,
              },
              {
                icon: MapPin,
                title: 'Peta Sebaran Global',
                desc: 'Visualisasikan di mana keturunan Eyang Bandan tersebar. Peta interaktif dengan clustering otomatis.',
                color: 'from-emerald-500 to-emerald-700',
                delay: 0.2,
              },
              {
                icon: Users,
                title: 'Database Real-time',
                desc: 'Data tersimpan di cloud dan bisa diakses siapa saja. Tambah anggota baru kapan saja, dari mana saja.',
                color: 'from-blue-500 to-blue-700',
                delay: 0.3,
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: f.delay }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">{f.title}</h3>
                <p className="text-stone-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── History ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-stone-900 to-amber-950 rounded-3xl p-10 md:p-16 text-white overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold">Sejarah Keluarga</h2>
                  <p className="text-stone-400">Kisah Keluarga Besar Eyang Bandan</p>
                </div>
              </div>

              <p className="text-stone-300 leading-relaxed mb-4 text-lg">
                Eyang Bandan menikah dengan <span className="text-amber-400 font-semibold">Siti Hapsoh</span> dan
                dikaruniai <span className="text-amber-400 font-semibold">11 anak</span> — 5 laki-laki dan 6 perempuan.
              </p>
              <p className="text-stone-300 leading-relaxed mb-8">
                Berdasarkan data Silaturahmi Keluarga ke-2 tahun 2017, keturunan Eyang Bandan
                berjumlah <span className="text-amber-400 font-bold text-xl">1.147 orang</span>.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Baca Selengkapnya
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!hasRoot && !loading && (
        <section className="py-24 bg-stone-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">
                Mulai Sekarang
              </h2>
              <p className="text-stone-500 text-lg mb-8">
                Tambahkan Eyang Bandan sebagai akar keluarga dan mulai dokumentasikan silsilah.
              </p>
              <Link
                to="/add"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Tambah Anggota Pertama
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
