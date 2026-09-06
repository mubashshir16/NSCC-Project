import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

export default function ReportsView({
  transactions = [],
  books = [],
  onExportCsv
}) {
  const [activeTab, setActiveTab] = useState('generate');
  const [reportType, setReportType] = useState('history');
  const [dateRange, setDateRange] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
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

  return (
    <div className="reports-page animate-fade-in-up">
      <div className="page-header-flex">
        <div>
          <h2 className="page-heading">Reports</h2>
          <p className="page-subtitle">Export and analyze library data</p>
        </div>

        <div className="page-header-actions">
          <button className="btn-export-csv-lg" onClick={onExportCsv}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export as CSV</span>
          </button>
        </div>
      </div>

      {/* Report Mode Tabs */}
      <div className="reports-tabs-row">
        <button
          className={`report-tab-pill ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Report
        </button>
        <button
          className={`report-tab-pill ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
      </div>

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
              <option value="history">Issue/Return History</option>
              <option value="issued">Currently Issued Books</option>
              <option value="overdue">Overdue Books Audit</option>
              <option value="returned">Completed Returns</option>
            </select>
          </div>

          <div className="config-group">
            <label className="config-label">Date Range</label>
            <select
              className="config-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Recorded Cycles</option>
              <option value="today">Today&apos;s Activity</option>
              <option value="this-week">Current Week</option>
              <option value="this-month">Current Month</option>
            </select>
          </div>

          <div className="config-group action-group">
            <button className="btn-generate-report" onClick={() => {}}>
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="report-table-wrapper">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Issued To</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-muted">
                    No records found matching selected report filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 15).map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-semibold text-main">{tx.book_title || `Book #${tx.book_id}`}</td>
                    <td className="text-muted">{tx.book_author || '—'}</td>
                    <td>
                      <div className="borrower-cell">
                        <span className="borrower-name">{tx.student_name}</span>
                        <code className="borrower-id-tag">{tx.student_id}</code>
                      </div>
                    </td>
                    <td>{formatDate(tx.issue_date)}</td>
                    <td>{tx.return_date ? formatDate(tx.return_date) : <span className="text-amber">Pending</span>}</td>
                    <td>
                      <span className={`badge-pill ${tx.status === 'issued' ? (tx.days_overdue > 0 ? 'badge-pill-overdue' : 'badge-pill-active') : 'badge-pill-returned'}`}>
                        {tx.status === 'issued' ? (tx.days_overdue > 0 ? `Overdue (${tx.days_overdue}d)` : 'Issued') : 'Returned'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer-info">
            Showing {Math.min(filteredTransactions.length, 15)} of {filteredTransactions.length} records in generated report
          </div>
        </div>
      </div>
    </div>
  );
}
