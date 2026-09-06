import React, { useState, useRef, useEffect } from 'react';

export default function ScanQRView({
  books,
  onIssueBookWithPreset,
  onReturnBook,
  onViewBookDetails,
  transactions = [],
  userRole = 'librarian'
}) {
  // Detect if user is on mobile (< 768px)
  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;
  const [activeMode, setActiveMode] = useState(isMobileInitial ? 'camera' : 'manual');

  const [manualBookId, setManualBookId] = useState('');
  const [scannedBook, setScannedBook] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Stop camera stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start real camera stream
  const startCameraStream = async (mode = facingMode) => {
    stopCameraStream();
    setCameraError('');
    setScanMessage('Requesting camera access...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setScanMessage('Camera active. Align QR code within frame.');

      // Setup BarcodeDetector if natively supported
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  handleCodeFound(rawValue);
                }
              } catch {
                // frame detection error, ignore
              }
            }
          }, 350);
        } catch {
          // BarcodeDetector failed, fallback
        }
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access camera.');
      setIsCameraActive(false);
      setScanMessage('');
    }
  };

  // Switch between front and rear cameras
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCameraStream(nextMode);
    }
  };

  // Handle scanned or entered code
  const handleCodeFound = (codeText) => {
    if (!codeText) return;
    const clean = codeText.trim().toLowerCase();

    // Look for book by ID, ISBN, or title match
    const found = books.find(
      (b) =>
        String(b.id) === clean ||
        (b.isbn && b.isbn.toLowerCase().includes(clean)) ||
        (b.title && b.title.toLowerCase().includes(clean))
    );

    if (found) {
      stopCameraStream();
      setScannedBook(found);
      setScanMessage('');
    } else {
      setScanMessage(`Scanned code "${codeText}" does not match any registered book.`);
    }
  };

  // Handle manual search by ID or ISBN
  const handleSearchManual = (e) => {
    e?.preventDefault();
    if (!manualBookId.trim()) return;
    handleCodeFound(manualBookId);
  };

  // Simulate scanning a book from camera or test code
  const handleSimulateScan = (preferredBook = null) => {
    setScanMessage('Scanning test QR code...');
    setTimeout(() => {
      const target =
        preferredBook ||
        books.find((b) => b.title.toLowerCase().includes('clean code')) ||
        books[0];
      if (target) {
        stopCameraStream();
        setScannedBook(target);
        setScanMessage('');
      }
    }, 400);
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  // When switching modes, stop camera if leaving camera tab
  const switchMode = (mode) => {
    setActiveMode(mode);
    setScanMessage('');
    if (mode === 'camera' && !isCameraActive) {
      startCameraStream();
    } else if (mode === 'manual') {
      stopCameraStream();
    }
  };

  // Find active loan for this book if any exists
  const activeLoanForBook = scannedBook
    ? transactions.find((t) => t.book_id === scannedBook.id && t.status === 'issued')
    : null;

  return (
    <div className="scan-qr-page animate-fade-in-up">
      {scannedBook ? (
        /* Screen 6: Book Details & Issue/Return View */
        <div className="book-detail-issue-view">
          <div className="view-nav-header">
            <button className="btn-back-to-scan" onClick={() => setScannedBook(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Search / Scan</span>
            </button>
            <h2 className="view-title">Book Details &amp; Issue/Return</h2>
          </div>

          <div className="book-scanned-card">
            <div className="scanned-book-cover-col">
              <div className="mockup-book-cover">
                <div className="cover-spine-accent"></div>
                <div className="cover-title-area">
                  <h4>{scannedBook.title}</h4>
                  <p>{scannedBook.author}</p>
                </div>
                <div className="cover-galaxy-graphic"></div>
              </div>
              <button
                className="btn-view-full-details"
                onClick={() => onViewBookDetails(scannedBook.id)}
              >
                View Full Details
              </button>
            </div>

            <div className="scanned-book-info-col">
              <h3 className="scanned-main-title">{scannedBook.title}</h3>

              <div className="specs-table-grid">
                <div className="spec-row">
                  <span className="spec-label">Author</span>
                  <span className="spec-value">{scannedBook.author}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">ISBN</span>
                  <span className="spec-value font-mono">{scannedBook.isbn}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{scannedBook.category || 'General'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Total Copies</span>
                  <span className="spec-value">{scannedBook.quantity}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Available Copies</span>
                  <span className="spec-value font-bold text-success">{scannedBook.available_quantity}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Status</span>
                  <span className="spec-value">
                    <span className={`badge-pill ${scannedBook.available_quantity > 0 ? 'badge-pill-available' : 'badge-pill-outofstock'}`}>
                      {scannedBook.available_quantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </span>
                </div>
              </div>

              {userRole === 'student' ? (
                <div className="student-scanned-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: scannedBook.available_quantity > 0 ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${scannedBook.available_quantity > 0 ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    color: scannedBook.available_quantity > 0 ? '#15803d' : '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{scannedBook.available_quantity > 0 ? '✅ Available on shelf' : '⚠️ All copies lent out'}</span>
                    <span style={{ color: '#475569' }}>— Visit the front circulation desk to borrow this book.</span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', height: '42px' }}
                    onClick={() => onViewBookDetails(scannedBook.id)}
                  >
                    View Full Book Specifications
                  </button>
                </div>
              ) : (
                <div className="scanned-actions-row">
                  <button
                    className="btn-issue-primary-lg"
                    disabled={scannedBook.available_quantity <= 0}
                    onClick={() => onIssueBookWithPreset(scannedBook)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                    <span>Issue Book</span>
                  </button>

                  <button
                    className="btn-return-secondary-lg"
                    onClick={() => {
                      if (activeLoanForBook) {
                        onReturnBook(activeLoanForBook.id);
                      } else {
                        alert(`No active loan record currently pending return for "${scannedBook.title}". All copies are accounted for or ready on shelves.`);
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span>Return Book</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Screen 5: Search & Scan Landing */
        <div className="scan-qr-container">
          {/* Mode Switcher: Laptop vs Mobile */}
          <div className="scan-mode-tabs">
            <button
              className={`scan-mode-tab ${activeMode === 'manual' ? 'active' : ''}`}
              onClick={() => switchMode('manual')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>Manual Book Search (Laptop / Desktop)</span>
            </button>

            <button
              className={`scan-mode-tab ${activeMode === 'camera' ? 'active' : ''}`}
              onClick={() => switchMode('camera')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <span>Mobile QR Camera Scanner</span>
            </button>
          </div>

          {activeMode === 'manual' ? (
            /* Laptop / Desktop Mode */
            <div className="laptop-search-card animate-fade-in">
              <div className="laptop-card-header">
                <div className="device-mode-badge">
                  <span className="badge-dot-blue"></span>
                  <span>💻 Laptop / Desktop Optimized</span>
                </div>
                <h3 className="laptop-card-title">Book Search &amp; Circulation Lookup</h3>
                <p className="laptop-card-desc">
                  On laptops and PCs without mobile rear cameras, search books instantly by Book ID, ISBN, or Title to issue or return.
                </p>
              </div>

              <form onSubmit={handleSearchManual} className="laptop-search-form">
                <div className="search-input-field-wrap">
                  <svg className="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="laptop-search-input"
                    placeholder="Enter Book ID, ISBN, or Title (e.g. 1, 9780132350884, or Clean Code)..."
                    value={manualBookId}
                    onChange={(e) => setManualBookId(e.target.value)}
                    autoFocus
                  />
                  {manualBookId && (
                    <button type="button" className="clear-btn-mini" onClick={() => setManualBookId('')}>
                      &times;
                    </button>
                  )}
                </div>
                <button type="submit" className="btn-laptop-search">
                  Search &amp; Open
                </button>
              </form>

              {scanMessage && <p className="scan-feedback-msg">{scanMessage}</p>}

              {/* Quick Book Pickers for Desktop */}
              <div className="laptop-quick-pickers">
                <span className="quick-pickers-label">Quick select from database catalog:</span>
                <div className="quick-books-chip-grid">
                  {books.slice(0, 5).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className="quick-book-chip"
                      onClick={() => setScannedBook(b)}
                    >
                      <span className="chip-book-title">{b.title}</span>
                      <span className="chip-book-stock">({b.available_quantity} available)</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="laptop-footer-hint">
                <span>Want to test camera scanning on this device?</span>
                <button type="button" className="link-switch-cam" onClick={() => switchMode('camera')}>
                  Switch to Camera Scanner &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Mobile QR Camera Scanner Mode */
            <div className="scanner-viewfinder-card animate-fade-in">
              <div className="mobile-cam-header">
                <div className="device-mode-badge badge-green">
                  <span className="badge-dot-green"></span>
                  <span>📱 Mobile Camera Active</span>
                </div>
                <h3 className="mobile-cam-title">Scan Book QR Code</h3>
                <p className="mobile-cam-desc">Point your phone camera at a book&apos;s QR code to scan directly.</p>
              </div>

              {/* Viewfinder Frame with Real Video & Animation */}
              <div className={`viewfinder-screen ${isCameraActive ? 'camera-streaming' : ''}`}>
                {/* Real Live Video Stream Element */}
                <video
                  ref={videoRef}
                  className="camera-live-video"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Corner Framing Brackets */}
                <div className="corner-bracket top-left"></div>
                <div className="corner-bracket top-right"></div>
                <div className="corner-bracket bottom-left"></div>
                <div className="corner-bracket bottom-right"></div>

                {/* Animated Laser Scanning Line */}
                <div className="scanner-laser-line"></div>

                {/* Placeholder graphic if camera is not yet playing */}
                {!isCameraActive && (
                  <div className="mockup-qr-target">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                      <line x1="14" y1="14" x2="14.01" y2="14"></line>
                      <line x1="17" y1="14" x2="20" y2="14"></line>
                    </svg>
                  </div>
                )}

                <div className="viewfinder-instruction">
                  {isCameraActive ? 'Align QR code in center frame' : 'Camera ready to start'}
                </div>
              </div>

              {cameraError && (
                <div className="camera-error-banner">
                  <span>⚠️ {cameraError}</span>
                  <small>Make sure camera permissions are enabled in browser settings.</small>
                </div>
              )}

              {scanMessage && <p className="scan-feedback-msg">{scanMessage}</p>}

              {/* Camera Action Buttons */}
              <div className="scanner-buttons-row">
                {!isCameraActive ? (
                  <button
                    className="btn-scanner-action btn-camera"
                    onClick={() => startCameraStream()}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-scanner-action btn-secondary"
                      onClick={toggleCameraFacing}
                      title="Switch between front and rear cameras"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 16l4-4-4-4"></path>
                        <path d="M4 8l-4 4 4 4"></path>
                        <path d="M4 12h16"></path>
                      </svg>
                      <span>Flip Camera</span>
                    </button>
                    <button
                      className="btn-scanner-action btn-danger"
                      onClick={stopCameraStream}
                    >
                      <span>Stop Camera</span>
                    </button>
                  </>
                )}

                {/* Instant Test Scan Button */}
                <button
                  className="btn-scanner-action btn-upload"
                  onClick={() => handleSimulateScan()}
                  title="Test scanning without physical QR code"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span>Test Sample Scan</span>
                </button>
              </div>

              {/* Manual search fallback within mobile tab */}
              <div className="scan-manual-fallback">
                <span className="manual-label">Or enter Book ID manually:</span>
                <form onSubmit={handleSearchManual} className="manual-search-form">
                  <input
                    type="text"
                    className="manual-search-input"
                    placeholder="Enter Book ID / ISBN..."
                    value={manualBookId}
                    onChange={(e) => setManualBookId(e.target.value)}
                  />
                  <button type="submit" className="btn-manual-search">
                    Search
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
