// UploadPage.jsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { encryptPackage } from "./crypto";
import "./styles.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [includePasswordInLink, setIncludePasswordInLink] = useState(false);
  const [expires, setExpires] = useState("");
  const [downloadLimit, setDownloadLimit] = useState("");
  const [status, setStatus] = useState("");
  const [fileId, setFileId] = useState(""); // Store the file ID separately
  const [link, setLink] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const linkRef = useRef(null);
  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Memoized file info
  const fileInfo = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type || 'Unknown'
    };
  }, [file]);

  // Generate link based on current state
  const generateLink = useCallback((id, includePass = includePasswordInLink) => {
    if (!id) return "";
    
    let url = `${window.location.origin}/download.html?id=${id}`;
    if (includePass && password) {
      url += `&password=${encodeURIComponent(password)}`;
    }
    return url;
  }, [includePasswordInLink, password]);

  // Update link when toggle or password changes
  useEffect(() => {
    if (fileId) {
      setLink(generateLink(fileId));
    }
  }, [fileId, includePasswordInLink, password, generateLink]);

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "None", color: "var(--text-muted)" };
    
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^a-zA-Z0-9]/.test(password),
    };

    // Calculate score
    if (requirements.length) score += 1;
    if (requirements.lowercase) score += 1;
    if (requirements.uppercase) score += 1;
    if (requirements.numbers) score += 1;
    if (requirements.symbols) score += 1;

    // Additional points for length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Cap score at 7
    score = Math.min(score, 7);

    // Determine strength level
    if (score === 0) return { score: 0, label: "None", color: "var(--text-muted)" };
    if (score <= 2) return { score, label: "Weak", color: "var(--error)" };
    if (score <= 4) return { score, label: "Fair", color: "var(--warning)" };
    if (score <= 6) return { score, label: "Good", color: "var(--success)" };
    return { score, label: "Strong", color: "var(--accent-primary)" };
  }, [password]);

  // Password requirements checklist
  const passwordRequirements = useMemo(() => [
    { id: 'length', text: 'At least 8 characters', met: password.length >= 8 },
    { id: 'lowercase', text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { id: 'uppercase', text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'numbers', text: 'Contains number', met: /[0-9]/.test(password) },
    { id: 'symbols', text: 'Contains symbol', met: /[^a-zA-Z0-9]/.test(password) },
  ], [password]);

  // Auto-scroll to link with animation
  useEffect(() => {
    if (link && linkRef.current) {
      linkRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      const element = linkRef.current;
      element.classList.add('share-link-highlight');
      const timer = setTimeout(() => {
        element.classList.remove('share-link-highlight');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [link]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
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
      // Basic file validation
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        setStatus("Error: File size must be less than 500MB");
        return;
      }
      setFile(selectedFile);
      setStatus(""); // Clear previous status
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Toggle include password in link
  const toggleIncludePasswordInLink = useCallback(() => {
    setIncludePasswordInLink(prev => !prev);
  }, []);

  // Upload handler with better error handling
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setStatus("Error: Please select a file");
      return;
    }
    
    if (!password) {
      setStatus("Error: Please enter a password");
      return;
    }

    if (password.length < 4) {
      setStatus("Error: Password must be at least 4 characters");
      return;
    }

    setIsUploading(true);
    setStatus("Encrypting...");

    try {
      // Encryption
      const encryptedBlob = await encryptPackage(file, file.name, password);

      // Upload
      setStatus("Uploading...");
      const formData = new FormData();
      formData.append("file", new File([encryptedBlob], "cipher.enc"));
      
      if (expires) formData.append("expires_seconds", String(Math.max(60, Number(expires))));
      if (downloadLimit) formData.append("download_limit", String(Math.max(1, Number(downloadLimit))));

      const response = await fetch("https://candra-verificatory-nonspherically.ngrok-free.dev/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      
      // Store file ID and generate initial link (without password by default)
      setFileId(data.id);
      const initialLink = generateLink(data.id, false); // Default: no password in link
      setLink(initialLink);
      setStatus("Upload complete! Your secure link is ready below.");
      
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Status class helper
  const getStatusClass = () => {
    if (status.includes("Encrypting") || status.includes("Uploading")) 
      return "status status-loading";
    if (status.includes("complete") || status.includes("ready")) 
      return "status status-success";
    if (status.includes("Error:") || status.includes("failed")) 
      return "status status-error";
    return "status";
  };

  // Copy to clipboard with feedback
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      
      // Visual feedback
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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
            onClick={triggerFileInput}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && triggerFileInput()}
          >
            <div className="drop-zone-content">
              <div className="drop-zone-icon">📁</div>
              <div className="drop-zone-text">
                <h3>Drop your file here</h3>
                <p>or click to browse files</p>
                <p className="text-muted">Max file size: 500MB</p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="*/*"
          />

          {/* File Info */}
          {fileInfo && (
            <div className="file-info">
              <h4>Selected File:</h4>
              <p>📄 {fileInfo.name} ({fileInfo.size} MB)</p>
            </div>
          )}

          {/* Password Field with Strength Meter */}
          <div className="form-group">
            <label className="form-label">Encryption Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter a strong password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={4}
                required
                style={{ paddingRight: '50px' }}
              />
              {/* Eye Toggle Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle material-icons"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div style={{ marginTop: '12px' }}>
                {/* Strength Bar */}
                <div style={{
                  display: 'flex',
                  height: '6px',
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  {[...Array(7)].map((_, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        height: '100%',
                        backgroundColor: index < passwordStrength.score ? passwordStrength.color : 'transparent',
                        margin: '0 1px',
                        borderRadius: '2px',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  ))}
                </div>
                
                {/* Strength Label */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  <span>Password strength: <strong style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </strong></span>
                  <span>{password.length} characters</span>
                </div>

                {/* Requirements Checklist */}
                <div style={{ marginTop: '8px' }}>
                  {passwordRequirements.map(req => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '11px',
                        color: req.met ? 'var(--success)' : 'var(--text-muted)',
                        marginBottom: '2px'
                      }}
                    >
                      <span style={{ marginRight: '6px' }}>
                        {req.met ? '✓' : '○'}
                      </span>
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Expiration Time (seconds)</label>
            <input
              type="number"
              className="form-input"
              placeholder="86400 (24 hours default)"
              value={expires}
              onChange={e => setExpires(e.target.value)}
              min="60"
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
              min="1"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isUploading || !file || !password}
          >
            {isUploading ? 'Processing...' : 'Encrypt & Upload'}
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
                type="button"
              >
                Copy Link
              </button>
            </div>

            {/* Include Password Toggle - Only shown after upload */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div className="toggle-container">
                <label className="toggle-label">
                  <span className="toggle-text">
                    <strong>Include password in shareable link</strong>
                    <span className="toggle-description">
                      When enabled, the password will be automatically filled on the download page
                    </span>
                  </span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={includePasswordInLink}
                      onChange={toggleIncludePasswordInLink}
                      className="toggle-input"
                      id="include-password-toggle"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                
                {/* Security Warning */}
                {includePasswordInLink && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(237, 137, 54, 0.1)',
                    border: '1px solid var(--warning)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--warning)'
                  }}>
                    ⚠️ <strong>Security Note:</strong> The password will be visible in the URL. 
                    Only use this for convenient sharing with trusted recipients.
                  </div>
                )}
              </div>
            </div>

            <strong>Shareable Link:</strong>
            <br />
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
              {link}
            </a>
            <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {includePasswordInLink ? (
                <>
                  🔗 <strong>Password included:</strong> Recipients won't need to enter the password manually.
                </>
              ) : (
                <>
                  ⚠️ <strong>Important:</strong> Share the password separately with recipients.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
