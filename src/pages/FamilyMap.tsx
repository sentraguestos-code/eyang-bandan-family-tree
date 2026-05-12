import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, X, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMembersWithLocation, fetchAllMembers } from '../lib/familyData';
import type { FamilyMember } from '../types/family';
import LoadingSpinner from '../components/LoadingSpinner';
import 'leaflet/dist/leaflet.css';

function LeafletMap({
  members,
  onMarkerClick,
}: {
  members: FamilyMember[];
  onMarkerClick: (m: FamilyMember) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current!).setView([-2.5, 118.0], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstanceRef.current);
      }

      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];

      // Cluster by rounded coords
      const clusters: Record<string, FamilyMember[]> = {};
      members.forEach((m) => {
        if (m.location_lat == null || m.location_lng == null) return;
        const key = `${m.location_lat.toFixed(2)},${m.location_lng.toFixed(2)}`;
        if (!clusters[key]) clusters[key] = [];
        clusters[key].push(m);
      });

      Object.values(clusters).forEach((group: FamilyMember[]) => {
        const first = group[0];
        const isCluster = group.length > 1;

        const iconHtml = isCluster
          ? `<div style="background:linear-gradient(135deg,#b45309,#92400e);color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3)">${group.length}</div>`
          : `<div style="background:linear-gradient(135deg,#059669,#047857);color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`;

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: isCluster ? [40, 40] : [32, 32],
          iconAnchor: isCluster ? [20, 20] : [16, 16],
        });

        const marker = L.marker([first.location_lat!, first.location_lng!], { icon })
          .addTo(mapInstanceRef.current);

        const memberListHtml = group.map((gm: FamilyMember) =>
          `<li style="padding:4px 0;border-bottom:1px solid #e7e5e4;font-size:12px;color:#292524">${gm.name}</li>`
        ).join('');
        const popupHtml = isCluster
          ? `<div style="min-width:160px;padding:8px"><strong style="color:#1c1917">${first.location_city}</strong><p style="color:#78716c;font-size:12px;margin:4px 0">${group.length} anggota keluarga</p><ul style="margin:0;padding:0;list-style:none">${memberListHtml}</ul></div>`
          : `<div style="min-width:160px;padding:8px"><strong style="color:#1c1917">${first.name}</strong><p style="color:#78716c;font-size:12px;margin:4px 0">Generasi ${first.generation}</p>${first.bio ? `<p style="font-size:11px;color:#a8a29e;font-style:italic">${first.bio.substring(0, 80)}...</p>` : ''}</div>`;

        marker.bindPopup(popupHtml);
        marker.on('click', () => { if (!isCluster) onMarkerClick(first); });
        markersRef.current.push(marker);
      });

      if (members.length > 0) {
        const validMembers = members.filter((m) => m.location_lat != null && m.location_lng != null);
        if (validMembers.length > 0) {
          const bounds = L.latLngBounds(validMembers.map((m) => [m.location_lat!, m.location_lng!]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    });

    return () => {
      markersRef.current.forEach((m: any) => m.remove());
    };
  }, [members, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-[500px] md:h-[600px] rounded-2xl z-0" />;
}

export default function FamilyMap() {
  const [locatedMembers, setLocatedMembers] = useState<FamilyMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [located, all] = await Promise.all([
          fetchMembersWithLocation(),
          fetchAllMembers(),
        ]);
        setLocatedMembers(located);
        setTotalMembers(all.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group by city
  const cityGroups = locatedMembers.reduce<Record<string, FamilyMember[]>>((acc, m) => {
    const city = m.location_city ?? 'Tidak diketahui';
    if (!acc[city]) acc[city] = [];
    acc[city].push(m);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat peta sebaran..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-1 flex items-center gap-3">
          <Map className="w-8 h-8 text-emerald-600" />
          Peta Sebaran Keluarga
        </h1>
        <p className="text-stone-500">Visualisasi lokasi keturunan Eyang Bandan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { value: Object.keys(cityGroups).length, label: 'Kota', color: 'from-emerald-500 to-emerald-600', icon: MapPin },
          { value: locatedMembers.length, label: 'Dengan Lokasi', color: 'from-amber-500 to-amber-600', icon: Users },
          { value: totalMembers, label: 'Total Anggota', color: 'from-stone-500 to-stone-600', icon: Users },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-800">{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      {locatedMembers.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-4 mb-8 overflow-hidden">
          <LeafletMap members={locatedMembers} onMarkerClick={setSelectedMember} />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 shadow-sm border border-stone-200 text-center mb-8">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-700 mb-2">Belum Ada Data Lokasi</h2>
          <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            Tambahkan lokasi pada profil anggota keluarga untuk melihat peta sebaran.
          </p>
          <Link
            to="/tree"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Lihat Pohon Keluarga
          </Link>
        </div>
      )}

      {/* City list */}
      {Object.keys(cityGroups).length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Daftar Lokasi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(cityGroups).map(([city, members]) => (
              <div
                key={city}
                className="bg-stone-50 rounded-2xl p-4 border border-stone-200 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <h3 className="font-bold text-stone-800 text-sm truncate">{city}</h3>
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    {members.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {members.slice(0, 3).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="w-full text-left px-3 py-2 bg-white rounded-xl hover:bg-amber-50 transition-colors border border-stone-200 hover:border-amber-300"
                    >
                      <p className="font-medium text-stone-800 text-xs">{m.name}</p>
                      <p className="text-[10px] text-stone-400">Gen {m.generation}</p>
                    </button>
                  ))}
                  {members.length > 3 && (
                    <p className="text-xs text-stone-400 text-center py-1">
                      +{members.length - 3} lainnya
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">{selectedMember.name}</h3>
                  <p className="text-sm text-stone-500">Generasi {selectedMember.generation}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {selectedMember.location_city && (
                  <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {selectedMember.location_city}
                  </div>
                )}
                {selectedMember.bio && (
                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-stone-600 text-sm leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}
              </div>

              <Link
                to="/tree"
                className="block w-full text-center bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Lihat di Pohon Keluarga
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
