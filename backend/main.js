// main.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { initDb, insertFile, getFile, incrementDownloads, deleteFile } from './db.js';
import { startScheduler } from './cleanup.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const upload = multer({ dest: UPLOAD_DIR });

// Set up rate limiter: e.g., max 100 requests per 15 minutes per IP
const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many download requests from this IP, please try again later.' }
});

// Set up rate limiter for uploads (stricter: e.g. 20 uploads per 15 min per IP)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many upload requests from this IP, please try again later.' }
});

initDb();
startScheduler();

app.post('/upload', uploadLimiter, upload.single('file'), (req, res) => {
  const fid = genId();
  const destPath = path.join(UPLOAD_DIR, `${fid}.enc`);
  let tempPath;
  try {
    tempPath = fs.realpathSync(path.resolve(req.file.path));
  } catch (e) {
    return res.status(400).json({ detail: 'invalid upload path' });
  }
  // Ensure the temp path is inside the intended upload directory
  const absUploadDir = fs.realpathSync(UPLOAD_DIR);
  if (!tempPath.startsWith(absUploadDir + path.sep)) {
    return res.status(400).json({ detail: 'invalid upload path' });
  }
  fs.renameSync(tempPath, destPath);

  const record = {
    id: fid,
    storage_path: destPath,
    size: req.file.size,
    uploaded_at: Math.floor(Date.now() / 1000),
    expires_at: req.body.expires_seconds ? Math.floor(Date.now() / 1000) + parseInt(req.body.expires_seconds) : null,
    download_limit: req.body.download_limit ? parseInt(req.body.download_limit) : null,
    downloads_done: 0
  };

  insertFile(record);
  res.json({ id: fid, download_url: `/file/${fid}` });
});

app.get('/file/:fid', (req, res) => {
  const rec = getFile(req.params.fid);
  if (!rec) return res.status(404).json({ detail: 'file not found' });

  const now = Math.floor(Date.now() / 1000);
  if (rec.expires_at && rec.expires_at <= now) {
    deleteFile(rec.id);
    return res.status(404).json({ detail: 'file expired' });
  }

  res.json({
    id: rec.id,
    size: rec.size,
    uploaded_at: rec.uploaded_at,
    expires_at: rec.expires_at,
    download_limit: rec.download_limit,
    downloads_done: rec.downloads_done
  });
});

app.get('/file/:fid/download', downloadLimiter, (req, res) => {
  const rec = getFile(req.params.fid);
  if (!rec) return res.status(404).json({ detail: 'file not found' });

  const now = Math.floor(Date.now() / 1000);
  if (rec.expires_at && rec.expires_at <= now) {
    deleteFile(rec.id);
    return res.status(404).json({ detail: 'file expired' });
  }

  if (rec.download_limit && rec.downloads_done >= rec.download_limit) {
    deleteFile(rec.id);
    return res.status(403).json({ detail: 'download limit reached' });
  }

  if (!fs.existsSync(rec.storage_path)) {
    deleteFile(rec.id);
    return res.status(404).json({ detail: 'file not found' });
  }

  incrementDownloads(rec.id);
  res.setHeader('Content-Disposition', `attachment; filename="${rec.id}.enc"`);
  fs.createReadStream(rec.storage_path).pipe(res);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
