import React from 'react';
import { formatDate } from '../utils/formatDate';

export default function TransactionsList({
  transactions,
  loading,
  stats,
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearch,
  onReturnBook,
  onOpenIssueBook,
  onExportCsv,
  userRole = 'librarian'
}) {
  const isStudent = userRole === 'student';
  const isFiltered = searchQuery || statusFilter !== 'all';

  return (
    <div className="transactions-page animate-fade-in-up">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <div className="page-badge-row">
            <span className="page-section-pill">CIRCULATION LEDGER</span>
          </div>
          <h2 className="page-heading">Circulation &amp; Lending History</h2>
          <p className="page-subtitle">Audit active book loans, due dates, student checkouts, and generate export reports.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary btn-export-top" onClick={onExportCsv} title="Download CSV Circulation Log">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export CSV</span>
          </button>

          {!isStudent && (
            <button className="btn-primary" onClick={onOpenIssueBook}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
              <span>Issue Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Student Name, Student ID, Book Title, or ISBN..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearch('')} title="Clear search text">&times;</button>
          )}
        </div>

        <div className="filters-row">
          <div className="segmented-tabs-group" role="tablist">
            <button
              className={`segmented-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => onStatusChange('all')}
              role="tab"
              aria-selected={statusFilter === 'all'}
            >
              <svg className="tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>All Records</span>
              {stats?.totalTransactions !== undefined && (
                <span className="tab-counter-badge">{stats.totalTransactions}</span>
              )}
            </button>

            <button
              className={`segmented-tab tab-issued ${statusFilter === 'issued' ? 'active' : ''}`}
              onClick={() => onStatusChange('issued')}
              role="tab"
              aria-selected={statusFilter === 'issued'}
            >
              <svg className="tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Active Loans</span>
              {stats?.activeIssues !== undefined && (
                <span className="tab-counter-badge">{stats.activeIssues}</span>
              )}
            </button>

            <button
              className={`segmented-tab tab-overdue ${statusFilter === 'overdue' ? 'active' : ''}`}
              onClick={() => onStatusChange('overdue')}
              role="tab"
              aria-selected={statusFilter === 'overdue'}
            >
              <svg className="tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Overdue</span>
              {stats?.overdueCount > 0 && <span className="tab-pulse-dot" title="Overdue books requiring action" />}
              {stats?.overdueCount !== undefined && (
                <span className="tab-counter-badge">{stats.overdueCount}</span>
              )}
            </button>

            <button
              className={`segmented-tab tab-returned ${statusFilter === 'returned' ? 'active' : ''}`}
              onClick={() => onStatusChange('returned')}
              role="tab"
              aria-selected={statusFilter === 'returned'}
            >
              <svg className="tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Returned</span>
              {stats?.totalReturned !== undefined && (
                <span className="tab-counter-badge">{stats.totalReturned}</span>
              )}
            </button>
          </div>

          {isFiltered && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                onSearch('');
                onStatusChange('all');
              }}
              title="Reset search and filters"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Container */}
      {loading ? (
        <div className="loading-container animate-fade-in">
          <div className="spinner"></div>
          <p>Loading circulation history...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="clean-empty-state">
          <div className="empty-icon-circle bg-slate-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h4 className="empty-state-title">No transactions found</h4>
          <p className="empty-state-text">
            {isFiltered
              ? 'No transaction records match your search criteria. Try modifying your search or reset filters.'
              : 'No circulation transactions have been recorded yet.'}
          </p>
          {isFiltered && (
            <button
              className="btn-secondary"
              onClick={() => {
                onSearch('');
                onStatusChange('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '65px' }}>Tx ID</th>
                <th>Book Details</th>
                <th>Borrower Student</th>
                <th>Issued Date</th>
                <th>Due Date (14d)</th>
                <th>Returned Date</th>
                <th>Status &amp; Overdue</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isIssued = tx.status === 'issued';
                const isOverdue = tx.is_overdue || (tx.days_overdue && tx.days_overdue > 0);

                return (
                  <tr key={tx.id} className={isIssued && isOverdue ? 'row-overdue' : ''}>
                    <td><span className="id-badge">#{tx.id}</span></td>
                    <td>
                      <div className="book-title-cell">
                        <span className="table-book-title">{tx.book_title || `Book #${tx.book_id}`}</span>
                        {tx.isbn ? (
                          <span className="table-book-isbn">ISBN: {tx.isbn}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="borrower-cell">
                        <span className="borrower-name">{tx.student_name}</span>
                        <span className="borrower-id-tag">{tx.student_id}</span>
                      </div>
                    </td>
                    <td className="text-muted">{formatDate(tx.issue_date)}</td>
                    <td>
                      <span className="due-date-text">
                        {tx.due_date ? formatDate(tx.due_date) : '—'}
                      </span>
                    </td>
                    <td>
                      {tx.return_date ? (
                        <span className="text-muted">{formatDate(tx.return_date)}</span>
                      ) : (
                        <span className="pending-badge">Pending Return</span>
                      )}
                    </td>
                    <td>
                      {isIssued ? (
                        isOverdue ? (
                          <span className="badge-pill badge-pill-overdue animate-pulse">
                            ⚠️ {tx.days_overdue}d Overdue
                          </span>
                        ) : (
                          <span className="badge-pill badge-pill-active">
                            ● Active Loan
                          </span>
                        )
                      ) : (
                        <span className="badge-pill badge-pill-returned">
                          ✓ Returned
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {isIssued ? (
                        <button
                          className="btn-return-online-sm"
                          onClick={() => onReturnBook(tx.id, tx.book_title)}
                          title={isStudent ? "Return this book online" : "Process Book Return"}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                          </svg>
                          <span>{isStudent ? 'Return Online' : 'Return Book'}</span>
                        </button>
                      ) : (
                        <span className="badge-pill-completed">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-footer-info">
            Showing {transactions.length} circulation record(s)
          </div>
        </div>
      )}
    </div>
  );
}

