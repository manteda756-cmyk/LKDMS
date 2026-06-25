-- ============================================================
-- Ethiopia File Index Management System - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL PRIMARY KEY,
  name_am     TEXT NOT NULL,
  name_or     TEXT,
  name_en     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#1B4F72',
  icon        TEXT DEFAULT 'folder',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id             SERIAL PRIMARY KEY,
  file_number    TEXT UNIQUE NOT NULL,
  title_am       TEXT NOT NULL,
  title_or       TEXT,
  title_en       TEXT,
  department_id  INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  description    TEXT,
  file_path      TEXT,
  file_name      TEXT,
  file_type      TEXT,
  file_size      BIGINT DEFAULT 0,
  upload_date    TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  is_active      BOOLEAN DEFAULT true,
  view_count     INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_by     INTEGER
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT DEFAULT 'viewer' CHECK (role IN ('superadmin','admin','viewer')),
  is_active     BOOLEAN DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Views ────────────────────────────────────────────────────

CREATE OR REPLACE VIEW files_with_dept AS
SELECT
  f.*,
  d.name_am  AS dept_name_am,
  d.name_or  AS dept_name_or,
  d.name_en  AS dept_name_en,
  d.color    AS dept_color,
  d.slug     AS dept_slug
FROM files f
LEFT JOIN departments d ON d.id = f.department_id;

CREATE OR REPLACE VIEW departments_with_count AS
SELECT
  d.*,
  COUNT(f.id) AS count,
  COUNT(f.id) AS file_count
FROM departments d
LEFT JOIN files f ON f.department_id = d.id AND f.is_active = true
GROUP BY d.id;

-- ── Helper function for download counter ─────────────────────

CREATE OR REPLACE FUNCTION increment_download(file_id INTEGER)
RETURNS void LANGUAGE sql AS $$
  UPDATE files SET download_count = download_count + 1 WHERE id = file_id;
$$;

-- ── Row Level Security (public read, service-role write) ──────

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;

-- Anyone can read active departments and files
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (is_active = true);
CREATE POLICY "Public read files"       ON files       FOR SELECT USING (is_active = true);

-- Service role bypasses RLS (used by API routes with service key)

-- ── Seed Departments ─────────────────────────────────────────

INSERT INTO departments (name_am, name_or, name_en, slug, color) VALUES
  ('የሰላም እሴት ግንባታ', 'Ijaarsa Gatii Nagaa',       'Peace Values Building', 'peace-values',    '#1B6CA8'),
  ('የሰው ሃብት',        'Qabeenya Namaa',             'Human Resources',       'human-resources', '#1E8449'),
  ('የፋይናንስ',         'Maallaqaa',                  'Finance',               'finance',         '#B7950B'),
  ('የፕላንና በጀት',      'Karoora fi Baajata',         'Plan and Budget',       'plan-budget',     '#6C3483'),
  ('የህዝብ ግንኙነት',    'Dhimma Hawaasaa',             'Public Relations',      'public-relations','#1A5276'),
  ('የሴቶችና ህፃናት',    'Dubartii fi Da''imman',       'Women and Children',    'women-children',  '#C0392B'),
  ('የወጣቶች',          'Dargaggoota',                'Youth',                 'youth',            '#117A65')
ON CONFLICT (slug) DO NOTHING;

-- ── Seed Sample Files ────────────────────────────────────────

INSERT INTO files (file_number, title_am, title_or, title_en, department_id, description) VALUES
  ('001/2016', 'የስልጠና ፋይል',            'Faayilii Leenjii',              'Training File',              1, 'ዋና የስልጠና ሰነዶች ፋይል'),
  ('002/2016', 'የስልጠና ሰነድ',             'Galmee Leenjii',                'Training Document',          1, 'ሁሉንም የስልጠና ሰነዶች የያዘ'),
  ('003/2016', 'ግንዛቤ ስልጠና',             'Leenjii Hubannoo',              'Awareness Training',         1, 'የህዝብ ግንዛቤ ማስጨበጫ ሰነዶች'),
  ('004/2016', 'ንቅናቄና ኮንፈረንስ',          'Sochiifi Konfaransii',           'Campaigns and Conferences',  2, 'ሁሉም ዝግጅቶችና ኮንፈረንሶች'),
  ('005/2016', 'ብሄራዊ በጎ ፍቃድ',          'Fedhii Tola Ooltummaa',         'National Volunteerism',      3, 'ብሄራዊ የበጎ ፍቃደኝነት ፕሮግራሞች'),
  ('006/2016', 'የሰው ሃብት አስተዳደር ፋይል', 'Faayilii Bulchiinsa Qabeenya',  'HR Management File',         2, 'የሰው ሃብት አስተዳደር ዋና ሰነዶች'),
  ('007/2016', 'የበጀት ዕቅድ ሰነድ',          'Galmee Karoora Baajataa',       'Budget Plan Document',       4, 'ዓመታዊ የበጀት ዕቅድ'),
  ('008/2016', 'የሴቶች ሕጋዊ መብቶች',        'Mirgoota Seeraa Dubartoota',    'Women Legal Rights',         6, 'የሴቶች ሕጋዊ መብቶች ሰነዶች'),
  ('009/2016', 'የወጣቶች ልማት ፕሮግራም',     'Sagantaa Misooma Dargaggootaa', 'Youth Development Program',  7, 'የወጣቶች ልማት ዕቅዶች'),
  ('010/2016', 'ህዝብ ግንኙነት ሪፖርት',       'Gabaasa Dhimma Hawaasaa',       'Public Relations Report',    5, 'ዓመታዊ የህዝብ ግንኙነት ሪፖርት'),
  ('011/2016', 'የፋይናንስ ሪፖርት',           'Gabaasa Maallaqaa',             'Finance Report',             3, 'ሩብ ዓመት የፋይናንስ ሪፖርት'),
  ('012/2016', 'ዓመታዊ ዕቅድ',              'Karoora Waggaa',                'Annual Plan',                4, 'ዓመታዊ ዕቅድና አፈፃፀም'),
  ('013/2016', 'የሕፃናት ፕሮግራም',           'Sagantaa Da''immanii',          'Children Program',           6, 'የሕፃናት ድጋፍ ፕሮግራሞች'),
  ('014/2016', 'ሰላማዊ ማህበረሰብ ፋይል',     'Faayilii Hawaasa Nagaa',        'Peaceful Community File',    1, 'ሰላማዊ ማህበረሰብ ግንባታ ሰነዶች'),
  ('015/2016', 'የስምምነት ሰነዶች',           'Galmeelee Waliigaltee',         'Agreement Documents',        5, 'ዋና ዋና ስምምነቶች')
ON CONFLICT (file_number) DO NOTHING;

-- ── Seed Admin User (password: Admin@1234) ───────────────────
-- Hash generated with bcrypt rounds=10
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin', 'admin@gov.et',
   '$2a$10$exqUfIoSCKTUlC0Q8Lrt.eV512lKArkvB.e2ZP7DKwhmx7i7MTvCe',
   'System Administrator', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ── Supabase Storage bucket ───────────────────────────────────
-- Run this separately in SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('file-attachments', 'file-attachments', false);
-- 
-- Then add this storage policy (Dashboard > Storage > file-attachments > Policies):
-- Allow service role full access (already granted by default)
-- Allow authenticated download via signed URLs (handled by API route)
