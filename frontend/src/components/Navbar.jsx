import React from 'react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddBook,
  onOpenIssueBook,
  onOpenAi,
  onExportCsv
}) {
  return (
    <header className="navbar-container">
      {/* Brand Logo & Title */}
      <div className="navbar-brand" onClick={() => setActiveTab('dashboard')} title="NSCC Library Management System">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <path d="M12 6v6"></path>
            <path d="M9 9h6"></path>
          </svg>
        </div>
        <div className="brand-info">
          <div className="brand-title-row">
            <h1 className="brand-title">NSCC Library</h1>
            <span className="brand-pill">SYSTEM</span>
          </div>
          <span className="brand-sub">Admin &amp; Circulation</span>
        </div>
      </div>

      {/* Main Page Navigation Tabs */}
      <nav className="navbar-links" aria-label="Main Navigation">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="tab-dashboard"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Admin Dashboard</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
          id="tab-books"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>Books Collection</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
          id="tab-transactions"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="12 8 12 12 14 14"></polyline>
            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
          </svg>
          <span>Circulation Log</span>
        </button>
      </nav>

      {/* Action Controls */}
      <div className="navbar-actions">
        {/* AI Assistant Quick Launcher */}
        <button
          className="btn-nav-ai"
          onClick={onOpenAi}
          title="Open Athena, your AI Library Assistant"
        >
          <span className="ai-sparkle">✨</span>
          <span className="btn-text">AI Librarian</span>
        </button>

        {/* CSV Export */}
        <button
          className="btn-nav-action btn-export-quick"
          onClick={onExportCsv}
          title="Export complete circulation history as CSV"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span className="btn-text">Export CSV</span>
        </button>

        {/* Issue Book Modal Shortcut */}
        <button
          className="btn-nav-action btn-issue-quick"
          onClick={onOpenIssueBook}
          title="Issue textbook to a student"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
          <span className="btn-text">Issue Book</span>
        </button>

        {/* Add Book Modal Shortcut */}
        <button
          className="btn-nav-action btn-add-quick"
          onClick={onOpenAddBook}
          title="Add a new book title to catalog"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="btn-text">Add Book</span>
        </button>
      </div>
    </header>
  );
}

