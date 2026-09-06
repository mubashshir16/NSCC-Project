import React, { useState } from 'react';

export default function ScanQRView({
  books,
  onIssueBookWithPreset,
  onReturnBook,
  onViewBookDetails,
  transactions = []
}) {
  const [manualBookId, setManualBookId] = useState('');
  const [scannedBook, setScannedBook] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Handle manual search by ID or ISBN
  const handleSearchManual = (e) => {
    e?.preventDefault();
    if (!manualBookId.trim()) return;

    const query = manualBookId.trim().toLowerCase();
    const found = books.find(
      (b) => String(b.id) === query || (b.isbn && b.isbn.toLowerCase().includes(query))
    );

    if (found) {
      setScannedBook(found);
      setScanMessage('');
    } else {
      setScanMessage(`No book found matching ID or ISBN: "${manualBookId}"`);
      setScannedBook(null);
    }
  };

  // Simulate scanning a book from camera
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanMessage('Accessing camera viewfinder & detecting QR code...');
    setTimeout(() => {
      setIsScanning(false);
      // Pick first or popular book like Clean Code or first in list
      const cleanCodeBook = books.find((b) => b.title.toLowerCase().includes('clean code')) || books[0];
      if (cleanCodeBook) {
        setScannedBook(cleanCodeBook);
        setScanMessage('');
      }
    }, 1200);
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
              <span>Back to Scan</span>
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
            </div>
          </div>
        </div>
      ) : (
        /* Screen 5: Scan QR Code View */
        <div className="scan-qr-container">
          <div className="scan-qr-header">
            <h2 className="scan-title">Scan QR Code</h2>
            <p className="scan-subtitle">Scan a book&apos;s QR code to view details, issue or return</p>
          </div>

          {/* Viewfinder Viewport Card */}
          <div className="scanner-viewfinder-card">
            <div className={`viewfinder-screen ${isScanning ? 'scanning-active' : ''}`}>
              {/* Corner Framing Brackets */}
              <div className="corner-bracket top-left"></div>
              <div className="corner-bracket top-right"></div>
              <div className="corner-bracket bottom-left"></div>
              <div className="corner-bracket bottom-right"></div>

              {/* Animated Laser Scanning Line */}
              <div className="scanner-laser-line"></div>

              {/* Mockup QR Target Inside */}
              <div className="mockup-qr-target">
                <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <line x1="14" y1="14" x2="14.01" y2="14"></line>
                  <line x1="17" y1="14" x2="20" y2="14"></line>
                  <line x1="14" y1="17" x2="17" y2="17"></line>
                  <line x1="14" y1="20" x2="20" y2="20"></line>
                </svg>
              </div>

              <div className="viewfinder-instruction">
                Align the QR code within the frame
              </div>
            </div>

            {/* Scanner Controls */}
            <div className="scanner-buttons-row">
              <button
                className="btn-scanner-action btn-camera"
                onClick={handleSimulateScan}
                disabled={isScanning}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>{isScanning ? 'Scanning...' : 'Scan From Camera'}</span>
              </button>

              <button
                className="btn-scanner-action btn-upload"
                onClick={handleSimulateScan}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Manual Input Search Fallback */}
          <div className="scan-manual-fallback">
            <span className="manual-label">Or enter Book ID manually</span>
            <form onSubmit={handleSearchManual} className="manual-search-form">
              <input
                type="text"
                className="manual-search-input"
                placeholder="Enter Book ID / ISBN (e.g. 1 or 9780132350884)"
                value={manualBookId}
                onChange={(e) => setManualBookId(e.target.value)}
              />
              <button type="submit" className="btn-manual-search">
                Search
              </button>
            </form>
            {scanMessage && <p className="scan-feedback-msg">{scanMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
