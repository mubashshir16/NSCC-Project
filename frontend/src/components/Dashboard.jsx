import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';
import { exportTransactionsToCsv } from '../utils/csvExport';

export default function Dashboard({
  stats,
  loading,
  onNavigate,
  onOpenAddBook,
  onOpenIssueBook,
  onReturnBook,
  transactions = []
}) {
  const [activeDashTab, setActiveDashTab] = useState('recent'); // 'recent' | 'loans'

  if (loading && !stats) {
    return (
      <div className="loading-container animate-fade-in">
        <div className="spinner"></div>
        <p>Loading Dashboard overview from PostgreSQL...</p>
      </div>
    );
  }

  const {
    totalBooks = 0,
    availableBooks = 0,
    issuedBooks = 0,
    overdueCount = 0,
    activeLoans = [],
    recentActivity = []
  } = stats || {};

  // Mock hourly activity distribution for the "Today's Activity" chart shown in mockup
  const activityBars = [
    { time: '8AM', issues: 12, returns: 6 },
    { time: '12PM', issues: 28, returns: 19 },
    { time: '4PM', issues: 35, returns: 24 },
    { time: '8PM', issues: 18, returns: 14 }
  ];

  const maxActivity = 40;

  return (
    <div className="dashboard-modern-page animate-fade-in-up">
      {/* Dashboard Top Greeting */}
      <div className="dashboard-header-block">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-subtitle">Welcome back, Librarian!</p>
        </div>
        <div className="dash-header-actions">
          <button
            className="btn-secondary-clean"
            onClick={() => exportTransactionsToCsv(transactions)}
            title="Download complete circulation history as CSV"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards Row */}
      <div className="dash-stats-row">
        {/* Card 1: Total Books */}
        <div className="modern-stat-card card-blue">
          <div className="stat-card-left">
            <div className="stat-icon-square icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label-text">Total Books</span>
              <span className="stat-main-number">{totalBooks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Available Books */}
        <div className="modern-stat-card card-green">
          <div className="stat-card-left">
            <div className="stat-icon-square icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label-text">Available Books</span>
              <span className="stat-main-number">{availableBooks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Issued Books */}
        <div className="modern-stat-card card-amber">
          <div className="stat-card-left">
            <div className="stat-icon-square icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label-text">Issued Books</span>
              <span className="stat-main-number">{issuedBooks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Overdue Books */}
        <div className="modern-stat-card card-rose">
          <div className="stat-card-left">
            <div className="stat-icon-square icon-rose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label-text">Overdue Books</span>
              <span className="stat-main-number">{overdueCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row (Matching mockup) */}
      <div className="dash-quick-actions-section">
        <h3 className="section-title-sm">Quick Actions</h3>
        <div className="quick-action-pills-grid">
          <button className="pill-action-btn btn-action-add" onClick={onOpenAddBook}>
            <div className="action-pill-icon bg-blue-subtle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span>Add Book</span>
          </button>

          <button className="pill-action-btn btn-action-scan" onClick={() => onNavigate('scan-qr')}>
            <div className="action-pill-icon bg-teal-subtle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                <rect x="3" y="15" width="6" height="6" rx="1"></rect>
                <path d="M15 15h2v2h-2z"></path>
              </svg>
            </div>
            <span>Scan QR Code</span>
          </button>

          <button className="pill-action-btn btn-action-issue" onClick={onOpenIssueBook}>
            <div className="action-pill-icon bg-indigo-subtle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <span>Issue Book</span>
          </button>

          <button className="pill-action-btn btn-action-return" onClick={() => onNavigate('issue-return')}>
            <div className="action-pill-icon bg-green-subtle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <span>Return Book</span>
          </button>
        </div>
      </div>

      {/* Two-Column Lower Section (Recent Transactions & Today's Activity) */}
      <div className="dash-two-column-grid">
        {/* Left: Recent Transactions & Active Loans Table */}
        <div className="dash-left-card">
          <div className="card-header-flex">
            <div className="dash-table-tabs">
              <button
                type="button"
                className={`dash-table-tab-btn ${activeDashTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveDashTab('recent')}
              >
                Recent Activity
              </button>
              <button
                type="button"
                className={`dash-table-tab-btn ${activeDashTab === 'loans' ? 'active' : ''}`}
                onClick={() => setActiveDashTab('loans')}
              >
                Currently Issued Books ({activeLoans.length})
              </button>
            </div>

            <button
              className="btn-view-all-link"
              onClick={() => onNavigate(activeDashTab === 'loans' ? 'members' : 'transactions')}
            >
              <span>View All</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div className="table-responsive">
            {activeDashTab === 'recent' ? (
              <table className="custom-table table-compact">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>#</th>
                    <th>Book Title</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Date &amp; Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-muted">
                        No circulation activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((tx, idx) => (
                      <tr key={tx.id}>
                        <td><span className="id-badge-sm">{idx + 1}</span></td>
                        <td className="font-semibold text-main">{tx.book_title || 'Unknown Title'}</td>
                        <td>
                          <span className="user-name-cell">{tx.student_name}</span>
                        </td>
                        <td>
                          <span className="type-pill">
                            {tx.status === 'issued' ? 'Issue' : 'Return'}
                          </span>
                        </td>
                        <td className="text-muted">{formatDate(tx.issue_date)}</td>
                        <td>
                          <span className="status-success-tag">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="custom-table table-compact">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>#</th>
                    <th>Book Title</th>
                    <th>Borrower (Student)</th>
                    <th>Student ID</th>
                    <th>Due Date</th>
                    <th>Overdue Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-muted">
                        No active loans currently checked out.
                      </td>
                    </tr>
                  ) : (
                    activeLoans.map((loan, idx) => (
                      <tr key={loan.id}>
                        <td><span className="id-badge-sm">{idx + 1}</span></td>
                        <td className="font-semibold text-main">{loan.book_title || 'Unknown Title'}</td>
                        <td>
                          <span className="user-name-cell">{loan.student_name}</span>
                        </td>
                        <td><code className="isbn-tag">{loan.student_id}</code></td>
                        <td className="text-muted">{formatDate(loan.due_date)}</td>
                        <td>
                          {loan.is_overdue || loan.days_overdue > 0 ? (
                            <span className="badge-pill badge-pill-outofstock" style={{ fontWeight: 'bold' }}>
                              ⚠️ {loan.days_overdue} day{loan.days_overdue > 1 ? 's' : ''} overdue
                            </span>
                          ) : (
                            <span className="badge-pill badge-pill-available">
                              ✓ On Track
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Today's Activity Chart & Overdue Box */}
        <div className="dash-right-stack">
          {/* Today's Activity Bar Chart Card */}
          <div className="dash-activity-card">
            <div className="card-header-flex">
              <h3 className="section-title-sm">Today&apos;s Activity</h3>
              <div className="chart-legend-row">
                <span className="legend-item"><span className="legend-dot dot-issues"></span> Issues</span>
                <span className="legend-item"><span className="legend-dot dot-returns"></span> Returns</span>
              </div>
            </div>

            {/* Pure CSS Bar Chart (matching mockup) */}
            <div className="activity-bar-chart">
              <div className="chart-y-axis">
                <span>40</span>
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>

              <div className="chart-bars-wrap">
                {activityBars.map((bar, i) => (
                  <div key={i} className="chart-time-column">
                    <div className="dual-bars-group">
                      <div
                        className="bar-fill bar-issues"
                        style={{ height: `${(bar.issues / maxActivity) * 100}%` }}
                        title={`${bar.issues} Issues at ${bar.time}`}
                      ></div>
                      <div
                        className="bar-fill bar-returns"
                        style={{ height: `${(bar.returns / maxActivity) * 100}%` }}
                        title={`${bar.returns} Returns at ${bar.time}`}
                      ></div>
                    </div>
                    <span className="chart-x-label">{bar.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Books Alert Card */}
          <div className="dash-overdue-card">
            <div className="overdue-left-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="overdue-center-text">
              <span className="overdue-title">Overdue Books</span>
              <span className="overdue-count-badge">{overdueCount}</span>
            </div>
            <button className="btn-view-overdue-link" onClick={() => onNavigate('members')}>
              <span>View List</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
