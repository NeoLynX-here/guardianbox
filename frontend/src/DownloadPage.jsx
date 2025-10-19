// DownloadPage.jsx
import React, { useState } from "react";
import { decryptPackage } from "./crypto";

export default function DownloadPage({ fileId }) {
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function loadMeta() {
    setStatus("Loading metadata...");
    try {
      const res = await fetch(`http://192.168.68.104:8000/file/${fileId}`);
      if (!res.ok) {
        const err = await res.json();
        setStatus(err.detail || "Not found");
        return;
      }
      const data = await res.json();
      setMeta(data);
      setStatus("Ready");
    } catch (e) {
      setStatus("Error fetching metadata");
    }
  }

  async function downloadAndDecrypt() {
    if (!password) return alert("enter password");
    setStatus("Downloading ciphertext...");
    try {
      const res = await fetch(`http://192.168.68.104:8000/file/${fileId}/download`);
      if (!res.ok) {
        const err = await res.json();
        setStatus(err.detail || "download failed");
        return;
      }
      const blob = await res.blob();
      setStatus("Decrypting...");
      try {
        const { filename, fileBlob } = await decryptPackage(blob, password);
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStatus("Done");
      } catch (decErr) {
        setStatus(decErr.message || "decryption failed");
      }
    } catch (e) {
      console.error(e);
      setStatus("download error");
    }
  }

  // load metadata on mount
  React.useEffect(() => {
    loadMeta();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>GuardianBox — Download</h2>
      <div>File ID: {fileId}</div>
      <div>Status: {status}</div>
      {meta && (
        <div>
          <div>Size: {meta.size} bytes</div>
          <div>Uploaded at: {new Date(meta.uploaded_at*1000).toLocaleString()}</div>
          <div>Expires at: {meta.expires_at ? new Date(meta.expires_at*1000).toLocaleString() : "Never"}</div>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={downloadAndDecrypt}>Download & Decrypt</button>
      </div>
    </div>
  );
}
