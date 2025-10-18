// crypto.js
export async function randomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

export async function deriveKeyFromPassword(password, salt, iterations = 200000) {
  const pwUtf8 = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey("raw", pwUtf8, "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

async function buildPlainPackage(file, filename) {
  const filenameBytes = new TextEncoder().encode(filename);
  const fileBuffer = await file.arrayBuffer();
  const header = new Uint8Array(4 + filenameBytes.byteLength);
  const dv = new DataView(header.buffer);
  dv.setUint32(0, filenameBytes.byteLength, false); // big-endian
  header.set(filenameBytes, 4);
  const combined = new Uint8Array(header.byteLength + fileBuffer.byteLength);
  combined.set(header, 0);
  combined.set(new Uint8Array(fileBuffer), header.byteLength);
  return combined.buffer;
}

export async function encryptPackage(file, filename, password) {
  const salt = await randomBytes(16);
  const iv = await randomBytes(12);
  const key = await deriveKeyFromPassword(password, salt);
  const plaintext = await buildPlainPackage(file, filename);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const out = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.byteLength);
  out.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);
  return new Blob([out.buffer], { type: "application/octet-stream" });
}

export async function decryptPackage(encryptedBlob, password) {
  const buf = await encryptedBlob.arrayBuffer();
  const view = new Uint8Array(buf);
  const salt = view.slice(0, 16);
  const iv = view.slice(16, 28);
  const ciphertext = view.slice(28);
  const key = await deriveKeyFromPassword(password, salt);
  try {
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const pview = new DataView(plaintext);
    const fnameLen = pview.getUint32(0, false);
    const fnameBytes = new Uint8Array(plaintext.slice(4, 4 + fnameLen));
    const filename = new TextDecoder().decode(fnameBytes);
    const fileBytes = plaintext.slice(4 + fnameLen);
    const fileBlob = new Blob([fileBytes]);
    return { filename, fileBlob };
  } catch (e) {
    throw new Error("Decryption failed (wrong password or corrupted file)");
  }
}
