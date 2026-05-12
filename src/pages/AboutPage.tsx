import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Heart, TreePine, Quote } from 'lucide-react';

export default function AboutPage() {
  const sections = [
    {
      title: 'ANAK-ANAK EYANG BANDAN (Generasi 2)',
      items: [
        'Busroh — 16 keturunan (menikah dengan Dentamira & Hasanah)',
        'Sunaenah',
        'Sukriyah — 7 keturunan (menikah dengan Jafar Thalib)',
        'Khatimah',
        'Siti Nurhasanah',
        'Ncep Sukmi — 8 keturunan (menikah dengan Sukatma/Iyo & Maesaroh)',
        'Hj. Djubaedah — 4 keturunan (menikah dengan Enjuh & Onih)',
        'Dadang Sarifudin — menikah dengan R. Dedeh Suharnah',
        'H. Sukardja Mihroz Palar — 9 keturunan (menikah dengan Hj. Siti Rokayah)',
        'Supadma — 4 keturunan (menikah dengan Siti Romlah)',
        'Hj. Sundariah — 7 keturunan (menikah dengan Moch. Muhidin W)',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-stone-900 to-amber-950 rounded-3xl p-10 md:p-16 text-white overflow-hidden mb-10"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-700/10 rounded-full translate-y-1/3 -translate-x-1/3" />

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Sejarah Keluarga</h1>
              <p className="text-stone-400">Kisah Keluarga Besar Eyang Bandan</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <Quote className="w-8 h-8 text-amber-500/50 flex-shrink-0 mt-1" />
            <p className="text-stone-300 text-lg leading-relaxed italic">
              "Keturunan adalah amanah, silsilah adalah jembatan mengenang."
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-10"
      >
        {[
          { icon: Users, value: '11', label: 'Anak Eyang Bandan', color: 'from-amber-500 to-amber-700' },
          { icon: Calendar, value: '2017', label: 'Silaturahmi Ke-2', color: 'from-stone-500 to-stone-700' },
          { icon: TreePine, value: '1.147', label: 'Total Keturunan (2017)', color: 'from-emerald-500 to-emerald-700' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 text-center"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-10 mb-8"
      >
        <h2 className="text-2xl font-bold text-amber-800 mb-6 pb-4 border-b border-stone-100">
          Sekilas Historis Tentang Eyang Bandan
        </h2>

        <div className="space-y-4 text-stone-700 leading-relaxed">
          <p>
            Eyang Bandan adalah seorang ayah dan kakek dari semua keturunan beliau. Semasa hidup,
            beliau menikah dengan seorang wanita bernama{' '}
            <span className="font-semibold text-amber-700">Siti Hapsoh</span> dan dikaruniai{' '}
            <span className="font-semibold text-amber-700">11 anak</span> — 5 laki-laki dan 6 perempuan.
          </p>
          <p>
            Berdasarkan data terakhir saat acara Silaturahmi Keluarga Eyang Bandan ke-2 tahun 2017,
            didapat data keturunan Eyang Bandan berjumlah{' '}
            <span className="font-bold text-2xl text-amber-700">1.147 orang</span>.
          </p>
        </div>

        {/* Children list */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Anak-Anak Eyang Bandan (Generasi 2)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {sections[0].items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl"
      >
        <Heart className="w-14 h-14 mx-auto mb-5 text-amber-300" />
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
          Mari Lestarikan Silaturahmi
        </h2>
        <p className="text-amber-100 text-base mb-6 max-w-2xl mx-auto leading-relaxed">
          Diharapkan kepada generasi selanjutnya agar bisa merevisi, menambah, dan mempertahankan
          Silaturahmi Keluarga Besar Eyang Bandan agar tetap dijaga dan dilestarikan untuk generasi
          di masa yang akan datang.
        </p>
        <p className="text-amber-300 text-sm italic">
          Bogor, 14 Juli 2024
          <br />
          <span className="font-medium">Tim Penyusun — Panitia Silaturahmi Akbar Ke-3</span>
        </p>
      </motion.div>
    </div>
  );
}
