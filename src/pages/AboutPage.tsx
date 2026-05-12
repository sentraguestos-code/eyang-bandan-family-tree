import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Heart, TreePine, Quote, HandHeart } from 'lucide-react';

const familyBranches = [
  'Keluarga Besar H. Busroh',
  'Keluarga Besar Sunaenah',
  'Keluarga Besar Sukriyah',
  'Keluarga Besar Khatimah',
  'Keluarga Besar Hj. Siti Nurhasanah',
  'Keluarga Besar H. Ncep Sukmi',
  'Keluarga Besar Hj. Djubaedah',
  'Keluarga Besar H. Dadang Sarifudin',
  'Keluarga Besar H. Sukardja Mihroz Palar',
  'Keluarga Besar Supadma',
  'Keluarga Besar Hj. Sundariah',
];

export default function AboutPage() {
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
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Tentang</h1>
              <p className="text-stone-400">Website Silsilah Keluarga Besar Eyang Bandan</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
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
          { icon: Calendar, value: '2024', label: 'Silaturahmi Ke-3', color: 'from-stone-500 to-stone-700' },
          { icon: TreePine, value: '1.147+', label: 'Total Keturunan (2024)', color: 'from-emerald-500 to-emerald-700' },
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

      {/* Kata Pengantar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-10 mb-8"
      >
        <h2 className="text-2xl font-bold text-amber-800 mb-6 pb-4 border-b border-stone-100 flex items-center gap-3">
          <HandHeart className="w-6 h-6 text-amber-600" />
          Kata Pengantar
        </h2>

        <div className="space-y-5 text-stone-700 leading-relaxed">
          <p>
            Puji syukur ke hadirat <span className="font-semibold text-amber-700">Allah Subhanallahu wata'ala</span> yang
            telah memberikan rahmat dan hidayah-Nya sehingga website silsilah keluarga Eyang Bandan ini dapat
            diselesaikan dengan baik.
          </p>
          <p>
            Pada kesempatan ini, saya ingin menyampaikan ucapan terima kasih yang sebesar-besarnya kepada seluruh
            keluarga besar Eyang Bandan atas dukungan, kerjasama, dan kontribusi yang telah diberikan.
          </p>
        </div>

        {/* Ucapan terima kasih */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Ucapan Terima Kasih Khusus
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {familyBranches.map((branch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-stone-700 text-sm font-medium">{branch}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-5 text-stone-700 leading-relaxed">
          <p>
            Tanpa partisipasi dan bantuan dari keluarga-keluarga besar tersebut, penyusunan silsilah ini tidak akan
            terlaksana dengan baik. Setiap informasi, cerita, dan kenangan yang telah disumbangkan sangat berarti
            dalam merangkai sejarah dan silsilah keluarga besar kita.
          </p>
          <p>
            Semoga kerja keras dan kebersamaan ini terus dapat dilestarikan dan menjadi inspirasi bagi generasi mendatang.
          </p>
        </div>

        {/* Tanda tangan */}
        <div className="mt-10 pt-6 border-t border-stone-100">
          <p className="text-stone-500 text-sm mb-1">Bogor, 12 Mei 2026</p>
          <p className="text-stone-800 font-bold text-lg">Lucky Zamaludin Malik</p>
          <p className="text-stone-500 text-sm">Putra ke-11 dari Barkah Jafar Thalib</p>
          <p className="text-amber-700 text-sm font-medium">Generasi ke-4</p>
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
      </motion.div>

    </div>
  );
}
