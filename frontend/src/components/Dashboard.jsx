import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

export default function Dashboard({
  stats,
  loading,
  isBackendOnline = true,
  onNavigate,
  onOpenAddBook,
  onOpenIssueBook,
  onReturnBook,
  onExportCsv,
  onOpenAi
}) {
  const [activeLoanSearch, setActiveLoanSearch] = useState('');

  if (loading && !stats) {
    return (
      <div className="loading-container animate-fade-in">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard overview...</p>
      </div>
    );
  }

  const {
    totalTitles = 0,
    totalBooks = 0,
    availableBooks = 0,
    issuedBooks = 0,
    activeIssues = 0,
    overdueCount = 0,
    totalTransactions = 0,
    uniqueStudents = 0,
    activeLoans = [],
    recentActivity = []
  } = stats || {};

  // Filter active loans by student name, student ID, or book title
  const filteredActiveLoans = activeLoans.filter((loan) => {
    if (!activeLoanSearch.trim()) return true;
    const q = activeLoanSearch.toLowerCase();
    return (
      (loan.student_name && loan.student_name.toLowerCase().includes(q)) ||
      (loan.student_id && loan.student_id.toLowerCase().includes(q)) ||
      (loan.book_title && loan.book_title.toLowerCase().includes(q)) ||
      (loan.isbn && loan.isbn.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dashboard-page admin-dashboard animate-fade-in-up">
      {/* College Admin Banner */}
      <div className="welcome-banner">
        <div className="banner-content-grid">
          <div className="banner-text">
            <div className="banner-badge-row">
              <span className="admin-console-pill">
                <span className="dot-pulse-mini"></span>
                ADMIN CONSOLE
              </span>
              <div className={`connection-status-pill ${isBackendOnline ? 'status-online' : 'status-offline'}`}>
                <span className={`status-indicator-dot ${isBackendOnline ? 'dot-live-green' : 'dot-live-red'}`}></span>
                <span>
                  {isBackendOnline ? (
                    <>PostgreSQL: <strong>library_db</strong> connected</>
                  ) : (
                    <>Backend Offline (Port 5000 not reachable)</>
                  )}
                </span>
              </div>
            </div>
            <h2 className="banner-heading">Library Circulation & Inventory</h2>
            <p className="banner-description">
              Real-time campus catalog overview, active borrower loan audits, 14-day circulation tracking, and reports.
            </p>
          </div>

          <div className="banner-quick-actions">
            <button className="btn-banner-primary" onClick={onOpenIssueBook}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
              <span>Issue Book</span>
            </button>

            <button className="btn-banner-secondary" onClick={onExportCsv} title="Download CSV Circulation Report">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export CSV</span>
            </button>

            <button className="btn-banner-ai" onClick={onOpenAi} title="Open AI Librarian Assistant">
              <span className="ai-sparkle">✨</span>
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Admin Metric Cards */}
      <div className="stats-grid admin-stats-grid">
        {/* Card 1: Total Books */}
        <div className="stat-card stat-card-total">
          <div className="stat-card-header">
            <span className="stat-label">Total Inventory</span>
            <div className="stat-icon-wrapper icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          </div>
          <div className="stat-number-wrap">
            <span className="stat-number">{totalBooks}</span>
            <span className="stat-unit">copies</span>
          </div>
          <div className="stat-meta">
            <span className="stat-tag tag-blue">{totalTitles} titles</span>
            <span className="stat-caption">cataloged in database</span>
          </div>
        </div>

        {/* Card 2: Available Books */}
        <div className="stat-card stat-card-available">
          <div className="stat-card-header">
            <span className="stat-label">Available on Shelf</span>
            <div className="stat-icon-wrapper icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number-wrap">
            <span className="stat-number text-success">{availableBooks}</span>
            <span className="stat-unit">ready</span>
          </div>
          <div className="stat-meta">
            <span className="stat-tag tag-green">
              {totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 100}% in stock
            </span>
            <span className="stat-caption">on physical shelves</span>
          </div>
        </div>

        {/* Card 3: Currently Issued */}
        <div className="stat-card stat-card-issued">
          <div className="stat-card-header">
            <span className="stat-label">Currently Issued</span>
            <div className="stat-icon-wrapper icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number-wrap">
            <span className="stat-number text-amber">{issuedBooks}</span>
            <span className="stat-unit">on loan</span>
          </div>
          <div className="stat-meta">
            <span className="stat-tag tag-amber">{activeIssues} active</span>
            <span className="stat-caption">across {uniqueStudents} borrower(s)</span>
          </div>
        </div>

        {/* Card 4: Overdue Books */}
        <div className={`stat-card stat-card-overdue ${overdueCount > 0 ? 'card-has-overdue' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-label">Overdue Books</span>
            <div className="stat-icon-wrapper icon-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <div className="stat-number-wrap">
            <span className={`stat-number ${overdueCount > 0 ? 'text-danger' : 'text-muted'}`}>{overdueCount}</span>
            <span className="stat-unit">overdue</span>
          </div>
          <div className="stat-meta">
            {overdueCount > 0 ? (
              <>
                <span className="stat-tag tag-red animate-pulse">Action required</span>
                <span className="stat-caption text-danger">Exceeds 14-day policy</span>
              </>
            ) : (
              <>
                <span className="stat-tag tag-green">All clear</span>
                <span className="stat-caption">0 overdue loans</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Brownie Subtask ⭐: Currently Issued Books (Active Loans Audit Table) */}
      <section className="dashboard-section active-loans-card">
        <div className="section-title-bar">
          <div className="title-text-group">
            <div className="title-row">
              <h3 className="section-title">Currently Issued Books</h3>
              <span className="active-count-badge">{activeLoans.length} Active Loan{activeLoans.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="section-subtitle">Active student borrowers, calculated return deadlines, and overdue metrics.</p>
          </div>

          <div className="search-filter-box">
            <div className="search-mini-wrapper">
              <svg className="search-mini-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="input-mini-search"
                placeholder="Search borrower or book..."
                value={activeLoanSearch}
                onChange={(e) => setActiveLoanSearch(e.target.value)}
              />
              {activeLoanSearch && (
                <button className="clear-mini-btn" onClick={() => setActiveLoanSearch('')}>&times;</button>
              )}
            </div>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="clean-empty-state">
            <div className="empty-icon-circle bg-green-subtle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h4 className="empty-state-title">All books are currently on library shelves</h4>
            <p className="empty-state-text">
              There are no active student loans pending return right now. All textbooks are fully cataloged and available.
            </p>
            <button className="btn-primary btn-empty-cta" onClick={onOpenIssueBook}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
              <span>Issue a Book to Student</span>
            </button>
          </div>
        ) : filteredActiveLoans.length === 0 ? (
          <div className="clean-empty-state">
            <div className="empty-icon-circle bg-slate-subtle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h4 className="empty-state-title">No matching active loans found</h4>
            <p className="empty-state-text">No active loan records match your search query "{activeLoanSearch}".</p>
            <button className="btn-secondary" onClick={() => setActiveLoanSearch('')}>Clear Search Filter</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Tx ID</th>
                  <th>Book Title &amp; ISBN</th>
                  <th>Borrower Details</th>
                  <th>Issue Date</th>
                  <th>Due Date (14d)</th>
                  <th>Status &amp; Overdue</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActiveLoans.map((loan) => {
                  const isOverdue = loan.is_overdue || (loan.days_overdue && loan.days_overdue > 0);
                  return (
                    <tr key={loan.id} className={isOverdue ? 'row-overdue' : ''}>
                      <td><span className="id-badge">#{loan.id}</span></td>
                      <td>
                        <div className="book-title-cell">
                          <span className="table-book-title">{loan.book_title || `Book #${loan.book_id}`}</span>
                          <span className="table-book-isbn">ISBN: {loan.isbn || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="borrower-cell">
                          <span className="borrower-name">{loan.student_name}</span>
                          <code className="borrower-id-tag">{loan.student_id}</code>
                        </div>
                      </td>
                      <td className="text-muted font-medium">{formatDate(loan.issue_date)}</td>
                      <td>
                        <span className="due-date-text">{formatDate(loan.due_date)}</span>
                      </td>
                      <td>
                        {isOverdue ? (
                          <span className="badge-pill badge-pill-overdue animate-pulse">
                            ⚠️ {loan.days_overdue} day{loan.days_overdue !== 1 ? 's' : ''} Overdue
                          </span>
                        ) : (
                          <span className="badge-pill badge-pill-active">
                            ● On Schedule
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-action-return"
                          onClick={() => onReturnBook(loan.id)}
                          title="Process Return of Book"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                          </svg>
                          <span>Process Return</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-footer-info">
              Showing {filteredActiveLoans.length} of {activeLoans.length} active borrower loan(s)
            </div>
          </div>
        )}
      </section>

      {/* Quick Launchpad Action Cards */}
      <section className="dashboard-section launchpad-wrapper">
        <h3 className="section-title">Quick Administrative Actions</h3>
        <div className="launchpad-grid">
          <button className="launch-card card-action-issue" onClick={onOpenIssueBook}>
            <div className="launch-icon bg-primary-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <div className="launch-details">
              <h4>Issue Book</h4>
              <p>Lend textbook copy to a student via Student ID</p>
            </div>
            <div className="launch-arrow">&rarr;</div>
          </button>

          <button className="launch-card card-action-add" onClick={onOpenAddBook}>
            <div className="launch-icon bg-green-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="launch-details">
              <h4>Add New Title</h4>
              <p>Register new curriculum book with ISBN &amp; stock</p>
            </div>
            <div className="launch-arrow">&rarr;</div>
          </button>

          <button className="launch-card card-action-browse" onClick={() => onNavigate('books')}>
            <div className="launch-icon bg-blue-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="launch-details">
              <h4>Browse Catalog</h4>
              <p>Search textbooks and filter by department</p>
            </div>
            <div className="launch-arrow">&rarr;</div>
          </button>

          <button className="launch-card card-action-export" onClick={onExportCsv}>
            <div className="launch-icon bg-amber-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div className="launch-details">
              <h4>Export CSV Report</h4>
              <p>Download complete circulation and loan audit log</p>
            </div>
            <div className="launch-arrow">&rarr;</div>
          </button>
        </div>
      </section>

      {/* Recent Lending Cycles Table */}
      <section className="dashboard-section recent-activity-card">
        <div className="section-title-bar">
          <div>
            <h3 className="section-title">Recent Lending Cycles</h3>
            <p className="section-subtitle">Chronological ledger of recent circulation checkouts and returns.</p>
          </div>
          <button className="btn-link-action" onClick={() => onNavigate('transactions')}>
            <span>View Complete Log</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div className="clean-empty-state">
            <p className="empty-state-text">No circulation records found in database.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Book Title</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((tx) => (
                  <tr key={tx.id}>
                    <td><span className="id-badge">#{tx.id}</span></td>
                    <td className="font-semibold text-main">{tx.book_title || 'Unknown Title'}</td>
                    <td>{tx.student_name}</td>
                    <td><code className="borrower-id-tag">{tx.student_id}</code></td>
                    <td className="text-muted">{formatDate(tx.issue_date)}</td>
                    <td>
                      <span className={`badge-pill ${tx.status === 'issued' ? 'badge-pill-active' : 'badge-pill-returned'}`}>
                        {tx.status === 'issued' ? '● Active Loan' : '✓ Returned'}
                      </span>
                    </td>
                    <td className="text-right">
                      {tx.status === 'issued' ? (
                        <button
                          className="btn-action-return-sm"
                          onClick={() => onReturnBook(tx.id)}
                          title="Process Return"
                        >
                          Return Book
                        </button>
                      ) : (
                        <span className="badge-pill-completed">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

