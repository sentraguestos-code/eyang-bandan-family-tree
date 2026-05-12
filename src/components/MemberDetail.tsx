import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Calendar, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FamilyMember } from '../types/family';

interface MemberDetailProps {
  member: FamilyMember;
  onClose: () => void;
}

export default function MemberDetail({ member, onClose }: MemberDetailProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="mx-4 mb-4 bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-xl border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-stone-700 text-sm">Detail Lengkap</h4>
            <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-lg transition-colors">
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {member.birth_date && (
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><span className="font-medium">Lahir:</span> {member.birth_date}</span>
              </div>
            )}
            {member.death_date && (
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span><span className="font-medium">Wafat:</span> {member.death_date}</span>
              </div>
            )}
            {member.location_city && (
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{member.location_city}</span>
              </div>
            )}
            {member.bio && (
              <div className="mt-3 pt-3 border-t border-stone-200">
                <p className="text-stone-600 leading-relaxed">{member.bio}</p>
              </div>
            )}
          </div>

          <Link
            to={`/edit/${member.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Edit profil
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
