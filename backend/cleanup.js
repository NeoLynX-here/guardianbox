// cleanup.js
import cron from 'node-cron';
import time from 'node:timers';
import { listAllFiles, deleteFile } from './db.js';

function cleanupJob() {
  const now = Math.floor(Date.now() / 1000);
  for (const rec of listAllFiles()) {
    if (rec.expires_at && rec.expires_at <= now) {
      console.log(`[cleanup] deleting expired ${rec.id}`);
      deleteFile(rec.id);
      continue;
    }
    if (rec.download_limit && rec.downloads_done >= rec.download_limit) {
      console.log(`[cleanup] deleting reached-limit ${rec.id}`);
      deleteFile(rec.id);
    }
  }
}

export function startScheduler() {
  // every 10 minutes
  cron.schedule('*/10 * * * *', cleanupJob);
}
