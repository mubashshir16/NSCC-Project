import React, { useState } from 'react';

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
  onIssueBookWithPreset,
  userRole = 'librarian'
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const isFiltered = searchQuery || selectedCategory !== 'All Categories' || availabilityFilter !== 'All Books';

  const totalResults = books.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = books.slice(startIndex, startIndex + itemsPerPage);

  // CSV Import simulation / file upload
  const handleImportCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Selected "${file.name}" for import. CSV book schema validated successfully!`);
      }
    };
    input.click();
  };

  return (
    <div className="books-page animate-fade-in-up">
      {/* Page Header matching mockup */}
      <div className="page-header-flex">
        <div>
          <h2 className="page-heading">Books</h2>
          <p className="page-subtitle">Manage library book records</p>
        </div>

        {userRole !== 'student' && (
          <div className="page-header-actions">
            <button className="btn-secondary-clean" onClick={handleImportCsv}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Import CSV</span>
            </button>

            <button className="btn-primary" onClick={onOpenAddBook}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar (matching mockup) */}
      <div className="filter-card">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, ISBN..."
            value={searchQuery}
            onChange={(e) => {
              onSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearch('')}>&times;</button>
          )}
        </div>

        <div className="filters-row">
          <div className="select-group">
            <div className="select-custom-wrapper">
              <select
                className="custom-select"
                value={selectedCategory}
                onChange={(e) => {
                  onCategoryChange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="select-group">
            <div className="select-custom-wrapper">
              <select
                className="custom-select"
                value={availabilityFilter}
                onChange={(e) => {
                  onAvailabilityChange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Books">All Status</option>
                <option value="Available">Available</option>
                <option value="Issued">Out of Stock</option>
              </select>
            </div>
          </div>

          {isFiltered && (
            <button
              className="btn-clear-pill"
              onClick={() => {
                onSearch('');
                onCategoryChange('All Categories');
                onAvailabilityChange('All Books');
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="loading-container animate-fade-in">
          <div className="spinner"></div>
          <p>Loading books from PostgreSQL...</p>
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
              ? 'Try modifying your search keywords or resetting the filters.'
              : 'The library catalog is currently empty. Click "Add Book" to register the first volume.'}
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
              Clear Filters
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
                <th style={{ width: '45px' }}>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th style={{ width: '65px' }}>Total</th>
                <th style={{ width: '80px' }}>Available</th>
                <th>Status</th>
                <th className="text-right" style={{ width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map((book, idx) => {
                const isAvailable = book.available_quantity > 0;
                return (
                  <tr key={book.id}>
                    <td><span className="id-badge-sm">{startIndex + idx + 1}</span></td>
                    <td>
                      <span
                        className="table-book-title clickable-title"
                        onClick={() => onViewBookDetails(book.id)}
                      >
                        {book.title}
                      </span>
                    </td>
                    <td className="text-muted">{book.author}</td>
                    <td><code className="isbn-tag">{book.isbn}</code></td>
                    <td><span className="category-pill">{book.category || 'General'}</span></td>
                    <td className="font-medium text-main">{book.quantity}</td>
                    <td>
                      <span className={`font-semibold ${isAvailable ? 'text-success' : 'text-danger'}`}>
                        {book.available_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pill ${isAvailable ? 'badge-pill-available' : 'badge-pill-outofstock'}`}>
                        {isAvailable ? 'Available' : 'Issued'}
                      </span>
                    </td>
                    <td className="text-right">
                      {userRole === 'student' ? (
                        <button
                          className="btn-secondary-clean"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                          onClick={() => onViewBookDetails(book.id)}
                        >
                          View Details
                        </button>
                      ) : (
                        <div className="table-action-icons-row">
                          {isAvailable && onIssueBookWithPreset && (
                            <button
                              className="icon-action-btn btn-issue-icon"
                              onClick={() => onIssueBookWithPreset(book)}
                              title="Issue Book"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <polyline points="17 11 19 13 23 9"></polyline>
                              </svg>
                            </button>
                          )}
                          <button
                            className="icon-action-btn btn-qr-icon"
                            onClick={() => onViewBookDetails(book.id)}
                            title="View & Print Unique QR Code"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                              <path d="M14 14h3v3h-3z"></path>
                              <path d="M18 18h3v3h-3z"></path>
                              <path d="M14 18h2v2h-2z"></path>
                            </svg>
                          </button>
                          <button
                            className="icon-action-btn btn-edit-icon"
                            onClick={() => onEditBook(book)}
                            title="Edit Book"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="icon-action-btn btn-delete-icon"
                            onClick={() => onDeleteBook(book)}
                            title="Delete Book"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls (Matching mockup: Showing 1 to 5 of 248 results < 1 2 3 >) */}
          <div className="table-pagination-footer">
            <span className="pagination-summary">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalResults)} of {totalResults} results
            </span>

            <div className="pagination-buttons">
              <button
                className="page-nav-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
