import React, { useState, useMemo } from 'react';
import { formatDate } from '../utils/formatDate';
import { exportTransactionsToCsv, exportBooksToCsv } from '../utils/csvExport';

export default function ReportsView({
  transactions = [],
  books = [],
  onExportCsv
}) {
  const [activeTab, setActiveTab] = useState('generate');
  const [reportType, setReportType] = useState('books'); // Default to Book Inventory so data is always immediately visible
  const [dateRange, setDateRange] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (parseInt(b.quantity, 10) || 0), 0);
    const availableCopies = books.reduce((acc, b) => acc + (parseInt(b.available_quantity, 10) || 0), 0);
    const activeLoans = transactions.filter((t) => t.status === 'issued').length;
    const overdueLoans = transactions.filter((t) => t.status === 'issued' && (t.is_overdue || (t.days_overdue && t.days_overdue > 0))).length;
    const totalReturned = transactions.filter((t) => t.status === 'returned').length;

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      activeLoans,
      overdueLoans,
      totalReturned
    };
  }, [books, transactions]);

  // Filter Transactions by Date Range
  const filterByDate = (dateStr) => {
    if (dateRange === 'all' || !dateStr) return true;

    const recordDate = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'today') {
      return (
        recordDate.getFullYear() === now.getFullYear() &&
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getDate() === now.getDate()
      );
    }

    if (dateRange === 'this-week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return recordDate >= oneWeekAgo;
    }

    if (dateRange === 'this-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      return recordDate >= oneMonthAgo;
    }

    return true;
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Date Range Filter
      if (!filterByDate(tx.issue_date || tx.created_at)) {
        return false;
      }

      // 2. Type Filter
      if (reportType === 'overdue') {
        return tx.is_overdue || (tx.days_overdue && tx.days_overdue > 0);
      }
      if (reportType === 'issued') {
        return tx.status === 'issued';
      }
      if (reportType === 'returned') {
        return tx.status === 'returned';
      }
      return true; // all history
    });
  }, [transactions, reportType, dateRange]);

  // Handle Generate Click
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setLastGenerated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 250);
  };

  // Handle Dynamic CSV Export
  const handleExportCurrent = () => {
    if (reportType === 'books') {
      exportBooksToCsv(books);
    } else {
      if (filteredTransactions.length === 0) {
        alert("No transaction records match this report filter to export.");
        return;
      }
      exportTransactionsToCsv(filteredTransactions, `Library_${reportType.toUpperCase()}_Report.csv`);
    }
  };

  return (
    <div className="reports-page animate-fade-in-up">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h2 className="page-heading">Reports & Analytics</h2>
          <p className="page-subtitle">Export and analyze library inventory, circulation, and member activity</p>
        </div>

        <div className="page-header-actions">
          <button className="btn-export-csv-lg" onClick={handleExportCurrent}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>{reportType === 'books' ? 'Export Books (CSV)' : 'Export Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="reports-summary-strip">
        <div className="report-metric-card">
          <span className="metric-label">Cataloged Titles</span>
          <span className="metric-value">{summaryMetrics.totalTitles}</span>
          <span className="metric-caption">{summaryMetrics.totalCopies} total copies</span>
        </div>
        <div className="report-metric-card">
          <span className="metric-label">Available on Shelf</span>
          <span className="metric-value text-emerald">{summaryMetrics.availableCopies}</span>
          <span className="metric-caption">Ready for issue</span>
        </div>
        <div className="report-metric-card">
          <span className="metric-label">Active Loans</span>
          <span className="metric-value text-blue">{summaryMetrics.activeLoans}</span>
          <span className="metric-caption">Currently with students</span>
        </div>
        <div className="report-metric-card">
          <span className="metric-label">Overdue Loans</span>
          <span className={`metric-value ${summaryMetrics.overdueLoans > 0 ? 'text-rose' : 'text-muted'}`}>
            {summaryMetrics.overdueLoans}
          </span>
          <span className="metric-caption">Action required</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="reports-tabs-row">
        <button
          className={`report-tab-pill ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Generate Report</span>
        </button>
        <button
          className={`report-tab-pill ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export Data</span>
        </button>
      </div>

      {/* TAB 1: GENERATE REPORT */}
      {activeTab === 'generate' && (
        <>
          {/* Filter Parameters Bar */}
          <div className="report-config-card">
            <div className="report-config-grid">
              <div className="config-group">
                <label className="config-label">Report Type</label>
                <select
                  className="config-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="books">📚 Book Catalog & Inventory Summary</option>
                  <option value="history">🔄 All Circulation History (Loans & Returns)</option>
                  <option value="issued">📖 Currently Issued Books (Active Loans)</option>
                  <option value="overdue">⚠️ Overdue Books Audit</option>
                  <option value="returned">✅ Completed Returns Archive</option>
                </select>
              </div>

              <div className="config-group">
                <label className="config-label">Date Range</label>
                <select
                  className="config-select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  disabled={reportType === 'books'}
                >
                  <option value="all">All Recorded Cycles</option>
                  <option value="today">Today&apos;s Activity</option>
                  <option value="this-week">Current Week (Past 7 Days)</option>
                  <option value="this-month">Current Month (Past 30 Days)</option>
                </select>
              </div>

              <div className="config-group action-group">
                <button
                  className={`btn-generate-report ${isGenerating ? 'loading' : ''}`}
                  onClick={handleGenerate}
                >
                  {isGenerating ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="report-status-bar">
              <span className="status-dot"></span>
              <span className="status-text">
                Report generated at <strong>{lastGenerated}</strong> •{' '}
                {reportType === 'books'
                  ? `${books.length} book titles loaded`
                  : `${filteredTransactions.length} circulation records found`}
              </span>
            </div>
          </div>

          {/* Report Data Table Preview */}
          <div className="report-table-wrapper">
            <div className="table-responsive">
              <table className="custom-table">
                {reportType === 'books' ? (
                  // BOOK INVENTORY TABLE HEADERS
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>ISBN</th>
                      <th>Category</th>
                      <th>Total Copies</th>
                      <th>Available Copies</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                ) : (
                  // TRANSACTIONS TABLE HEADERS
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Issued To</th>
                      <th>Issue Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                )}

                <tbody>
                  {reportType === 'books' ? (
                    // RENDER BOOK INVENTORY
                    books.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-muted">
                          No books found in library catalog.
                        </td>
                      </tr>
                    ) : (
                      books.map((b, idx) => (
                        <tr key={b.id}>
                          <td className="text-muted font-mono" style={{ fontSize: '0.78rem' }}>{idx + 1}</td>
                          <td className="font-semibold text-main">{b.title}</td>
                          <td className="text-muted">{b.author || '—'}</td>
                          <td>
                            <code className="isbn-badge">{b.isbn}</code>
                          </td>
                          <td>
                            <span className="category-tag">{b.category || 'General'}</span>
                          </td>
                          <td className="font-semibold">{b.quantity}</td>
                          <td>
                            <span className={`font-semibold ${b.available_quantity > 0 ? 'text-emerald' : 'text-rose'}`}>
                              {b.available_quantity}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-pill ${b.available_quantity > 0 ? 'badge-pill-active' : 'badge-pill-overdue'}`}>
                              {b.available_quantity > 0 ? 'Available' : 'All Issued'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    // RENDER TRANSACTIONS
                    filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8">
                          <div className="report-empty-state">
                            <div className="empty-state-icon">📖</div>
                            <h4 className="empty-state-title">No transactions recorded in this period</h4>
                            <p className="empty-state-desc">
                              There are currently no active or historical loans matching this filter.
                            </p>
                            <button
                              className="btn-switch-report"
                              onClick={() => setReportType('books')}
                            >
                              View Book Inventory Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx, idx) => (
                        <tr key={tx.id}>
                          <td className="text-muted font-mono" style={{ fontSize: '0.78rem' }}>{idx + 1}</td>
                          <td className="font-semibold text-main">{tx.book_title || `Book #${tx.book_id}`}</td>
                          <td className="text-muted">{tx.book_author || '—'}</td>
                          <td>
                            <div className="borrower-cell">
                              <span className="borrower-name">{tx.student_name}</span>
                              <code className="borrower-id-tag">{tx.student_id}</code>
                            </div>
                          </td>
                          <td>{formatDate(tx.issue_date)}</td>
                          <td>{tx.return_date ? formatDate(tx.return_date) : <span className="text-amber font-semibold">Pending</span>}</td>
                          <td>
                            <span
                              className={`badge-pill ${
                                tx.status === 'issued'
                                  ? tx.days_overdue > 0
                                    ? 'badge-pill-overdue'
                                    : 'badge-pill-active'
                                  : 'badge-pill-returned'
                              }`}
                            >
                              {tx.status === 'issued'
                                ? tx.days_overdue > 0
                                  ? `Overdue (${tx.days_overdue}d)`
                                  : 'Issued'
                                : 'Returned'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>

              <div className="table-footer-info">
                {reportType === 'books'
                  ? `Showing all ${books.length} books in library inventory`
                  : `Showing ${filteredTransactions.length} records in generated report`}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: EXPORT DATA CARDS */}
      {activeTab === 'export' && (
        <div className="export-cards-grid animate-fade-in">
          {/* Card 1: Books Catalog */}
          <div className="export-option-card">
            <div className="export-card-icon bg-blue-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className="export-card-body">
              <h3 className="export-card-title">Book Catalog & Inventory CSV</h3>
              <p className="export-card-desc">
                Export all {books.length} cataloged titles, authors, categories, ISBNs, total copies, and shelf availability counts.
              </p>
            </div>
            <button className="btn-export-download" onClick={() => exportBooksToCsv(books)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Catalog CSV</span>
            </button>
          </div>

          {/* Card 2: Circulation History */}
          <div className="export-option-card">
            <div className="export-card-icon bg-teal-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="export-card-body">
              <h3 className="export-card-title">Circulation Ledger CSV</h3>
              <p className="export-card-desc">
                Complete audit history of all book loans, borrower names, student IDs, issue dates, return dates, and statuses.
              </p>
            </div>
            <button
              className="btn-export-download"
              onClick={() => {
                if (transactions.length === 0) {
                  alert("No circulation records recorded yet to export.");
                  return;
                }
                exportTransactionsToCsv(transactions);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Circulation CSV</span>
            </button>
          </div>

          {/* Card 3: Overdue Audit */}
          <div className="export-option-card">
            <div className="export-card-icon bg-rose-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="export-card-body">
              <h3 className="export-card-title">Overdue Audit CSV</h3>
              <p className="export-card-desc">
                Filter and export all active loans currently exceeding the 14-day loan window, including days overdue and contact IDs.
              </p>
            </div>
            <button
              className="btn-export-download"
              onClick={() => {
                const overdues = transactions.filter(t => t.status === 'issued' && (t.is_overdue || t.days_overdue > 0));
                if (overdues.length === 0) {
                  alert("No overdue books in the library at this time.");
                  return;
                }
                exportTransactionsToCsv(overdues, "Library_Overdue_Audit.csv");
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Overdue Audit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
