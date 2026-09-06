import React, { useState } from 'react';

export default function TopHeader({
  searchQuery,
  onSearchChange,
  userRole,
  onOpenLoginModal,
  onOpenAi,
  isBackendOnline = true,
  onQuickNavigate
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Format today's date like the mockup: e.g. "Thursday, 4 Sep 2026"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const notifications = [
    { id: 1, title: 'System Connected', text: 'PostgreSQL database connected (library_db)', time: 'Just now', unread: true },
    { id: 2, title: 'Overdue Alert', text: 'Check overdue audit in circulation ledger', time: '1 hr ago', unread: true },
    { id: 3, title: 'AI Companion Ready', text: 'Gemini 3.6 Flash active for book recommendations', time: 'Today', unread: false }
  ];

  return (
    <header className="app-top-header">
      {/* Global Search Bar */}
      <div className="header-search-wrapper">
        <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="header-search-input"
          placeholder="Search books, members, ISBN..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (e.target.value && onQuickNavigate) {
              onQuickNavigate('books');
            }
          }}
        />
        {searchQuery && (
          <button className="header-clear-search" onClick={() => onSearchChange('')}>
            &times;
          </button>
        )}
      </div>

      {/* Right Utility Section */}
      <div className="header-right-tools">
        {/* Date Display */}
        <div className="header-date-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{formattedDate}</span>
        </div>

        {/* Database Status Indicator */}
        <div className={`db-status-chip ${isBackendOnline ? 'online' : 'offline'}`} title={isBackendOnline ? "Database online" : "Database offline"}>
          <span className="db-dot"></span>
          <span className="db-label">{isBackendOnline ? 'DB Connected' : 'Offline'}</span>
        </div>

        {/* AI Quick Button */}
        <button className="header-ai-pill" onClick={onOpenAi} title="Open Athena AI Librarian">
          <span className="sparkle-anim">✨</span>
          <span>Athena AI</span>
        </button>

        {/* Notification Bell */}
        <div className="notification-wrapper">
          <button
            className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notification-unread-dot"></span>
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-dropdown-header">
                <strong>Notifications</strong>
                <span className="notif-count-pill">2 new</span>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-text">{n.text}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="header-user-profile" onClick={onOpenLoginModal} title="Click to view profile or switch role">
          <div className="user-avatar-circle">
            {userRole === 'student' ? '👨‍🎓' : '👨‍💼'}
          </div>
          <div className="user-info-text">
            <span className="user-display-name">{userRole === 'student' ? 'Arjun R' : 'Librarian'}</span>
            <span className="user-display-email">
              {userRole === 'student' ? 'arjun@library.edu' : 'librarian@library.edu'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
