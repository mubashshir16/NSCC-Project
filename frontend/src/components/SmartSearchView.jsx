import React, { useState } from 'react';

export default function SmartSearchView({
  books,
  categories,
  onIssueBookWithPreset,
  onViewBookDetails
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const defaultCategoryPills = [
    'All',
    'Programming',
    'Data Science',
    'AI/ML',
    'Networks',
    'OS',
    'Database'
  ];

  // Merge default categories with live database categories
  const allCategoryPills = Array.from(
    new Set([...defaultCategoryPills, ...categories])
  );

  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (book.category && book.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.category && book.category.toLowerCase().includes(q)) ||
      (book.isbn && book.isbn.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="smart-search-page animate-fade-in-up">
      <div className="search-page-header">
        <h2 className="page-heading">Search Books</h2>
        <p className="page-subtitle">
          Find books by title, author, category or use natural language search
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="smart-search-bar-wrap">
        <div className="smart-input-box">
          <svg className="smart-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="smart-search-input"
            placeholder="e.g. machine learning, database systems, Clean Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>&times;</button>
          )}
        </div>
        <button className="btn-smart-search-submit" onClick={() => {}}>
          Search
        </button>
      </div>

      {/* Category Pills Strip */}
      <div className="category-pills-row">
        {allCategoryPills.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              className={`cat-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Book Grid Cards */}
      {filteredBooks.length === 0 ? (
        <div className="clean-empty-state">
          <div className="empty-icon-circle bg-slate-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h4 className="empty-state-title">No matching books found</h4>
          <p className="empty-state-text">
            Try adjusting your search query or choosing another department category pill.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="catalog-cards-grid">
          {filteredBooks.map((book) => {
            const isAvailable = book.available_quantity > 0;
            return (
              <div key={book.id} className="catalog-book-card">
                <div className="catalog-cover-thumb" onClick={() => onViewBookDetails(book.id)}>
                  <div className="thumb-spine-accent"></div>
                  <div className="thumb-cover-text">
                    <span className="thumb-book-title">{book.title}</span>
                    <span className="thumb-book-author">{book.author}</span>
                  </div>
                </div>

                <div className="catalog-card-details">
                  <h4 className="catalog-card-title" onClick={() => onViewBookDetails(book.id)}>
                    {book.title}
                  </h4>
                  <p className="catalog-card-author">by {book.author}</p>
                  <span className="catalog-card-category">{book.category || 'General'}</span>

                  <div className="catalog-card-bottom">
                    <span className={`badge-pill ${isAvailable ? 'badge-pill-available' : 'badge-pill-outofstock'}`}>
                      {isAvailable ? `${book.available_quantity} Available` : 'Out of Stock'}
                    </span>

                    {isAvailable && onIssueBookWithPreset && (
                      <button
                        className="btn-card-borrow"
                        onClick={() => onIssueBookWithPreset(book)}
                      >
                        Borrow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
