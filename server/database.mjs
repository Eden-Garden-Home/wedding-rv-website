import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function openDatabase(path = process.env.WEDDING_DB_PATH || './data/wedding.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
  const version = db.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations').get().version;
  for (const [nextVersion, file] of [[1, '001_initial.sql'], [2, '002_event_code.sql']]) {
    if (version >= nextVersion) continue;
    const sql = readFileSync(new URL(`./migrations/${file}`, import.meta.url), 'utf8');
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations(version, applied_at) VALUES(?, ?)').run(nextVersion, new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  return db;
}

export function transaction(db, run) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = run();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
