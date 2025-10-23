// DownloadPage.jsx
import React, { useState } from "react";
import { decryptPackage } from "./crypto";
import "./styles.css";

export default function DownloadPage({ fileId }) {
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function loadMeta() {
    setStatus("Loading metadata...");
    try {
      const res = await fetch(`http://localhost:8000/file/${fileId}`, {
      headers: {
        "ngrok-skip-browser-warning": "1"
      }
    });
      if (!res.ok) {
        const err = await res.json();
        setStatus(err.detail || "File not found");
        return;
      }
      const data = await res.json();
      setMeta(data);
      setStatus("Ready to download");
    } catch (e) {
      setStatus("Error fetching file metadata");
    }
  }

  async function downloadAndDecrypt() {
    if (!password) return alert("Please enter the decryption password");
    setStatus("Downloading encrypted file...");
    try {
      const res = await fetch(`localhost:8000/file/${fileId}`, {
      headers: {
        "ngrok-skip-browser-warning": "1"
      }
    });
      if (!res.ok) {
        const err = await res.json();
        setStatus(err.detail || "Download failed");
        return;
      }
      const blob = await res.blob();
      setStatus("Decrypting file...");
      try {
        const { filename, fileBlob } = await decryptPackage(blob, password);
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatus("Download complete! File decrypted successfully.");
      } catch (decErr) {
        setStatus(decErr.message || "Decryption failed - wrong password?");
      }
    } catch (e) {
      console.error(e);
      setStatus("Download error");
    }
  }

  React.useEffect(() => {
    loadMeta();
  }, [fileId]);

  const getStatusClass = () => {
    if (status.includes("Loading") || status.includes("Downloading") || status.includes("Decrypting")) 
      return "status status-loading";
    if (status.includes("complete") || status.includes("Ready") || status.includes("success")) 
      return "status status-success";
    if (status.includes("failed") || status.includes("error") || status.includes("wrong password")) 
      return "status status-error";
    return "status";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="app-container">
      <div className="download-container">
        <div className="header">
          <h2>GuardianBox</h2>
          <p>Download and Decrypt Your Secure File</p>
        </div>

        <div className="metadata">
          <div className="metadata-item">
            <span className="metadata-label">File ID:</span>
            <span className="metadata-value">{fileId}</span>
          </div>
          
          {meta && (
            <>
              <div className="metadata-item">
                <span className="metadata-label">File Size:</span>
                <span className="metadata-value">{formatFileSize(meta.size)}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Uploaded:</span>
                <span className="metadata-value">{formatTimestamp(meta.uploaded_at)}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Expires:</span>
                <span className="metadata-value">{formatTimestamp(meta.expires_at)}</span>
              </div>
              {meta.downloads_remaining !== undefined && (
                <div className="metadata-item">
                  <span className="metadata-label">Downloads Remaining:</span>
                  <span className="metadata-value">{meta.downloads_remaining}</span>
                </div>
              )}
            </>
          )}
        </div>

        {status && (
          <div className={getStatusClass()}>
            {status}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Decryption Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter the password used for encryption..."
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          onClick={downloadAndDecrypt} 
          className="btn btn-primary"
          disabled={!password || status.includes("Loading")}
        >
          Download & Decrypt
        </button>

        {!meta && status.includes("Loading") && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid var(--border-color)',
              borderTop: '3px solid var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
