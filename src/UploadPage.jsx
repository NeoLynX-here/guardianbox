// UploadPage.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { encryptPackage } from "./crypto";
import "./styles.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expires, setExpires] = useState("");
  const [downloadLimit, setDownloadLimit] = useState("");
  const [status, setStatus] = useState("");
  const [link, setLink] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const linkRef = useRef(null);

  // Auto-scroll to link when it's generated
  useEffect(() => {
    if (link && linkRef.current) {
      linkRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Optional: Flash animation to draw attention
      linkRef.current.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.5)';
      setTimeout(() => {
        if (linkRef.current) {
          linkRef.current.style.boxShadow = 'none';
        }
      }, 2000);
    }
  }, [link]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    if (!password) return alert("Please enter a password");

    setStatus("Encrypting...");
    const encryptedBlob = await encryptPackage(file, file.name, password);

    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", new File([encryptedBlob], "cipher.enc"));
    if (expires) fd.append("expires_seconds", String(Number(expires)));
    if (downloadLimit) fd.append("download_limit", String(Number(downloadLimit)));

    try {
      const res = await fetch("https://candra-verificatory-nonspherically.ngrok-free.dev/upload", {
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
      setStatus("Upload complete! Scroll down to see your download link.");
    } catch (err) {
      console.error(err);
      setStatus("Upload error");
    }
  }

  const getStatusClass = () => {
    if (status.includes("Encrypting") || status.includes("Uploading")) return "status status-loading";
    if (status.includes("complete") || status.includes("Done")) return "status status-success";
    if (status.includes("failed") || status.includes("error")) return "status status-error";
    return "status";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(() => {
      // Show temporary success message
      const copyBtn = document.querySelector('.copy-btn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = 'var(--success)';
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
        }, 2000);
      }
    });
  };

  return (
    <div className="app-container">
      <div className="upload-container">
        <div className="header">
          <h2>GuardianBox</h2>
          <p>Secure File Sharing with End-to-End Encryption</p>
        </div>

        <form onSubmit={handleUpload}>
          {/* Drag and Drop Zone */}
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className="drop-zone-content">
              <div className="drop-zone-icon">📁</div>
              <div className="drop-zone-text">
                <h3>Drop your file here</h3>
                <p>or click to browse files</p>
                <p className="text-muted">Supports any file type</p>
              </div>
            </div>
          </div>

          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File Info */}
          {file && (
            <div className="file-info">
              <h4>Selected File:</h4>
              <p>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="form-group">
            <label className="form-label">Encryption Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter a strong password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expiration Time (seconds)</label>
            <input
              type="number"
              className="form-input"
              placeholder="86400 (24 hours default)"
              value={expires}
              onChange={e => setExpires(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Download Limit</label>
            <input
              type="number"
              className="form-input"
              placeholder="5 (default)"
              value={downloadLimit}
              onChange={e => setDownloadLimit(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Encrypt & Upload
          </button>
        </form>

        {/* Status and Link */}
        {status && (
          <div className={getStatusClass()}>
            {status}
          </div>
        )}

        {link && (
          <div ref={linkRef} className="share-link">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ color: 'var(--success)' }}>✅ Upload Successful!</strong>
              <button 
                onClick={copyToClipboard}
                className="btn btn-secondary copy-btn"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Copy Link
              </button>
            </div>
            <strong>Shareable Link:</strong>
            <br />
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
            <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              ⚠️ <strong>Important:</strong> Save this link now! You won't be able to access it again.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}