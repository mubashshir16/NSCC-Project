import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

export default function BookModal({
  isOpen,
  onClose,
  onSave,
  bookToEdit,
  isSubmitting
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1
  });
  const [formError, setFormError] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const quickCategories = [
    'Computer Science',
    'Artificial Intelligence',
    'Database Systems',
    'Software Engineering',
    'Mathematics'
  ];

  const handleAiSuggest = async () => {
    if (!formData.title.trim()) {
      setFormError('Please enter a book title first to suggest a category');
      return;
    }
    setIsAiSuggesting(true);
    setFormError('');
    try {
      const res = await api.aiSuggestCategory(formData.title, formData.author);
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          category: res.data.suggestedCategory
        }));
        setAiSuggestion(res.data);
      }
    } catch (e) {
      console.warn('AI categorization error:', e.message);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        isbn: bookToEdit.isbn || '',
        category: bookToEdit.category || '',
        quantity: bookToEdit.quantity || 1
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1
      });
    }
    setFormError('');
    setAiSuggestion(null);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || '' : value
    }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError('Book title is required');
      return;
    }
    if (!formData.author.trim()) {
      setFormError('Author name is required');
      return;
    }
    if (!formData.isbn.trim()) {
      setFormError('ISBN / Catalog ID is required');
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      setFormError('Total quantity must be at least 1 copy');
      return;
    }

    if (bookToEdit) {
      const issuedCopies = (bookToEdit.quantity || 0) - (bookToEdit.available_quantity || 0);
      if (formData.quantity < issuedCopies) {
        setFormError(`Total copies cannot be less than currently issued copies (${issuedCopies})`);
        return;
      }
    }

    onSave(formData);
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
                {bookToEdit ? (
                  <path d="M12 11l2 2 4-4"></path>
                ) : (
                  <>
                    <line x1="12" y1="8" x2="12" y2="14"></line>
                    <line x1="9" y1="11" x2="15" y2="11"></line>
                  </>
                )}
              </svg>
            </div>
            <div>
              <h3 className="modal-title">
                {bookToEdit ? 'Edit Book Specifications' : 'Add New Book Entry'}
              </h3>
              <p className="modal-subtitle">
                {bookToEdit ? 'Update library catalog record' : 'Register a new book into library database'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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

            {/* Book Title */}
            <div className="cool-form-group">
              <label htmlFor="book-title" className="cool-label">
                <span>Book Title <span className="req-asterisk">*</span></span>
              </label>
              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <input
                  id="book-title"
                  type="text"
                  name="title"
                  className="cool-input"
                  placeholder="e.g. Introduction to Algorithms, 4th Edition"
                  value={formData.title}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            </div>

            {/* Author */}
            <div className="cool-form-group">
              <label htmlFor="book-author" className="cool-label">
                <span>Author(s) <span className="req-asterisk">*</span></span>
              </label>
              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="book-author"
                  type="text"
                  name="author"
                  className="cool-input"
                  placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row: ISBN and Quantity */}
            <div className="cool-form-row">
              <div className="cool-form-group flex-1">
                <label htmlFor="book-isbn" className="cool-label">
                  <span>ISBN / Catalog ID <span className="req-asterisk">*</span></span>
                </label>
                <div className="cool-input-wrap">
                  <div className="cool-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                      <line x1="7" y1="8" x2="7" y2="16"></line>
                      <line x1="11" y1="8" x2="11" y2="16"></line>
                      <line x1="15" y1="8" x2="15" y2="16"></line>
                    </svg>
                  </div>
                  <input
                    id="book-isbn"
                    type="text"
                    name="isbn"
                    className="cool-input font-mono"
                    placeholder="e.g. 978-0262033848"
                    value={formData.isbn}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="cool-form-group width-130">
                <label htmlFor="book-quantity" className="cool-label">
                  <span>Copies <span className="req-asterisk">*</span></span>
                </label>
                <div className="cool-input-wrap">
                  <div className="cool-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </div>
                  <input
                    id="book-quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    className="cool-input"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Department / Category with AI Assist */}
            <div className="cool-form-group">
              <div className="label-with-action">
                <label htmlFor="book-category" className="cool-label">
                  <span>Department / Category</span>
                </label>
                <button
                  type="button"
                  className="btn-ai-sparkle-pill"
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting}
                  title="Use Gemini AI to categorize book"
                >
                  <span className="sparkle-rot">✨</span>
                  <span>{isAiSuggesting ? 'Analyzing Title...' : 'AI Suggest Category'}</span>
                </button>
              </div>

              <div className="cool-input-wrap">
                <div className="cool-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <input
                  id="book-category"
                  type="text"
                  name="category"
                  className="cool-input"
                  placeholder="e.g. Computer Science, Mathematics, Electrical..."
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              {/* Quick Category Suggestions */}
              <div className="quick-category-pills">
                {quickCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill-chip ${formData.category === cat ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {aiSuggestion && (
                <div className="ai-suggestion-badge-card animate-fade-in">
                  <div className="ai-badge-header">
                    <span>🤖 Gemini AI Recommendation</span>
                  </div>
                  <div className="ai-badge-body">
                    <span>Dewey Decimal: <code>{aiSuggestion.deweyCode}</code></span>
                    {aiSuggestion.tags && (
                      <span className="ai-tags-text">Tags: {aiSuggestion.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {bookToEdit && (
              <div className="edit-stock-status-alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Currently lent out to students: <strong>{(bookToEdit.quantity || 0) - (bookToEdit.available_quantity || 0)}</strong> copies.</span>
              </div>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner-mini"></div>
                  <span>Saving Book...</span>
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{bookToEdit ? 'Save Changes' : 'Register Book to Catalog'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
