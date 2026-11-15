const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'booknook.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

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

// Helper function to initialize schema
function initDb() {
  return new Promise((resolve, reject) => {
    try {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schemaSql, (err) => {
        if (err) {
          console.error('[-] Error executing schema.sql:', err.message);
          return reject(err);
        }
        resolve();
      });
    } catch (readErr) {
      console.error('[-] Error reading schema.sql:', readErr.message);
      reject(readErr);
    }
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
