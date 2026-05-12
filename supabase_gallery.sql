-- Tabel galeri foto keluarga
CREATE TABLE IF NOT EXISTS gallery_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  photo_url    TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  category     TEXT DEFAULT 'umum' CHECK (category IN ('umum', 'silaturahmi', 'pernikahan', 'wisuda', 'lainnya')),
  taken_at     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery_photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_category   ON gallery_photos(category);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery"   ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Public insert gallery" ON gallery_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete gallery" ON gallery_photos FOR DELETE USING (true);
