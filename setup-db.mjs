/**
 * Setup script — jalankan SEKALI untuk membuat tabel di Supabase
 * Usage: node setup-db.mjs <service_role_key>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wwcgikuwxpcynrdnafkh.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.error('Usage: node setup-db.mjs <service_role_key>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SQL = `
CREATE TABLE IF NOT EXISTS family_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  gender        TEXT CHECK (gender IN ('male', 'female')),
  photo_url     TEXT,
  bio           TEXT,
  birth_date    DATE,
  death_date    DATE,
  location_city TEXT,
  location_lat  DOUBLE PRECISION,
  location_lng  DOUBLE PRECISION,
  parent_id     UUID REFERENCES family_members(id) ON DELETE SET NULL,
  generation    INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_parent_id  ON family_members(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_members_generation ON family_members(generation);
CREATE INDEX IF NOT EXISTS idx_family_members_name       ON family_members(name);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_family_members_updated_at ON family_members;
CREATE TRIGGER trg_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Public read access') THEN
    CREATE POLICY "Public read access" ON family_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Public insert access') THEN
    CREATE POLICY "Public insert access" ON family_members FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Public update access') THEN
    CREATE POLICY "Public update access" ON family_members FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Public delete access') THEN
    CREATE POLICY "Public delete access" ON family_members FOR DELETE USING (true);
  END IF;
END
$do$;
`;

async function setup() {
  console.log('🔧 Setting up Supabase database...\n');

  const { error } = await supabase.rpc('exec_sql', { sql: SQL }).catch(() => ({ error: { message: 'rpc not available' } }));

  if (error) {
    // Fallback: try direct query via pg endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    
    // Try management API
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/wwcgikuwxpcynrdnafkh/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ query: SQL })
    });

    if (mgmtRes.ok) {
      console.log('✅ Database setup successful via Management API!');
    } else {
      const errText = await mgmtRes.text();
      console.log('⚠️  Could not run SQL automatically.');
      console.log('Please run the SQL manually in Supabase Dashboard → SQL Editor');
      console.log('File: supabase_schema.sql');
      console.log('\nError:', errText);
    }
    return;
  }

  console.log('✅ Database setup successful!');
  
  // Verify
  const { data, error: verifyError } = await supabase.from('family_members').select('id').limit(1);
  if (!verifyError) {
    console.log('✅ Table verified — ready to use!');
  }
}

setup().catch(console.error);
