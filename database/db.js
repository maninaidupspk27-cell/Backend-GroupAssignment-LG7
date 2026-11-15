const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support Vercel Serverless environment:
// Root filesystem is read-only on Vercel; use /tmp for SQLite database storage.
let DB_PATH = path.join(__dirname, 'booknook.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

if (process.env.VERCEL) {
  DB_PATH = path.join('/tmp', 'booknook.db');
}

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[-] Error connecting to SQLite database:', err.message);
  } else {
    // Enforce foreign key constraints
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('[-] Error enabling foreign keys:', pragmaErr.message);
      }
    });
  }
});

const DEFAULT_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
);

CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT
);
`;

// Helper function to initialize schema
async function initDb() {
  return new Promise((resolve, reject) => {
    let schemaSql = DEFAULT_SCHEMA_SQL;
    try {
      if (fs.existsSync(SCHEMA_PATH)) {
        schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      }
    } catch (e) {
      // Fallback to embedded schema string
      schemaSql = DEFAULT_SCHEMA_SQL;
    }

    db.exec(schemaSql, async (err) => {
      if (err) {
        console.error('[-] Error executing schema:', err.message);
        return reject(err);
      }

      // On Vercel serverless cold start, auto-seed the database if tables are empty
      if (process.env.VERCEL) {
        try {
          const countRow = await query.get('SELECT COUNT(*) AS count FROM games');
          if (!countRow || countRow.count < 30) {
            const { seedDatabase } = require('./seed');
            await seedDatabase();
          }
        } catch (seedErr) {
          console.error('[-] Vercel auto-seed notification:', seedErr.message);
        }
      }

      resolve();
    });
  });
}

// Automatically ensure tables exist
initDb().catch((err) => {
  console.error('[-] Automatic DB init failed:', err.message);
});

// Promisified query helper functions for clean async/await in controllers
const query = {
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise(function(resolve, reject) {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = { db, query, initDb, DB_PATH };
