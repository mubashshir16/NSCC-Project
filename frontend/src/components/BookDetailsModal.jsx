import React from 'react';
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
            <>
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

              <button
                type="button"
                className="btn-primary"
                disabled={!isAvailable}
                onClick={() => {
                  onClose();
                  onIssueThisBook(bookDetails);
                }}
              >
                {isAvailable ? 'Issue This Book' : 'Out of Stock'}
              </button>
            </>
          )}

          {isStudent && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: 'auto' }}>
              ℹ️ To borrow this book, please request it from the librarian at the front desk.
            </span>
          )}

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
