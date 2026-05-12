-- ============================================================
-- Eyang Bandan Family Tree — Supabase Schema
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Tabel utama anggota keluarga
CREATE TABLE IF NOT EXISTS family_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('male', 'female')),
  photo_url   TEXT,
  bio         TEXT,
  birth_date  DATE,
  death_date  DATE,
  location_city TEXT,
  location_lat  DOUBLE PRECISION,
  location_lng  DOUBLE PRECISION,
  parent_id   UUID REFERENCES family_members(id) ON DELETE SET NULL,
  generation  INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_family_members_parent_id  ON family_members(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_members_generation ON family_members(generation);
CREATE INDEX IF NOT EXISTS idx_family_members_name       ON family_members(name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- Aktifkan agar data aman — siapa saja bisa baca,
-- tapi untuk write bisa dikontrol nanti
-- ============================================================

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang bisa baca (public read)
CREATE POLICY "Public read access"
  ON family_members FOR SELECT
  USING (true);

-- Policy: semua orang bisa insert (untuk sementara, bisa diperketat nanti)
CREATE POLICY "Public insert access"
  ON family_members FOR INSERT
  WITH CHECK (true);

-- Policy: semua orang bisa update
CREATE POLICY "Public update access"
  ON family_members FOR UPDATE
  USING (true);

-- Policy: semua orang bisa delete
CREATE POLICY "Public delete access"
  ON family_members FOR DELETE
  USING (true);
