// cleanup.js
import cron from "node-cron";
import { listAllFiles, deleteFile } from "./db.js";

async function cleanupJob() {
  const now = Math.floor(Date.now() / 1000);
  const files = listAllFiles();

  for (const file of files) {
    if (
      (file.expires_at && file.expires_at <= now) ||
      (file.download_limit && file.downloads_done >= file.download_limit)
    ) {
      console.log(`🧹 Deleting expired file: ${file.id}`);
      await deleteFile(file.id);
    }
  }
}

export function startScheduler() {
  // Run cleanup every 10 minutes
  cron.schedule("*/10 * * * *", cleanupJob);
  console.log("⏰ Cleanup scheduler started (every 10 minutes)");
}
