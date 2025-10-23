// main.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import {
  initDb,
  insertFile,
  getFile,
  incrementDownloads,
  deleteFile,
} from "./db.js";
import { startScheduler } from "./cleanup.js";
import { uploadToS3, getFromS3, deleteFromS3 } from "./s3.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ✅ CORS configuration 
app.use(
  cors({
    origin: [
    "https://guardianbox.netlify.app/", 
  ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);

// ✅ Logger (optional, for debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Multer temp upload folder
const TEMP_UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(TEMP_UPLOAD_DIR)) fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: TEMP_UPLOAD_DIR });

// Initialize DB and scheduler
initDb();
startScheduler();

function genId() {
  return uuidv4().replace(/-/g, "").slice(0, 12);
}

/* --------------------------- UPLOAD --------------------------- */
app.post("/upload", upload.single("file"), async (req, res) => {
  const fid = genId();
  const s3Key = `${fid}.enc`;

  try {
    // Upload encrypted file to S3
    await uploadToS3(req.file.path, s3Key);
    fs.unlinkSync(req.file.path); // remove temp file

    const record = {
      id: fid,
      s3_key: s3Key, // store S3 key instead of local path
      size: req.file.size,
      uploaded_at: Math.floor(Date.now() / 1000),
      expires_at: req.body.expires_seconds
        ? Math.floor(Date.now() / 1000) + parseInt(req.body.expires_seconds)
        : Math.floor(Date.now() / 1000) + 86400,
      download_limit: req.body.download_limit
        ? parseInt(req.body.download_limit)
        : 5,
      downloads_done: 0,
    };

    insertFile(record);
    res.json({ id: fid, download_url: `/file/${fid}` });
  } catch (err) {
    console.error("S3 upload error:", err);
    res.status(500).json({ detail: "upload failed" });
  }
});

/* --------------------------- METADATA --------------------------- */
app.get("/file/:fid", (req, res) => {
  const rec = getFile(req.params.fid);
  if (!rec) return res.status(404).json({ detail: "file not found" });

  const now = Math.floor(Date.now() / 1000);
  if (rec.expires_at && rec.expires_at <= now) {
    deleteFile(rec.id);
    return res.status(404).json({ detail: "file expired" });
  }

  res.setHeader("Content-Type", "application/json");
  res.json({
    id: rec.id,
    size: rec.size,
    uploaded_at: rec.uploaded_at,
    expires_at: rec.expires_at,
    download_limit: rec.download_limit,
    downloads_done: rec.downloads_done,
  });
});

/* --------------------------- DOWNLOAD --------------------------- */
app.get("/file/:fid/download", async (req, res) => {
  const rec = getFile(req.params.fid);
  if (!rec) return res.status(404).json({ detail: "file not found" });

  const now = Math.floor(Date.now() / 1000);
  if (rec.expires_at && rec.expires_at <= now) {
    await deleteFromS3(rec.s3_key);
    deleteFile(rec.id);
    return res.status(404).json({ detail: "file expired" });
  }

  if (rec.download_limit && rec.downloads_done >= rec.download_limit) {
    await deleteFromS3(rec.s3_key);
    deleteFile(rec.id);
    return res.status(403).json({ detail: "download limit reached" });
  }

  try {
    const s3Object = await getFromS3(rec.s3_key);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Disposition", `attachment; filename="${rec.id}.enc"`);
    res.setHeader("Content-Type", "application/octet-stream");
    incrementDownloads(rec.id);

    s3Object.Body.pipe(res); // stream directly to frontend
  } catch (err) {
    console.error("S3 download error:", err);
    res.status(500).json({ detail: "S3 fetch failed" });
  }
});

/* --------------------------- SERVER --------------------------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`GuardianBox (S3) backend running on http://0.0.0.0:${PORT}`);
});
