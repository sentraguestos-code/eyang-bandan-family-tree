import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, MapPin, Clock, CheckCircle, XCircle,
  Printer, ArrowLeft, Search, Filter, Download
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "../components/LoadingSpinner";

interface Event {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  event_time?: string | null;
  status: string;
}

interface Registration {
  id: string;
  member_name: string;
  generation?: number | null;
  parent_lineage?: string | null;
  phone?: string | null;
  will_attend: boolean;
  attendee_count: number;
  notes?: string | null;
  created_at: string;
}

export default function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attend" | "notattend">("all");

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [{ data: ev }, { data: regs }] = await Promise.all([
        supabase.from("events").select("*").eq("id", id).single(),
        supabase.from("event_registrations").select("*").eq("event_id", id).order("created_at", { ascending: true }),
      ]);
      setEvent(ev);
      setRegistrations(regs ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const filtered = registrations.filter((r) => {
    const matchSearch = r.member_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : filter === "attend" ? r.will_attend : !r.will_attend;
    return matchSearch && matchFilter;
  });

  const totalAttend = registrations.filter((r) => r.will_attend).length;
  const totalNotAttend = registrations.filter((r) => !r.will_attend).length;
  const totalPeople = registrations.filter((r) => r.will_attend).reduce((s, r) => s + r.attendee_count, 0);

  const handlePrint = () => {
    if (!event) return;
    const rows = filtered.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${r.member_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">Gen ${r.generation ?? "-"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280">${r.parent_lineage ?? "-"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="background:${r.will_attend ? "#d1fae5" : "#fee2e2"};color:${r.will_attend ? "#065f46" : "#991b1b"};padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600">
            ${r.will_attend ? "Hadir" : "Tidak"}
          </span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${r.will_attend ? r.attendee_count : "-"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px">${r.phone ?? "-"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#9ca3af">${r.notes ?? "-"}</td>
      </tr>
    `).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
      <title>Rekap Peserta - ${event.title}</title>
      <style>
        @page { margin: 15mm; size: A4 landscape; }
        body { font-family: Arial, sans-serif; color: #1c1917; margin: 0; }
        .header { text-align: center; border-bottom: 3px solid #d97706; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18px; color: #92400e; margin: 0 0 4px 0; }
        .header p { font-size: 11px; color: #78716c; margin: 2px 0; }
        .stats { display: flex; gap: 16px; margin-bottom: 16px; }
        .stat { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 8px 16px; text-align: center; }
        .stat strong { display: block; font-size: 20px; color: #92400e; }
        .stat span { font-size: 11px; color: #78716c; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #92400e; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
        .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <div class="header">
        <h1>Rekap Peserta: ${event.title}</h1>
        <p>${event.location ?? ""} ${event.event_date ? "· " + new Date(event.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""} ${event.event_time ? "· " + event.event_time + " WIB" : ""}</p>
        <p>Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      <div class="stats">
        <div class="stat"><strong>${registrations.length}</strong><span>Total Pendaftar</span></div>
        <div class="stat"><strong>${totalAttend}</strong><span>Konfirmasi Hadir</span></div>
        <div class="stat"><strong>${totalNotAttend}</strong><span>Tidak Hadir</span></div>
        <div class="stat"><strong>${totalPeople}</strong><span>Total Orang Hadir</span></div>
      </div>
      <table>
        <thead><tr>
          <th style="width:30px">No</th><th>Nama</th><th style="width:60px">Gen</th>
          <th>Keturunan</th><th style="width:70px">Status</th>
          <th style="width:50px">Jml</th><th style="width:100px">No. HP</th><th>Catatan</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">© 2026 Eyang Bandan Family Tree · Dibangun oleh Lucky Zamaludin Malik</div>
      <script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 400); };</script>
      </body></html>
    `);
    win.document.close();
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Memuat data peserta..." />
    </div>
  );

  if (!event) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Acara tidak ditemukan.</p>
      <Link to="/events" className="text-amber-600 hover:underline mt-4 inline-block">Kembali ke Acara</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/events" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Acara
      </Link>

      {/* Event info */}
      <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-3xl p-6 md:p-8 text-white mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-stone-300 text-sm">
          <span className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            {new Date(event.event_date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          {event.event_time && <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />{event.event_time} WIB</span>}
          {event.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />{event.location}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { value: registrations.length, label: "Total Pendaftar", color: "from-amber-500 to-amber-600", icon: Users },
          { value: totalAttend, label: "Konfirmasi Hadir", color: "from-emerald-500 to-emerald-600", icon: CheckCircle },
          { value: totalNotAttend, label: "Tidak Hadir", color: "from-red-400 to-red-500", icon: XCircle },
          { value: totalPeople, label: "Total Orang Hadir", color: "from-blue-500 to-blue-600", icon: Users },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none bg-white transition-all" />
        </div>
        <div className="flex gap-2">
          {[
            { val: "all", label: "Semua" },
            { val: "attend", label: "Hadir" },
            { val: "notattend", label: "Tidak Hadir" },
          ].map((f) => (
            <button key={f.val} onClick={() => setFilter(f.val as any)}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all
                ${filter === f.val ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-600 bg-white hover:border-amber-300"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-semibold shadow-lg transition-all">
          <Printer className="w-4 h-4" /> Cetak / PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-700">{filtered.length} peserta ditampilkan</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Belum ada peserta yang mendaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-800 text-white text-xs">
                  <th className="px-4 py-3 text-center w-10">No</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-center">Gen</th>
                  <th className="px-4 py-3 text-left">Keturunan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Jml Orang</th>
                  <th className="px-4 py-3 text-left">No. HP</th>
                  <th className="px-4 py-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className={`border-b border-stone-100 hover:bg-amber-50/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}>
                    <td className="px-4 py-3 text-center text-sm text-stone-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-stone-800 text-sm">{r.member_name}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-700">
                        Gen {r.generation ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500 max-w-[200px] truncate">{r.parent_lineage ?? "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.will_attend ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {r.will_attend ? "✓ Hadir" : "✗ Tidak"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-stone-700">
                      {r.will_attend ? r.attendee_count : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{r.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-stone-400 italic max-w-[150px] truncate">{r.notes ?? "-"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}