import { motion } from 'framer-motion';
import { Network, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SQL_SCHEMA = `-- Eyang Bandan Family Tree - Database Schema
-- Run this in Supabase SQL Editor

CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  birth_date DATE,
  death_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  parent_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  generation INTEGER NOT NULL DEFAULT 1,
  location_city TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_family_members_parent_id ON family_members(parent_id);
CREATE INDEX idx_family_members_generation ON family_members(generation);
CREATE INDEX idx_family_members_name ON family_members USING gin(to_tsvector('indonesian', name));

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON family_members
  FOR SELECT USING (true);

-- Allow public insert/update/delete (you can restrict this later with auth)
CREATE POLICY "Allow public insert" ON family_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON family_members
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON family_members
  FOR DELETE USING (true);

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Allow public photo upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'family-photos');

CREATE POLICY "Allow public photo read" ON storage.objects
  FOR SELECT USING (bucket_id = 'family-photos');

CREATE POLICY "Allow public photo update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'family-photos');`;

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-animated dot-pattern flex items-center justify-center px-4 py-20">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#c9a84c] to-[#7a5820] rounded-2xl shadow-2xl mb-6 glow-gold">
            <Network className="w-10 h-10 text-[#0a0a0f]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
            Eyang Bandan
          </h1>
          <p className="text-xl font-serif text-[#a09880] mb-2">Family Tree</p>
          <p className="text-[#605848]">Setup diperlukan sebelum menggunakan aplikasi</p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 glow-gold"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#a07830] rounded-full flex items-center justify-center text-[#0a0a0f] font-bold text-sm flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#f0ece0] mb-2">Buat akun & project di Supabase</h3>
                <p className="text-[#a09880] text-sm mb-3">
                  Daftar gratis di supabase.com, lalu buat project baru.
                </p>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#c9a84c] hover:text-[#e8c97a] text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka supabase.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#a07830] rounded-full flex items-center justify-center text-[#0a0a0f] font-bold text-sm flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#f0ece0] mb-2">Jalankan SQL Schema</h3>
                <p className="text-[#a09880] text-sm mb-4">
                  Di dashboard Supabase, buka <strong className="text-[#c9a84c]">SQL Editor</strong> dan paste SQL berikut:
                </p>
                <div className="relative">
                  <pre className="bg-[#0a0a0f] border border-[rgba(201,168,76,0.15)] rounded-xl p-4 text-xs text-[#a09880] overflow-x-auto max-h-48 overflow-y-auto leading-relaxed">
                    {SQL_SCHEMA}
                  </pre>
                  <button
                    onClick={copySQL}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.2)] border border-[rgba(201,168,76,0.2)] rounded-lg text-[#c9a84c] text-xs font-medium transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Copy SQL'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#a07830] rounded-full flex items-center justify-center text-[#0a0a0f] font-bold text-sm flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#f0ece0] mb-2">Ambil API Keys</h3>
                <p className="text-[#a09880] text-sm mb-3">
                  Di Supabase dashboard, buka <strong className="text-[#c9a84c]">Settings → API</strong>. 
                  Salin <strong className="text-[#c9a84c]">Project URL</strong> dan <strong className="text-[#c9a84c]">anon public key</strong>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#a07830] rounded-full flex items-center justify-center text-[#0a0a0f] font-bold text-sm flex-shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#f0ece0] mb-2">Isi file <code className="text-[#c9a84c] bg-[rgba(201,168,76,0.1)] px-1.5 py-0.5 rounded text-xs">.env</code></h3>
                <p className="text-[#a09880] text-sm mb-3">
                  Buka file <code className="text-[#c9a84c]">.env</code> di root project dan isi:
                </p>
                <pre className="bg-[#0a0a0f] border border-[rgba(201,168,76,0.15)] rounded-xl p-4 text-xs text-[#a09880] leading-relaxed">
{`VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                </pre>
                <p className="text-[#605848] text-xs mt-3">
                  Setelah mengisi .env, restart dev server dengan <code className="text-[#c9a84c]">npm run dev</code>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[#403828] text-sm mt-8"
        >
          Butuh bantuan? Hubungi tim pengembang.
        </motion.p>
      </div>
    </div>
  );
}
