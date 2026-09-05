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
      setFormError('ISBN is required');
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      setFormError('Total quantity must be at least 1');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{bookToEdit ? 'Edit Book Details' : 'Add New Book to Library'}</h3>
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
              <label htmlFor="book-title">Book Title *</label>
              <input
                id="book-title"
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Introduction to Algorithms"
                value={formData.title}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-author">Author(s) *</label>
              <input
                id="book-author"
                type="text"
                name="author"
                className="form-control"
                placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                value={formData.author}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="book-isbn">ISBN / Catalog ID *</label>
                <input
                  id="book-isbn"
                  type="text"
                  name="isbn"
                  className="form-control"
                  placeholder="e.g. 978-0262033848"
                  value={formData.isbn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="book-quantity">Total Copies *</label>
                <input
                  id="book-quantity"
                  type="number"
                  name="quantity"
                  min="1"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="book-category">Department / Category</label>
                <button
                  type="button"
                  className="btn-ai-inline"
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting}
                  title="Use AI to automatically suggest category based on book title"
                >
                  {isAiSuggesting ? '🤖 Analyzing Title...' : '✨ AI Suggest Category'}
                </button>
              </div>
              <input
                id="book-category"
                type="text"
                name="category"
                className="form-control"
                placeholder="e.g. Computer Science, Electronics, Mathematics"
                value={formData.category}
                onChange={handleChange}
              />
              {aiSuggestion && (
                <div className="ai-suggestion-preview">
                  <span>💡 Suggested Dewey Code: <code>{aiSuggestion.deweyCode}</code></span>
                  {aiSuggestion.tags && (
                    <span className="tags-hint">Tags: {aiSuggestion.tags.join(', ')}</span>
                  )}
                </div>
              )}
            </div>

            {bookToEdit && (
              <div className="edit-stock-note">
                ℹ️ Currently issued to students: <strong>{(bookToEdit.quantity || 0) - (bookToEdit.available_quantity || 0)}</strong> copy/copies.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (bookToEdit ? 'Save Changes' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
