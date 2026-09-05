import React, { useState, useEffect } from 'react';

export default function IssueBookModal({
  isOpen,
  onClose,
  onIssue,
  books,
  presetBook,
  isSubmitting
}) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [formError, setFormError] = useState('');

  // Available books only
  const availableBooks = books.filter((b) => b.available_quantity > 0);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedBookId) {
      setFormError('Please select a book to issue');
      return;
    }
    if (!studentName.trim()) {
      setFormError('Student full name is required');
      return;
    }
    if (!studentId.trim()) {
      setFormError('Student ID / Roll Number is required');
      return;
    }

    onIssue({
      book_id: parseInt(selectedBookId, 10),
      student_name: studentName.trim(),
      student_id: studentId.trim()
    });
  };

  const currentSelectedBook = books.find((b) => b.id.toString() === selectedBookId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Issue Library Book to Student</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="modal-alert-error">
                ⚠️ {formError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="issue-book-select">Select Book to Issue *</label>
              <select
                id="issue-book-select"
                className="form-control"
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setFormError('');
                }}
              >
                {availableBooks.length === 0 ? (
                  <option value="">No books currently available</option>
                ) : (
                  availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} ({book.available_quantity} available) — ISBN: {book.isbn}
                    </option>
                  ))
                )}
              </select>
            </div>

            {currentSelectedBook && (
              <div className="book-preview-card">
                <div className="preview-label">Selected Title:</div>
                <div className="preview-title">{currentSelectedBook.title}</div>
                <div className="preview-meta">
                  Author: {currentSelectedBook.author} | Shelf Stock: <strong>{currentSelectedBook.available_quantity} copies left</strong>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="student-name">Student Full Name *</label>
              <input
                id="student-name"
                type="text"
                className="form-control"
                placeholder="e.g. Sarah Jenkins"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setFormError('');
                }}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-id">Student ID / Roll Number *</label>
              <input
                id="student-id"
                type="text"
                className="form-control"
                placeholder="e.g. NSCC-CS-2024-101"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setFormError('');
                }}
              />
              <span className="form-hint">Used for student identification and lending audit logs.</span>
            </div>

            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="text"
                className="form-control"
                value={new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                disabled
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || availableBooks.length === 0}
            >
              {isSubmitting ? 'Processing Issue...' : 'Confirm & Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
