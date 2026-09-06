import React, { useState, useEffect } from 'react';

export default function IssueBookModal({
  isOpen,
  onClose,
  onIssue,
  books = [],
  presetBook = null,
  isSubmitting = false
}) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [formError, setFormError] = useState('');

  // Available books with stock > 0
  const availableBooks = books.filter((b) => b.available_quantity > 0);

  // Quick fill student samples for rapid entry / testing
  const quickStudents = [
    { name: 'Sarah Jenkins', id: 'NSCC-CS-2024-101' },
    { name: 'Rahul Sharma', id: 'NSCC-CS-2024-042' },
    { name: 'Aarav Mehta', id: 'NSCC-EC-2024-088' },
    { name: 'Priya Nair', id: 'NSCC-IT-2024-019' }
  ];

  // Calculate 14-day standard lending period
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14);

  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    if (presetBook) {
      setSelectedBookId(presetBook.id.toString());
    } else if (availableBooks.length > 0) {
      setSelectedBookId(availableBooks[0].id.toString());
    } else {
      setSelectedBookId('');
    }
    setStudentName('');
    setStudentId('');
    setFormError('');
  }, [presetBook, isOpen]);

  if (!isOpen) return null;

  const currentSelectedBook = books.find((b) => b.id.toString() === selectedBookId);

  const handleQuickFill = (student) => {
    setStudentName(student.name);
    setStudentId(student.id);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedBookId) {
      setFormError('Please select an available book to issue.');
      return;
    }
    if (!studentName.trim()) {
      setFormError('Student full name is required.');
      return;
    }
    if (!studentId.trim()) {
      setFormError('Student ID / Roll number is required.');
      return;
    }

    onIssue({
      book_id: parseInt(selectedBookId, 10),
      student_name: studentName.trim(),
      student_id: studentId.trim()
    });
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-dialog animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="12" y1="6" x2="12" y2="12"></line>
                <polyline points="9 9 12 12 15 9"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="modal-title">Issue Book Entry</h3>
              <p className="modal-subtitle">Assign library copy to a registered student</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {formError && (
              <div className="modal-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Book Selector */}
            <div className="cool-form-group">
              <label htmlFor="issue-book-select" className="cool-label">
                <span>Select Book from Catalog <span className="req-asterisk">*</span></span>
                <span className="label-badge-info">{availableBooks.length} titles in stock</span>
              </label>
              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <select
                  id="issue-book-select"
                  className="cool-select"
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(e.target.value);
                    setFormError('');
                  }}
                >
                  {availableBooks.length === 0 ? (
                    <option value="">No books currently in stock</option>
                  ) : (
                    availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.available_quantity} available) — ISBN: {book.isbn}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Selected Book High-End Preview Card */}
            {currentSelectedBook && (
              <div className="book-preview-card">
                <div className="preview-card-spine"></div>
                <div className="preview-card-content">
                  <div className="preview-top-row">
                    <span className="preview-tag-badge">Selected Title</span>
                    <span className="preview-stock-badge">
                      <span className="stock-dot-green"></span>
                      {currentSelectedBook.available_quantity} copies available
                    </span>
                  </div>
                  <h4 className="preview-book-title">{currentSelectedBook.title}</h4>
                  <div className="preview-meta-row">
                    <span className="preview-author-text">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {currentSelectedBook.author}
                    </span>
                    <span className="preview-isbn-text">
                      ISBN: <code>{currentSelectedBook.isbn}</code>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Student Full Name */}
            <div className="cool-form-group">
              <label htmlFor="student-name" className="cool-label">
                <span>Student Full Name <span className="req-asterisk">*</span></span>
              </label>
              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="student-name"
                  type="text"
                  className="cool-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setFormError('');
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* 3. Student ID / Roll Number */}
            <div className="cool-form-group">
              <label htmlFor="student-id" className="cool-label">
                <span>Student ID / Roll Number <span className="req-asterisk">*</span></span>
              </label>
              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <line x1="7" y1="8" x2="13" y2="8"></line>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="16" x2="11" y2="16"></line>
                  </svg>
                </div>
                <input
                  id="student-id"
                  type="text"
                  className="cool-input"
                  placeholder="e.g. NSCC-CS-2024-101"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setFormError('');
                  }}
                />
              </div>
              <span className="cool-form-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Used for borrower records, return receipts, and circulation logs.
              </span>
            </div>

            {/* Quick Fill Chips */}
            <div className="quick-fill-container">
              <span className="quick-fill-label">⚡ Quick Fill Student Demo:</span>
              <div className="quick-fill-chips-row">
                {quickStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className="quick-fill-chip"
                    onClick={() => handleQuickFill(st)}
                  >
                    <span>{st.name}</span>
                    <small>({st.id})</small>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Issue & Due Date Card */}
            <div className="lending-timeline-card">
              <div className="timeline-item">
                <div className="timeline-icon-wrap icon-issue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="timeline-text">
                  <span className="timeline-title">Issue Date</span>
                  <span className="timeline-date">{formattedToday}</span>
                </div>
              </div>

              <div className="timeline-divider">
                <span className="timeline-duration-badge">14 Days Loan</span>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon-wrap icon-due">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="timeline-text">
                  <span className="timeline-title">Scheduled Return Due</span>
                  <span className="timeline-date timeline-date-due">{formattedDueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-confirm"
              disabled={isSubmitting || availableBooks.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner-mini"></div>
                  <span>Issuing Book...</span>
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Confirm &amp; Issue Book</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
