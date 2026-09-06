import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

export default function MembersView({
  transactions = [],
  onReturnBook,
  onOpenIssueBook,
  userRole = 'librarian'
}) {
  const isStudent = userRole === 'student';
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [searchMember, setSearchMember] = useState('');

  // Extract all active issued loans
  const activeLoans = transactions.filter((t) => t.status === 'issued');

  // Extract unique students
  const uniqueStudents = Array.from(
    new Set(transactions.map((t) => t.student_name).filter(Boolean))
  );

  const filteredLoans = activeLoans.filter((loan) => {
    // If student mode, show books matching "Student" or current student if filtered, or all if demo
    const matchesStudent = !selectedStudentFilter || loan.student_name === selectedStudentFilter;
    const q = searchMember.trim().toLowerCase();
    const matchesSearch = !q || (
      (loan.student_name && loan.student_name.toLowerCase().includes(q)) ||
      (loan.student_id && loan.student_id.toLowerCase().includes(q)) ||
      (loan.book_title && loan.book_title.toLowerCase().includes(q)) ||
      (loan.isbn && loan.isbn.toLowerCase().includes(q))
    );
    return matchesStudent && matchesSearch;
  });

  return (
    <div className="members-page animate-fade-in-up">
      <div className="page-header-flex">
        <div>
          <h2 className="page-heading">
            {isStudent ? 'My Books' : 'Member Directory & Issued Loans'}
          </h2>
          <p className="page-subtitle">
            {isStudent
              ? 'Books currently issued to you with return deadlines and active loan statuses.'
              : 'Track active borrower allocations, 14-day loan deadlines, and overdue states across students.'}
          </p>
        </div>

        {/* Issue Book button is strictly restricted to librarians */}
        {!isStudent && onOpenIssueBook && (
          <div className="page-header-actions">
            <button className="btn-primary" onClick={onOpenIssueBook}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Issue New Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-card">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={isStudent ? "Search your books by title, author, or ISBN..." : "Search by student name, ID, or book title..."}
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />
          {searchMember && (
            <button className="clear-search-btn" onClick={() => setSearchMember('')}>&times;</button>
          )}
        </div>

        {/* Borrower dropdown only shown to librarians */}
        {!isStudent && (
          <div className="filters-row">
            <div className="select-group">
              <label className="filter-label">Filter by Borrower</label>
              <div className="select-custom-wrapper">
                <select
                  className="custom-select"
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                >
                  <option value="">All Borrowers ({uniqueStudents.length})</option>
                  {uniqueStudents.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchMember || selectedStudentFilter) && (
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSearchMember('');
                  setSelectedStudentFilter('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Members Loans Table */}
      {filteredLoans.length === 0 ? (
        <div className="clean-empty-state">
          <div className="empty-icon-circle bg-green-subtle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h4 className="empty-state-title">No Active Borrowings Found</h4>
          <p className="empty-state-text">
            {isStudent
              ? 'You currently have no books issued to your account. Visit the library circulation counter to borrow books.'
              : 'There are currently no active book loans matching this criteria. All library volumes are on shelf.'}
          </p>
          {!isStudent && onOpenIssueBook && (
            <button className="btn-primary" onClick={onOpenIssueBook}>
              Issue a Book Copy
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Title</th>
                <th>Author</th>
                {!isStudent && <th>Borrower / Student ID</th>}
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, idx) => {
                const isOverdue = loan.is_overdue || (loan.days_overdue && loan.days_overdue > 0);
                return (
                  <tr key={loan.id} className={isOverdue ? 'row-overdue' : ''}>
                    <td><span className="id-badge">{idx + 1}</span></td>
                    <td className="font-semibold text-main">{loan.book_title || `Book #${loan.book_id}`}</td>
                    <td className="text-muted">{loan.book_author || '—'}</td>
                    {!isStudent && (
                      <td>
                        <div className="borrower-cell">
                          <span className="borrower-name">{loan.student_name}</span>
                          <code className="borrower-id-tag">{loan.student_id}</code>
                        </div>
                      </td>
                    )}
                    <td>{formatDate(loan.issue_date)}</td>
                    <td><span className="due-date-text">{formatDate(loan.due_date)}</span></td>
                    <td>
                      {isOverdue ? (
                        <span className="badge-pill badge-pill-overdue">
                          Overdue ({loan.days_overdue}d)
                        </span>
                      ) : (
                        <span className="badge-pill badge-pill-available">
                          On Time
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {!isStudent ? (
                        <button
                          className="btn-action-return"
                          onClick={() => onReturnBook(loan.id)}
                          title="Process Return"
                        >
                          Return
                        </button>
                      ) : (
                        <span className="badge-pill badge-pill-available" style={{ fontSize: '0.72rem' }}>
                          Return at Counter
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-footer-info">
            Showing {filteredLoans.length} active book records
          </div>
        </div>
      )}
    </div>
  );
}
