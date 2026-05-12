-- Tambah kolom child_order ke tabel family_members
-- Jalankan di Supabase Dashboard → SQL Editor

ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS child_order INTEGER DEFAULT NULL;

-- Index untuk performa sorting
CREATE INDEX IF NOT EXISTS idx_family_members_child_order 
ON family_members(parent_id, child_order);
