const path = require('path');
const { randomUUID } = require('crypto');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

theDbInit();

function theDbInit() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      owner TEXT,
      status TEXT,
      last_touch TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stage TEXT,
      value INTEGER,
      owner TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      client_id TEXT,
      due TEXT,
      status TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      subject_id TEXT,
      meta TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${randomUUID()}`;

const addAudit = (action, subjectId, meta = {}) => {
  db.prepare(
    'INSERT INTO audit (action, subject_id, meta, created_at) VALUES (?, ?, ?, ?)'
  ).run(action, subjectId ?? null, JSON.stringify(meta), now());
};

module.exports = {
  db,
  makeId,
  addAudit,
  now
};
