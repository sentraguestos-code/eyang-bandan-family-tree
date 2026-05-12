import { motion } from 'framer-motion';
import { User, MapPin, Calendar, ChevronDown, ChevronRight, Plus, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FamilyMember } from '../types/family';

interface MemberCardProps {
  member: FamilyMember;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  level: number;
  childrenCount: number;
}

export default function MemberCard({
  member,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  level,
  childrenCount,
}: MemberCardProps) {
  const genColors: Record<number, string> = {
    1: 'from-amber-700 to-amber-900',
    2: 'from-stone-600 to-stone-800',
    3: 'from-emerald-600 to-emerald-800',
    4: 'from-blue-600 to-blue-800',
    5: 'from-purple-600 to-purple-800',
  };
  const genColor = genColors[member.generation] ?? 'from-stone-500 to-stone-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(level * 0.05, 0.3) }}
      className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${isSelected
          ? 'border-amber-500 shadow-xl shadow-amber-100 bg-gradient-to-br from-amber-50 to-white'
          : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-lg'
        }`}
    >
      {/* Generation stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${genColor}`} />

      <div className="pl-4 pr-4 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden
              bg-gradient-to-br ${genColor}`}
          >
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-white/80" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${genColor}`}>
                    Gen {member.generation}
                  </span>
                  {member.death_date && (
                    <span className="text-xs text-stone-400 italic">Alm.</span>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-bold text-stone-800 leading-tight">
                  {member.name}
                </h3>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to={`/add?parentId=${member.id}`}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                  title="Tambah anak"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/edit/${member.id}`}
                  className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-500">
              {member.birth_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {member.birth_date}
                </span>
              )}
              {member.location_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {member.location_city}
                </span>
              )}
              {childrenCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  {childrenCount} anak
                </span>
              )}
            </div>

            {/* Bio preview */}
            {member.bio && (
              <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {member.bio}
              </p>
            )}
          </div>
        </div>

        {/* Detail toggle */}
        <button
          onClick={onSelect}
          className="mt-3 w-full text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors text-left"
        >
          {isSelected ? '▲ Sembunyikan detail' : '▼ Lihat detail lengkap'}
        </button>
      </div>

      {/* Expand children button */}
      {childrenCount > 0 && (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold transition-all border-t
            ${isExpanded
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50 hover:text-amber-700'
            }`}
        >
          {isExpanded ? (
            <><ChevronDown className="w-3.5 h-3.5" /> Sembunyikan {childrenCount} anak</>
          ) : (
            <><ChevronRight className="w-3.5 h-3.5" /> Tampilkan {childrenCount} anak</>
          )}
        </button>
      )}
    </motion.div>
  );
}
