const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'file_index.db');

// Ensure data directory exists
const fs = require('fs');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name_am     TEXT NOT NULL,
    name_or     TEXT,
    name_en     TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    description TEXT,
    color       TEXT DEFAULT '#1B4F72',
    icon        TEXT DEFAULT 'folder',
    is_active   INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS files (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    file_number    TEXT UNIQUE NOT NULL,
    title_am       TEXT NOT NULL,
    title_or       TEXT,
    title_en       TEXT,
    department_id  INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    description    TEXT,
    file_path      TEXT,
    file_name      TEXT,
    file_type      TEXT,
    file_size      INTEGER DEFAULT 0,
    upload_date    TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now')),
    is_active      INTEGER DEFAULT 1,
    view_count     INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_by     INTEGER
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    role          TEXT DEFAULT 'viewer' CHECK(role IN ('superadmin','admin','viewer')),
    is_active     INTEGER DEFAULT 1,
    last_login    TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT,
    entity_type TEXT,
    entity_id   INTEGER,
    details     TEXT,
    ip_address  TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed data (only if tables are empty) ─────────────────────────────────────
const deptCount = db.prepare('SELECT COUNT(*) as c FROM departments').get().c;
if (deptCount === 0) {
  const insertDept = db.prepare(`
    INSERT INTO departments (name_am, name_or, name_en, slug, color) VALUES
    (?, ?, ?, ?, ?)
  `);
  const depts = [
    ['የሰላም እሴት ግንባታ', 'Ijaarsa Gatii Nagaa',         'Peace Values Building', 'peace-values',     '#1B6CA8'],
    ['የሰው ሃብት',        'Qabeenya Namaa',               'Human Resources',       'human-resources',  '#1E8449'],
    ['የፋይናንስ',         'Maallaqaa',                    'Finance',               'finance',           '#B7950B'],
    ['የፕላንና በጀት',      'Karoora fi Baajata',           'Plan and Budget',       'plan-budget',       '#6C3483'],
    ['የህዝብ ግንኙነት',    'Dhimma Hawaasaa',               'Public Relations',      'public-relations',  '#1A5276'],
    ['የሴቶችና ህፃናት',    "Dubartii fi Da'imman",          'Women and Children',    'women-children',    '#C0392B'],
    ['የወጣቶች',          'Dargaggoota',                  'Youth',                 'youth',              '#117A65'],
  ];
  const seedDepts = db.transaction(() => depts.forEach(d => insertDept.run(...d)));
  seedDepts();

  const insertFile = db.prepare(`
    INSERT INTO files (file_number, title_am, title_or, title_en, department_id, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const files = [
    ['001/2016', 'የስልጠና ፋይል',            'Faayilii Leenjii',               'Training File',               1, 'ዋና የስልጠና ሰነዶች ፋይል'],
    ['002/2016', 'የስልጠና ሰነድ',             'Galmee Leenjii',                 'Training Document',           1, 'ሁሉንም የስልጠና ሰነዶች የያዘ'],
    ['003/2016', 'ግንዛቤ ስልጠና',             'Leenjii Hubannoo',               'Awareness Training',          1, 'የህዝብ ግንዛቤ ማስጨበጫ ሰነዶች'],
    ['004/2016', 'ንቅናቄና ኮንፈረንስ',          'Sochiifi Konfaransii',            'Campaigns and Conferences',   2, 'ሁሉም ዝግጅቶችና ኮንፈረንሶች'],
    ['005/2016', 'ብሄራዊ በጎ ፍቃድ',          'Fedhii Tola Ooltummaa',          'National Volunteerism',       3, 'ብሄራዊ የበጎ ፍቃደኝነት ፕሮግራሞች'],
    ['006/2016', 'የሰው ሃብት አስተዳደር ፋይል', 'Faayilii Bulchiinsa Qabeenya',   'HR Management File',          2, 'የሰው ሃብት አስተዳደር ዋና ሰነዶች'],
    ['007/2016', 'የበጀት ዕቅድ ሰነድ',          'Galmee Karoora Baajataa',        'Budget Plan Document',        4, 'ዓመታዊ የበጀት ዕቅድ'],
    ['008/2016', 'የሴቶች ሕጋዊ መብቶች',        'Mirgoota Seeraa Dubartoota',     'Women Legal Rights',          6, 'የሴቶች ሕጋዊ መብቶች ሰነዶች'],
    ['009/2016', 'የወጣቶች ልማት ፕሮግራም',     'Sagantaa Misooma Dargaggootaa',  'Youth Development Program',   7, 'የወጣቶች ልማት ዕቅዶች'],
    ['010/2016', 'ህዝብ ግንኙነት ሪፖርት',       'Gabaasa Dhimma Hawaasaa',        'Public Relations Report',     5, 'ዓመታዊ የህዝብ ግንኙነት ሪፖርት'],
    ['011/2016', 'የፋይናንስ ሪፖርት',           'Gabaasa Maallaqaa',              'Finance Report',              3, 'ሩብ ዓመት የፋይናንስ ሪፖርት'],
    ['012/2016', 'ዓመታዊ ዕቅድ',              'Karoora Waggaa',                 'Annual Plan',                 4, 'ዓመታዊ ዕቅድና አፈፃፀም'],
    ['013/2016', 'የሕፃናት ፕሮግራም',           "Sagantaa Da'immanii",            'Children Program',            6, 'የሕፃናት ድጋፍ ፕሮግራሞች'],
    ['014/2016', 'ሰላማዊ ማህበረሰብ ፋይል',     'Faayilii Hawaasa Nagaa',         'Peaceful Community File',     1, 'ሰላማዊ ማህበረሰብ ግንባታ ሰነዶች'],
    ['015/2016', 'የስምምነት ሰነዶች',           'Galmeelee Waliigaltee',          'Agreement Documents',         5, 'ዋና ዋና ስምምነቶች'],
  ];
  const seedFiles = db.transaction(() => files.forEach(f => insertFile.run(...f)));
  seedFiles();
}

const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hash = bcrypt.hashSync('Admin@1234', 10);
  db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES ('admin', 'admin@gov.et', ?, 'System Administrator', 'superadmin')
  `).run(hash);
}

// ── pool-compatible async wrapper ─────────────────────────────────────────────
// Wraps better-sqlite3 (sync) behind a mysql2-compatible promise interface
// so routes need zero changes.
const pool = {
  execute: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const normalized = normalizeSql(sql);
        const stmt = db.prepare(normalized);
        const upper = normalized.trim().toUpperCase();

        if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
          const rows = stmt.all(...params);
          resolve([rows]);
        } else if (upper.startsWith('INSERT')) {
          const info = stmt.run(...params);
          resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
        } else {
          const info = stmt.run(...params);
          resolve([{ affectedRows: info.changes }]);
        }
      } catch (err) {
        // Map SQLite constraint errors to mysql2-style codes
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          err.code = 'ER_DUP_ENTRY';
        }
        reject(err);
      }
    });
  },
};

// Convert MySQL-specific SQL to SQLite-compatible SQL
function normalizeSql(sql) {
  return sql
    // Remove MySQL backtick quoting (SQLite uses double-quotes or none)
    .replace(/`/g, '"')
    // MySQL LIMIT ?,? → SQLite LIMIT ? OFFSET ? (already compatible)
    // CAST(SUBSTRING_INDEX(...) AS UNSIGNED) → CAST(... AS INTEGER)
    .replace(/CAST\s*\(\s*SUBSTRING_INDEX\s*\(([^,]+),\s*'([^']+)'\s*,\s*1\s*\)\s*AS\s+UNSIGNED\s*\)/gi,
      (_, col) => `CAST(${col.trim()} AS INTEGER)`)
    // MySQL NOW() → datetime('now')
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    // TINYINT(1) not needed in SQLite but fine to leave
    // AUTO_INCREMENT not in SQLite but we use AUTOINCREMENT in schema
    ;
}

async function testConnection() {
  console.log(`✅ SQLite database ready: ${DB_PATH}`);
}

module.exports = { pool, testConnection, db };
