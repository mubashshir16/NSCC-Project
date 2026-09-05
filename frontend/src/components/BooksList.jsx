import React from 'react';

export default function BooksList({
  books,
  categories,
  loading,
  onSearch,
  searchQuery,
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  onOpenAddBook,
  onViewBookDetails,
  onEditBook,
  onDeleteBook,
  onIssueBookWithPreset
}) {
  const isFiltered = searchQuery || selectedCategory !== 'All Categories' || availabilityFilter !== 'All Books';

  return (
    <div className="books-page animate-fade-in-up">
      {/* Header section */}
      <div className="page-header-flex">
        <div>
          <div className="page-badge-row">
            <span className="page-section-pill">CATALOG ARCHIVE</span>
          </div>
          <h2 className="page-heading">Library Books Collection</h2>
          <p className="page-subtitle">Inspect book specifications, monitor shelf quantities, and issue textbook loans.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary btn-add-book-main" onClick={onOpenAddBook}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="filter-card">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Title, Author, ISBN or Category..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearch('')} title="Clear search text">&times;</button>
          )}
        </div>

        <div className="filters-row">
          <div className="select-group">
            <label htmlFor="categoryFilter" className="filter-label">Category</label>
            <div className="select-custom-wrapper">
              <select
                id="categoryFilter"
                className="custom-select"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="select-group">
            <label htmlFor="availabilityFilter" className="filter-label">Stock Status</label>
            <div className="select-custom-wrapper">
              <select
                id="availabilityFilter"
                className="custom-select"
                value={availabilityFilter}
                onChange={(e) => onAvailabilityChange(e.target.value)}
              >
                <option value="All Books">All Stock</option>
                <option value="Available">Available Only (&gt; 0)</option>
                <option value="Issued">Out of Stock (0 Left)</option>
              </select>
            </div>
          </div>

          {isFiltered && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                onSearch('');
                onCategoryChange('All Categories');
                onAvailabilityChange('All Books');
              }}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Books Table Container */}
      {loading ? (
        <div className="loading-container animate-fade-in">
          <div className="spinner"></div>
          <p>Loading books catalog from PostgreSQL...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="clean-empty-state">
          <div className="empty-icon-circle bg-slate-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h4 className="empty-state-title">No books match your criteria</h4>
          <p className="empty-state-text">
            {isFiltered
              ? 'Try modifying your search keywords or resetting the department category filter.'
              : 'The library catalog is currently empty. Click "Add New Book" to register the first volume.'}
          </p>
          {isFiltered ? (
            <button
              className="btn-secondary"
              onClick={() => {
                onSearch('');
                onCategoryChange('All Categories');
                onAvailabilityChange('All Books');
              }}
            >
              Reset All Filters
            </button>
          ) : (
            <button className="btn-primary" onClick={onOpenAddBook}>
              Add First Book
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '65px' }}>ID</th>
                <th>Title &amp; Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th style={{ width: '80px' }}>Total</th>
                <th style={{ width: '90px' }}>Available</th>
                <th>Availability</th>
                <th className="text-right" style={{ minWidth: '240px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const isAvailable = book.available_quantity > 0;
                return (
                  <tr key={book.id}>
                    <td><span className="id-badge">#{book.id}</span></td>
                    <td>
                      <div className="book-title-cell">
                        <span className="table-book-title">{book.title}</span>
                        <span className="table-book-author">by {book.author}</span>
                      </div>
                    </td>
                    <td><code className="isbn-tag">{book.isbn}</code></td>
                    <td>
                      <span className="category-pill">{book.category || 'General'}</span>
                    </td>
                    <td className="font-semibold text-main">{book.quantity}</td>
                    <td>
                      <span className={`font-semibold ${isAvailable ? 'text-success' : 'text-danger'}`}>
                        {book.available_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pill ${isAvailable ? 'badge-pill-available' : 'badge-pill-outofstock'}`}>
                        {isAvailable ? `${book.available_quantity} In Stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions-group">
                        <button
                          className="btn-action-detail"
                          onClick={() => onViewBookDetails(book.id)}
                          title="View Book Details"
                        >
                          Details
                        </button>
                        <button
                          className="btn-action-issue-book"
                          disabled={!isAvailable}
                          onClick={() => onIssueBookWithPreset(book)}
                          title={isAvailable ? "Issue this book copy to a student" : "Book is currently out of stock"}
                        >
                          Issue
                        </button>
                        <button
                          className="btn-action-edit"
                          onClick={() => onEditBook(book)}
                          title="Edit Book Information"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action-delete"
                          onClick={() => onDeleteBook(book)}
                          title="Delete Book Record"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-footer-info">
            Showing {books.length} book title(s) in catalog
          </div>
        </div>
      )}
    </div>
  );
}

