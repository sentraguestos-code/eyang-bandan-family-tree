import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Network, Plus, X, ChevronDown, ChevronRight, MapPin, Calendar, Pencil, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllMembers, searchMembers, buildTree } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Tree Node ────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  member: FamilyMember;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string | null) => void;
  level: number;
}

function TreeNode({ member, expandedIds, selectedId, onToggle, onSelect, level }: TreeNodeProps) {
  const isExpanded = expandedIds.has(member.id);
  const isSelected = selectedId === member.id;
  const hasChildren = (member.children?.length ?? 0) > 0;
  const childCount = member.children?.length ?? 0;

  const genColors: Record<number, { bg: string; badge: string; border: string }> = {
    1: { bg: 'from-amber-50 to-orange-50', badge: 'bg-amber-700', border: 'border-amber-300' },
    2: { bg: 'from-stone-50 to-slate-50', badge: 'bg-stone-600', border: 'border-stone-300' },
    3: { bg: 'from-emerald-50 to-teal-50', badge: 'bg-emerald-600', border: 'border-emerald-300' },
    4: { bg: 'from-blue-50 to-indigo-50', badge: 'bg-blue-600', border: 'border-blue-300' },
    5: { bg: 'from-purple-50 to-violet-50', badge: 'bg-purple-600', border: 'border-purple-300' },
  };
  const colors = genColors[member.generation] ?? genColors[5];

  return (
    <div className="relative">
      {/* Connector line */}
      {level > 0 && (
        <div className="absolute -left-4 top-7 w-4 h-px bg-stone-300" />
      )}

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(level * 0.04, 0.25) }}
        className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden mb-3
          ${isSelected
            ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg ring-2 ring-amber-400/40`
            : `bg-white border-stone-200 hover:${colors.border} hover:shadow-md`
          }`}
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.badge}`} />

        <div className="pl-4 pr-3 pt-3 pb-2">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm ${colors.badge}`}>
              {member.photo_url
                ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                : <User className="w-6 h-6 text-white/80" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white ${colors.badge}`}>
                      Gen {member.generation}
                    </span>
                    {member.child_order != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 font-medium">
                        Anak ke-{member.child_order}
                      </span>
                    )}
                    {member.death_date && (
                      <span className="text-[10px] text-stone-400 italic bg-stone-100 px-1.5 py-0.5 rounded-md">Alm.</span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm md:text-base leading-tight truncate">
                    {member.name}
                  </h3>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  <Link
                    to={`/add?parentId=${member.id}`}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                    title="Tambah anak"
                  >
                    <Plus className="w-3 h-3" />
                  </Link>
                  <Link
                    to={`/edit/${member.id}`}
                    className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-500 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-stone-500">
                {member.birth_date && (
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />{member.birth_date}
                  </span>
                )}
                {member.location_city && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />{member.location_city}
                  </span>
                )}
                {childCount > 0 && (
                  <span className="text-amber-600 font-semibold">{childCount} anak</span>
                )}
              </div>
            </div>
          </div>

          {/* Detail toggle */}
          <button
            onClick={() => onSelect(isSelected ? null : member.id)}
            className="mt-2 text-[11px] text-amber-600 hover:text-amber-800 font-medium transition-colors"
          >
            {isSelected ? '▲ Tutup detail' : '▼ Lihat detail'}
          </button>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`mx-3 mb-3 p-3 rounded-xl bg-white/70 border border-stone-200 text-xs text-stone-600 space-y-1.5`}>
                {member.bio && <p className="leading-relaxed">{member.bio}</p>}
                {member.birth_date && <p><span className="font-semibold">Lahir:</span> {member.birth_date}</p>}
                {member.death_date && <p><span className="font-semibold">Wafat:</span> {member.death_date}</p>}
                {member.location_city && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />{member.location_city}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand children button */}
        {hasChildren && (
          <button
            onClick={() => onToggle(member.id)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-t transition-all
              ${isExpanded
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-amber-50 hover:text-amber-700'
              }`}
          >
            {isExpanded
              ? <><ChevronDown className="w-3 h-3" />Sembunyikan {childCount} anak</>
              : <><ChevronRight className="w-3 h-3" />Tampilkan {childCount} anak</>
            }
          </button>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 pl-4 border-l-2 border-stone-200 space-y-0"
          >
            {member.children!.map((child) => (
              <TreeNode
                key={child.id}
                member={child}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreeExplorer() {
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [tree, setTree] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilyMember[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const members = await fetchAllMembers();
        setAllMembers(members);
        const root = buildTree(members);
        setTree(root);
        if (root) setExpandedIds(new Set([root.id]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchMembers(searchQuery);
        setSearchResults(results);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const toggleNode = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const ids = new Set(allMembers.map((m) => m.id));
    setExpandedIds(ids);
  };

  const collapseAll = () => {
    setExpandedIds(tree ? new Set([tree.id]) : new Set());
  };

  const jumpToMember = (member: FamilyMember) => {
    // Expand all ancestors
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));
    const toExpand = new Set<string>();
    let cur: FamilyMember | undefined = member;
    while (cur?.parent_id) {
      toExpand.add(cur.parent_id);
      cur = memberMap.get(cur.parent_id);
    }
    setExpandedIds((prev) => new Set([...prev, ...toExpand]));
    setSelectedId(member.id);
    setSearchQuery('');
    setSearchResults([]);
    // Scroll to element
    setTimeout(() => {
      document.getElementById(`member-${member.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat pohon keluarga..." />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-stone-200">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TreePine className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">Belum Ada Data Keluarga</h2>
          <p className="text-stone-500 mb-8">Tambahkan anggota pertama untuk memulai pohon keluarga.</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Anggota Pertama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-1 flex items-center gap-3">
          <Network className="w-8 h-8 text-amber-600" />
          Pohon Keluarga
        </h1>
        <p className="text-stone-500">{allMembers.length} anggota terdaftar</p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota keluarga..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none bg-white shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {(searchResults.length > 0 || searching) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-20"
            >
              {searching ? (
                <div className="p-4 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                searchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => jumpToMember(m)}
                    className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                      <p className="text-xs text-stone-500">Generasi {m.generation}{m.location_city ? ` · ${m.location_city}` : ''}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors border border-amber-200"
          >
            Buka Semua
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-lg font-medium transition-colors border border-stone-200"
          >
            Tutup Semua
          </button>
        </div>
        <Link
          to="/add"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium hover:shadow-md transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Anggota
        </Link>
      </div>

      {/* Tree */}
      <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 overflow-x-auto">
        <div id={`member-${tree.id}`}>
          <TreeNode
            member={tree}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onToggle={toggleNode}
            onSelect={setSelectedId}
            level={0}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {[
          { gen: 1, label: 'Generasi 1', color: 'bg-amber-700' },
          { gen: 2, label: 'Generasi 2', color: 'bg-stone-600' },
          { gen: 3, label: 'Generasi 3', color: 'bg-emerald-600' },
          { gen: 4, label: 'Generasi 4', color: 'bg-blue-600' },
          { gen: 5, label: 'Generasi 5+', color: 'bg-purple-600' },
        ].map((l) => (
          <div key={l.gen} className="flex items-center gap-1.5 text-xs text-stone-600">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
