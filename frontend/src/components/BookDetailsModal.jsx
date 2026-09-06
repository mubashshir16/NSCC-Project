import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../utils/formatDate';

export default function BookDetailsModal({
  isOpen,
  bookDetails,
  loading,
  onClose,
  onIssueThisBook,
  onEditThisBook,
  userRole = 'librarian'
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (bookDetails) {
      const qrPayload = JSON.stringify({
        id: bookDetails.id,
        isbn: bookDetails.isbn,
        title: bookDetails.title
      });
      QRCode.toDataURL(qrPayload, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.warn('QR code generation error:', err));
    } else {
      setQrDataUrl('');
    }
  }, [bookDetails]);

  const handleDownloadQr = () => {
    if (!qrDataUrl || !bookDetails) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${bookDetails.isbn || bookDetails.id}_${(bookDetails.title || 'book').slice(0, 15).replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handlePrintLabel = () => {
    if (!qrDataUrl || !bookDetails) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Book Shelf Label - ${bookDetails.title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
            .label-card { border: 2px dashed #0f172a; padding: 24px; text-align: center; border-radius: 12px; width: 260px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .label-badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px; }
            .label-title { font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #0f172a; line-height: 1.3; }
            .label-author { font-size: 12px; color: #64748b; margin-bottom: 12px; }
            .label-isbn { font-family: monospace; font-size: 11px; margin-top: 8px; color: #334155; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="label-badge">${bookDetails.category || 'General Collection'}</div>
            <div class="label-title">${bookDetails.title}</div>
            <div class="label-author">by ${bookDetails.author}</div>
            <img src="${qrDataUrl}" width="160" height="160" alt="QR Code" />
            <div class="label-isbn">ISBN: ${bookDetails.isbn || 'N/A'}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  const isStudent = userRole === 'student';

  const isAvailable = bookDetails && bookDetails.available_quantity > 0;
  const issuedCopies = bookDetails ? (bookDetails.quantity - bookDetails.available_quantity) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-large animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Specifications & Status</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading || !bookDetails ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading book record...</p>
            </div>
          ) : (
            <div className="book-details-content">
              <div className="book-details-hero">
                <div className="book-cover-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="book-hero-info">
                  <span className="category-pill">{bookDetails.category || 'General Collection'}</span>
                  <h2 className="book-details-title">{bookDetails.title}</h2>
                  <p className="book-details-author">Author: <strong>{bookDetails.author}</strong></p>
                  <p className="book-details-isbn">ISBN / Catalog ID: <code>{bookDetails.isbn}</code></p>
                </div>
              </div>

              {/* Stock Overview Cards */}
              <div className="details-metrics-row">
                <div className="detail-box">
                  <span className="detail-label">Total Purchased</span>
                  <span className="detail-number">{bookDetails.quantity}</span>
                </div>
                <div className="detail-box detail-box-success">
                  <span className="detail-label">Available on Shelf</span>
                  <span className="detail-number">{bookDetails.available_quantity}</span>
                </div>
                <div className="detail-box detail-box-warning">
                  <span className="detail-label">Currently Lent Out</span>
                  <span className="detail-number">{issuedCopies}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-label">Status</span>
                  <span className={`badge ${isAvailable ? 'badge-available' : 'badge-outofstock'}`}>
                    {isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Unique Book QR Code & Shelf Label (Librarian Tooling) */}
              <div className="book-qr-generation-card">
                <div className="book-qr-preview-box">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt={`QR Code for ${bookDetails.title}`} className="book-qr-image" />
                  ) : (
                    <div className="book-qr-loading">Generating QR Code...</div>
                  )}
                </div>
                <div className="book-qr-meta">
                  <div className="book-qr-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                      <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                      <rect x="3" y="15" width="6" height="6" rx="1"></rect>
                      <path d="M15 15h2v2h-2z"></path>
                    </svg>
                    <span>Unique Book QR Code</span>
                  </div>
                  <h4 className="book-qr-title">Circulation & Shelf Label</h4>
                  <p className="book-qr-desc">
                    Unique optical identifier encoded with Book ID, ISBN, and metadata. Scan with the mobile camera scanner or laptop search to issue or return this book instantly.
                  </p>
                  <div className="book-qr-actions-row">
                    <button
                      type="button"
                      className="btn-qr-download"
                      onClick={handleDownloadQr}
                      disabled={!qrDataUrl}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download QR (.png)</span>
                    </button>
                    <button
                      type="button"
                      className="btn-qr-print"
                      onClick={handlePrintLabel}
                      disabled={!qrDataUrl}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      <span>Print Shelf Sticker</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent lending history for this book */}
              <div className="book-history-section">
                <h4>Recent Lending History</h4>
                {bookDetails.recentTransactions && bookDetails.recentTransactions.length > 0 ? (
                  <table className="custom-table small-table">
                    <thead>
                      <tr>
                        <th>Tx ID</th>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Issue Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookDetails.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>#{tx.id}</td>
                          <td>{tx.student_name}</td>
                          <td><code>{tx.student_id}</code></td>
                          <td>{formatDate(tx.issue_date)}</td>
                          <td>{tx.return_date ? formatDate(tx.return_date) : '—'}</td>
                          <td>
                            <span className={`badge ${tx.status === 'issued' ? 'badge-issued' : 'badge-returned'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted text-sm">No transaction history recorded for this title.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {bookDetails && !isStudent && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onClose();
                onEditThisBook(bookDetails);
              }}
            >
              Edit Details
            </button>
          )}

          {bookDetails && (
            <button
              type="button"
              className="btn-primary"
              disabled={!isAvailable}
              onClick={() => {
                onClose();
                onIssueThisBook(bookDetails);
              }}
            >
              {isAvailable ? (isStudent ? 'Borrow This Book' : 'Issue This Book') : 'Out of Stock'}
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
