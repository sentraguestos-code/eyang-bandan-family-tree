import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, ChevronRight, ChevronDown, Search, X, FileText, Users, Check } from 'lucide-react';
import { fetchAllMembers, buildTree } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllDescendants(member: FamilyMember): FamilyMember[] {
  const result: FamilyMember[] = [member];
  if (member.children) {
    member.children.forEach((child) => {
      result.push(...getAllDescendants(child));
    });
  }
  return result;
}

function countDescendants(member: FamilyMember): number {
  return getAllDescendants(member).length - 1;
}

// ─── Print HTML builder ───────────────────────────────────────────────────────

function buildPrintHTML(root: FamilyMember, selectedIds: Set<string>, allMembers: Map<string, FamilyMember>): string {
  const indent = (level: number) => '&nbsp;'.repeat(level * 6);
  const lines: string[] = [];

  function walk(member: FamilyMember, level: number) {
    if (!selectedIds.has(member.id)) return;

    const prefix = level === 0 ? '' : indent(level) + '└─ ';
    const genBadge = `<span style="background:#92400e;color:white;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-right:6px">Gen ${member.generation}</span>`;
    const childBadge = member.child_order ? `<span style="color:#78716c;font-size:11px"> (Anak ke-${member.child_order})</span>` : '';
    const almBadge = member.death_date ? `<span style="color:#9ca3af;font-size:11px;font-style:italic"> (Alm.)</span>` : '';
    const loc = member.location_city ? `<span style="color:#6b7280;font-size:11px"> — ${member.location_city}</span>` : '';

    lines.push(`
      <div style="margin:${level === 0 ? '0 0 8px 0' : '4px 0'};padding:${level === 0 ? '10px 12px' : '6px 12px'};
        background:${level === 0 ? '#fef3c7' : level === 1 ? '#f9fafb' : 'white'};
        border-left:${level === 0 ? '4px solid #d97706' : level === 1 ? '3px solid #d1d5db' : '2px solid #e5e7eb'};
        border-radius:4px;font-family:Arial,sans-serif">
        <div style="font-size:${level === 0 ? '15px' : '13px'};font-weight:${level <= 1 ? 'bold' : 'normal'};color:#1c1917">
          ${prefix}${genBadge}<span>${member.name}</span>${childBadge}${almBadge}${loc}
        </div>
        ${member.bio ? `<div style="font-size:11px;color:#6b7280;margin-top:3px;padding-left:${level * 24}px">${member.bio}</div>` : ''}
        ${member.birth_date ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px;padding-left:${level * 24}px">Lahir: ${member.birth_date}${member.death_date ? ' · Wafat: ' + member.death_date : ''}</div>` : ''}
      </div>
    `);

    if (member.children) {
      member.children.forEach((child) => walk(child, level + 1));
    }
  }

  walk(root, 0);
  return lines.join('');
}

// ─── Tree selector node ───────────────────────────────────────────────────────

interface SelectorNodeProps {
  member: FamilyMember;
  selectedIds: Set<string>;
  onToggle: (member: FamilyMember, withDescendants: boolean) => void;
  level: number;
}

function SelectorNode({ member, selectedIds, onToggle, level }: SelectorNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = (member.children?.length ?? 0) > 0;
  const isSelected = selectedIds.has(member.id);
  const descCount = countDescendants(member);

  return (
    <div className={level > 0 ? 'ml-5 border-l border-stone-200 pl-3' : ''}>
      <div className={`flex items-center gap-2 py-1.5 px-2 rounded-xl transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-stone-50'}`}>
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-5 h-5 flex items-center justify-center text-stone-400 flex-shrink-0"
        >
          {hasChildren
            ? expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
            : <span className="w-3.5 h-3.5" />
          }
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(member, false)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${isSelected ? 'bg-amber-600 border-amber-600' : 'border-stone-300 hover:border-amber-400'}`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Name */}
        <span className={`text-sm flex-1 ${isSelected ? 'font-semibold text-stone-800' : 'text-stone-700'}`}>
          {member.name}
          <span className="text-xs text-stone-400 ml-1">Gen {member.generation}</span>
        </span>

        {/* Select with descendants */}
        {hasChildren && (
          <button
            onClick={() => onToggle(member, true)}
            className="text-[10px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors flex-shrink-0"
            title="Pilih beserta semua keturunan"
          >
            +{descCount} keturunan
          </button>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {member.children!.map((child) => (
              <SelectorNode
                key={child.id}
                member={child}
                selectedIds={selectedIds}
                onToggle={onToggle}
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

export default function PrintPage() {
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [tree, setTree] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const members = await fetchAllMembers();
        setAllMembers(members);
        const root = buildTree(members);
        setTree(root);
        // Default: pilih semua
        if (root) {
          const all = getAllDescendants(root);
          setSelectedIds(new Set(all.map((m) => m.id)));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  const toggleMember = (member: FamilyMember, withDescendants: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (withDescendants) {
        const all = getAllDescendants(member);
        const allSelected = all.every((m) => next.has(m.id));
        all.forEach((m) => allSelected ? next.delete(m.id) : next.add(m.id));
      } else {
        next.has(member.id) ? next.delete(member.id) : next.add(member.id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!tree) return;
    setSelectedIds(new Set(getAllDescendants(tree).map((m) => m.id)));
  };

  const clearAll = () => setSelectedIds(new Set());

  const handlePrint = () => {
    if (!tree || selectedIds.size === 0) return;
    setPrinting(true);

    const selectedCount = selectedIds.size;
    const html = buildPrintHTML(tree, selectedIds, memberMap);

    const printWindow = window.open('', '_blank');
    if (!printWindow) { setPrinting(false); return; }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Silsilah Keluarga Eyang Bandan</title>
        <style>
          @page { margin: 20mm 15mm; size: A4; }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1c1917; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 3px solid #d97706; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 22px; color: #92400e; margin: 0 0 4px 0; }
          .header p { font-size: 12px; color: #78716c; margin: 0; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; margin-bottom: 20px; }
          .footer { text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 24px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Silsilah Keluarga Besar Eyang Bandan</h1>
          <p>Dokumen Silsilah Keluarga · Dicetak ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="meta">
          <span>Total anggota dicetak: <strong>${selectedCount} orang</strong></span>
          <span>Dibangun oleh Lucky Zamaludin Malik</span>
        </div>
        <div class="content">
          ${html}
        </div>
        <div class="footer">
          © 2026 Eyang Bandan Family Tree · Dibangun oleh Lucky Zamaludin Malik
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setPrinting(false);
  };

  // Filter tree for search
  const filteredTree = tree;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat data silsilah..." />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-700 mb-2">Belum Ada Data</h2>
        <p className="text-stone-500">Tambahkan anggota keluarga terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-1 flex items-center gap-3">
          <Printer className="w-8 h-8 text-amber-600" />
          Cetak Silsilah PDF
        </h1>
        <p className="text-stone-500">Pilih anggota yang ingin dicetak, lalu klik Cetak PDF</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Selector */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-stone-100 bg-stone-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-stone-700">
                  {selectedIds.size} dari {allMembers.length} dipilih
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium border border-amber-200 transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg font-medium border border-stone-200 transition-colors"
                >
                  Hapus Pilihan
                </button>
              </div>
            </div>

            {/* Tree selector */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <SelectorNode
                member={tree}
                selectedIds={selectedIds}
                onToggle={toggleMember}
                level={0}
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Print */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Ringkasan Cetak
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Total dipilih</span>
                <span className="font-bold text-stone-800">{selectedIds.size} orang</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Format</span>
                <span className="font-medium text-stone-700">A4 Portrait</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Tanggal cetak</span>
                <span className="font-medium text-stone-700">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-4">
                💡 Klik nama anggota untuk pilih satu per satu, atau klik tombol <strong>"+X keturunan"</strong> untuk pilih beserta seluruh keturunannya sekaligus.
              </p>
              <motion.button
                onClick={handlePrint}
                disabled={selectedIds.size === 0 || printing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {printing
                  ? <><LoadingSpinner size="sm" /><span>Menyiapkan...</span></>
                  : <><Printer className="w-5 h-5" /><span>Cetak / Simpan PDF</span></>
                }
              </motion.button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2">📄 Cara Simpan sebagai PDF:</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Klik tombol Cetak</li>
              <li>Di dialog print, pilih <strong>"Save as PDF"</strong></li>
              <li>Pilih lokasi simpan</li>
              <li>Klik Save</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
