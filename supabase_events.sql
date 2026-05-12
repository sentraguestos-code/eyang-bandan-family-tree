-- Tabel acara/kegiatan
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  event_date  DATE NOT NULL,
  event_time  TEXT,
  status      TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  banner_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel pendaftaran peserta acara
CREATE TABLE IF NOT EXISTS event_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id       UUID REFERENCES family_members(id) ON DELETE SET NULL,
  member_name     TEXT NOT NULL,
  generation      INTEGER,
  parent_lineage  TEXT,
  phone           TEXT,
  will_attend     BOOLEAN DEFAULT true,
  attendee_count  INTEGER DEFAULT 1,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date         ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events"        ON events FOR SELECT USING (true);
CREATE POLICY "Public insert events"      ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update events"      ON events FOR UPDATE USING (true);
CREATE POLICY "Public delete events"      ON events FOR DELETE USING (true);

CREATE POLICY "Public read registrations"   ON event_registrations FOR SELECT USING (true);
CREATE POLICY "Public insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete registrations" ON event_registrations FOR DELETE USING (true);
