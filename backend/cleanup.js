// cleanup.js
import cron from 'node-cron';
import { listAllFiles, deleteFile } from './db.js';

function cleanupJob() {
  const now = Math.floor(Date.now() / 1000);
  
  for (const file of listAllFiles()) {
    if ((file.expires_at && file.expires_at <= now) || 
        (file.download_limit && file.downloads_done >= file.download_limit)) {
      deleteFile(file.id);
    }
  }
}

export function startScheduler() {
  cron.schedule('*/10 * * * *', cleanupJob);
}
