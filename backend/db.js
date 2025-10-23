// db.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, 'guardianbox.db'));

export function initDb() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      storage_path TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_at INTEGER NOT NULL,
      expires_at INTEGER,
      download_limit INTEGER,
      downloads_done INTEGER DEFAULT 0
    )
  `).run();
}

export function insertFile(record) {
  db.prepare(`
    INSERT INTO files (id, storage_path, size, uploaded_at, expires_at, download_limit, downloads_done)
    VALUES (@id, @storage_path, @size, @uploaded_at, @expires_at, @download_limit, @downloads_done)
  `).run(record);
}

export function getFile(id) {
  return db.prepare(`SELECT * FROM files WHERE id = ?`).get(id);
}

export function incrementDownloads(id) {
  db.prepare(`UPDATE files SET downloads_done = downloads_done + 1 WHERE id = ?`).run(id);
}

export function deleteFile(id) {
  const rec = getFile(id);
  if (rec) {
    try { fs.unlinkSync(rec.storage_path); } catch {}
    db.prepare(`DELETE FROM files WHERE id = ?`).run(id);
  }
}

export function listAllFiles() {
  return db.prepare(`SELECT * FROM files`).all();
}
