import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { decryptPackage } from "./crypto";
import "./styles.css";

export default function DownloadPage({ fileId }) {
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Use refs to track download state
  const autoDownloadEnabled = useRef(false);
  const downloadCompleted = useRef(false);
  const countdownRef = useRef(countdown);
  const autoDownloadStarted = useRef(false);
  const hasDecryptionFailed = useRef(false);

  const API_BASE = "https://localhost";

  // Keep ref in sync with countdown state
  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  // Formatters
  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleString();
  }, []);

  // Display metadata
  const metadataDisplay = useMemo(() => {
    if (!meta) return null;
    const items = [
      { label: "File Size", value: formatFileSize(meta.size) },
      { label: "Uploaded", value: formatTimestamp(meta.uploaded_at) },
      { label: "Expires", value: formatTimestamp(meta.expires_at) },
    ];
    if (meta.downloads_remaining !== undefined) {
      items.push({
        label: "Downloads Remaining",
        value: meta.downloads_remaining,
      });
    }
    return items;
  }, [meta, formatFileSize, formatTimestamp]);

  const statusClass = useMemo(() => {
    const s = status.toLowerCase();
    if (s.includes("loading") || s.includes("downloading") || s.includes("decrypting"))
      return "status status-loading";
    if (s.includes("complete") || s.includes("ready") || s.includes("success"))
      return "status status-success";
    if (s.includes("failed") || s.includes("error") || s.includes("wrong password"))
      return "status status-error";
    return "status";
  }, [status]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Check URL for password parameter - run only once on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPassword = urlParams.get("password");
    
    if (urlPassword) {
      setPassword(urlPassword);
      autoDownloadEnabled.current = true;
      
      // Remove password from URL for security
      urlParams.delete("password");
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Load metadata
  const loadMeta = useCallback(async () => {
    if (!fileId) {
      setStatus("Error: No file ID provided");
      return;
    }

    setIsLoading(true);
    setStatus("Loading file information...");

    try {
      const response = await fetch(`${API_BASE}/file/${fileId}`, {
        headers: { "ngrok-skip-browser-warning": "1" },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setMeta(data);
      
      if (data.expires_at && data.expires_at < Math.floor(Date.now() / 1000)) {
        setStatus("Error: This file has expired");
      } else if (data.downloads_remaining === 0) {
        setStatus("Error: No downloads remaining");
      } else {
        setStatus("Ready to download");
      }
    } catch (error) {
      console.error("Metadata load error:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // Auto-download logic - only trigger once
  useEffect(() => {
    if (autoDownloadEnabled.current && 
        meta && 
        password && 
        !isLoading && 
        !isDownloading &&
        !downloadCompleted.current &&
        countdown === 0 &&
        !autoDownloadStarted.current) {
      
      const isExpired = meta.expires_at && meta.expires_at < Math.floor(Date.now() / 1000);
      const noDownloadsRemaining = meta.downloads_remaining === 0;
      
      if (!isExpired && !noDownloadsRemaining) {
        autoDownloadStarted.current = true;
        setCountdown(5);
        setStatus("Auto-download starting in 5 seconds...");
      }
    }
  }, [meta, password, isLoading, isDownloading, countdown]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && autoDownloadEnabled.current && !isDownloading && !downloadCompleted.current && autoDownloadStarted.current) {
      handleAutoDownload();
    }
  }, [countdown, isDownloading]);

  // Unified download function for both auto and manual download
  const downloadFile = useCallback(async (isAutoDownload = false) => {
    if (!password.trim()) {
      setStatus("Error: Please enter the decryption password");
      return;
    }

    if (!meta) {
      setStatus("Error: File information not loaded");
      return;
    }

    if (meta.expires_at && meta.expires_at < Math.floor(Date.now() / 1000)) {
      setStatus("Error: This file has expired");
      return;
    }

    if (meta.downloads_remaining === 0) {
      setStatus("Error: No downloads remaining");
      return;
    }

    setIsDownloading(true);
    setStatus(isAutoDownload ? "Auto-downloading file..." : "Downloading encrypted file...");

    try {
      const response = await fetch(`${API_BASE}/file/${fileId}/download`, {
        headers: { "ngrok-skip-browser-warning": "1" },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Download failed" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      setStatus("Decrypting file...");
      
      const { filename, fileBlob } = await decryptPackage(blob, password);
      const url = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (isAutoDownload) {
        downloadCompleted.current = true;
        autoDownloadEnabled.current = false;
      }
      hasDecryptionFailed.current = false;
      setStatus("Download complete! File decrypted successfully.");
    } catch (error) {
      console.error("Download/decrypt error:", error);
      if (error.message.includes("Decryption failed") || error.message.includes("wrong password")) {
        setStatus("Error: Wrong password - please check and try again");
        hasDecryptionFailed.current = true;
      } else {
        setStatus(`Error: ${error.message}`);
      }
      // On error, disable auto-download to prevent loops
      if (isAutoDownload) {
        autoDownloadEnabled.current = false;
        autoDownloadStarted.current = false;
      }
    } finally {
      setIsDownloading(false);
    }
  }, [fileId, password, meta]);

  const handleAutoDownload = useCallback(async () => {
    await downloadFile(true);
  }, [downloadFile]);

  const downloadAndDecrypt = useCallback(async () => {
    await downloadFile(false);
  }, [downloadFile]);

  // Cancel auto-download - completely disable it
  const cancelAutoDownload = useCallback(() => {
    setCountdown(0);
    autoDownloadEnabled.current = false;
    autoDownloadStarted.current = false;
    setStatus("Auto-download cancelled. Click the button to download manually.");
  }, []);

  // Disable auto-download when user manually types password
  useEffect(() => {
    if (password && !autoDownloadEnabled.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlPassword = urlParams.get("password");
    
    // If user manually types a password different from URL password, disable auto-download
    if (urlPassword && password !== urlPassword) {
      autoDownloadEnabled.current = false;
      autoDownloadStarted.current = false;
      setCountdown(0);
    }
  }, [password]);

  // Reset failure flag when status changes to success
  useEffect(() => {
    if (status.includes("complete") || status.includes("success") || status.includes("ready")) {
      hasDecryptionFailed.current = false;
    }
  }, [status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && password && !isLoading && !isDownloading && countdownRef.current === 0) {
        downloadAndDecrypt();
      }
      if (e.key === "Escape" && countdownRef.current > 0) {
        cancelAutoDownload();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [password, isLoading, isDownloading, downloadAndDecrypt, cancelAutoDownload]);

  // Effects
  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const isActionDisabled = useMemo(() => 
    !password.trim() ||
    isLoading ||
    isDownloading ||
    countdown > 0 ||
    (status.includes("Error:") && 
     !status.includes("Wrong password") && 
     !status.includes("Decryption failed")) ||
    (meta && (meta.downloads_remaining === 0 || 
      (meta.expires_at && meta.expires_at < Math.floor(Date.now() / 1000))))
  , [password, isLoading, isDownloading, status, countdown, meta]);

  const buttonText = useMemo(() => {
    if (isDownloading) return "Processing...";
    if (isLoading) return "Loading...";
    if (countdown > 0) return `Auto-download in ${countdown}s`;
    if (hasDecryptionFailed.current) {
      return "Try Again";
    }
    return "Download & Decrypt";
  }, [isDownloading, isLoading, countdown, hasDecryptionFailed.current]);

  const displayStatus = useMemo(() => {
    if (hasDecryptionFailed.current && !isDownloading && !isLoading) {
      return "Error: Wrong password - please check and try again";
    }
    return status;
  }, [status, hasDecryptionFailed.current, isDownloading, isLoading]);

  return (
    <div className="app-container">
      <div className="download-container">
        <div className="header">
          <h2>GuardianBox</h2>
          <p>Download and Decrypt Your Secure File</p>
        </div>

        {/* Auto-download Countdown */}
        {countdown > 0 && (
          <div className="auto-download-banner">
            <div className="auto-download-content">
              <div className="auto-download-icon">⚡</div>
              <div className="auto-download-text">
                <strong>Auto-download Starting</strong>
                <p>Your file will download automatically in {countdown} seconds</p>
              </div>
              <button 
                onClick={cancelAutoDownload}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
            <div 
              className="auto-download-progress"
              style={{ width: `${(5 - countdown) * 20}%` }}
            />
          </div>
        )}

        {/* File Metadata */}
        <div className="metadata">
          <div className="metadata-item">
            <span className="metadata-label">File ID:</span>
            <span className="metadata-value" style={{ wordBreak: "break-all" }}>
              {fileId}
            </span>
          </div>
          
          {metadataDisplay?.map((item) => (
            <div key={item.label} className="metadata-item">
              <span className="metadata-label">{item.label}:</span>
              <span className="metadata-value">{item.value}</span>
            </div>
          ))}

          {!meta && isLoading && (
            <div className="metadata-item">
              <span className="metadata-label">Status:</span>
              <span className="metadata-value">Loading...</span>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {displayStatus && (
          <div className={statusClass}>
            {displayStatus}
            {(isLoading || isDownloading) && (
              <div style={{ marginTop: '8px' }}>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              </div>
            )}
          </div>
        )}

        {/* Password Input */}
        <div className="form-group">
          <label className="form-label">Decryption Password *</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter the password used for encryption..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isDownloading || countdown > 0}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle material-icons"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading || isDownloading || countdown > 0}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </button>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadAndDecrypt}
          className="btn btn-primary"
          disabled={isActionDisabled}
          style={{ 
            position: 'relative',
            opacity: isActionDisabled ? 0.6 : 1
          }}
        >
          {buttonText}
          {(isLoading || isDownloading) && (
            <div 
              style={{ 
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
        </button>

        {/* Help Text */}
        {countdown === 0 && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            💡 Press Enter to quickly download when password is entered
          </div>
        )}
      </div>
    </div>
  );
}
