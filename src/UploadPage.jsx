// UploadPage.jsx
import React, { useState } from "react";
import { encryptPackage } from "./crypto";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expires, setExpires] = useState(""); // seconds
  const [downloadLimit, setDownloadLimit] = useState("");
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("select file");
    if (!password) return alert("enter password");

    setStatus("Encrypting...");
    const encryptedBlob = await encryptPackage(file, file.name, password);

    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", new File([encryptedBlob], "cipher.enc"));
    if (expires) fd.append("expires_seconds", String(Number(expires)));
    if (downloadLimit) fd.append("download_limit", String(Number(downloadLimit)));

    try {
      const res = await fetch("http://192.168.68.104:8000/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("Upload failed");
        console.error(data);
        return;
      }
      const url = `${window.location.origin}/download.html?id=${data.id}`;
      setLink(url);
      setStatus("Upload complete");
    } catch (err) {
      console.error(err);
      setStatus("Upload error");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>GuardianBox — Upload</h2>
      <form onSubmit={handleUpload}>
        <div>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
        </div>
        <div>
          <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <input placeholder="Expires in seconds (optional)" value={expires} onChange={e => setExpires(e.target.value)} />
        </div>
        <div>
          <input placeholder="Download limit (optional)" value={downloadLimit} onChange={e => setDownloadLimit(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Encrypt & Upload</button>
        </div>
      </form>

      <div style={{ marginTop: 10 }}>{status}</div>
      {link && <div>Shareable link: <a href={link}>{link}</a></div>}
    </div>
  );
}
