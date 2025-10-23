// s3.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

/* ---------- S3 Client ---------- */
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ---------- Upload to S3 ---------- */
export async function uploadToS3(filePath, key) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileStream,
  };

  await s3.send(new PutObjectCommand(uploadParams));
  console.log(`✅ Uploaded ${key} to S3`);
}

/* ---------- Get from S3 (for streaming downloads) ---------- */
export async function getFromS3(key) {
  const getParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  return s3.send(new GetObjectCommand(getParams)); // returns stream in Body
}

/* ---------- Delete from S3 ---------- */
export async function deleteFromS3(key) {
  const delParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  await s3.send(new DeleteObjectCommand(delParams));
  console.log(`🗑️ Deleted ${key} from S3`);
}
