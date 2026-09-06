import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenLoginModal,
  onOpenAi,
  unreadNotificationsCount = 2,
  onViewLandingPage,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {}
}) {
  const isStudent = userRole === 'student';

  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
      )
    },
    {
      id: 'books',
      label: 'Books',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      id: 'scan-qr',
      label: 'Scan QR / Search',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="6" height="6" rx="1"></rect>
          <rect x="15" y="3" width="6" height="6" rx="1"></rect>
          <rect x="3" y="15" width="6" height="6" rx="1"></rect>
          <path d="M15 15h2v2h-2z"></path>
          <path d="M19 15h2v6h-2z"></path>
          <path d="M15 19h2v2h-2z"></path>
        </svg>
      )
    },
    {
      id: 'issue-return',
      label: 'Issue / Return',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5"></path>
          <path d="M4 20L21 3"></path>
          <path d="M21 16v5h-5"></path>
          <path d="M15 15l6 6"></path>
          <path d="M4 4l5 5"></path>
        </svg>
      )
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="12 8 12 12 14 14"></polyline>
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
        </svg>
      )
    },
    {
      id: 'members',
      label: 'Members / Loans',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'search-books',
      label: 'Smart Search',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  const studentNavItems = [
    {
      id: 'members',
      label: 'My Books',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      id: 'search-books',
      label: 'Search Books',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      id: 'scan-qr',
      label: 'Scan QR Code',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="6" height="6" rx="1"></rect>
          <rect x="15" y="3" width="6" height="6" rx="1"></rect>
          <rect x="3" y="15" width="6" height="6" rx="1"></rect>
          <path d="M15 15h2v2h-2z"></path>
        </svg>
      )
    },
    {
      id: 'transactions',
      label: 'My Transactions',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="12 8 12 12 14 14"></polyline>
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Profile & Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  const currentNav = isStudent ? studentNavItems : adminNavItems;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div className="sidebar-mobile-overlay" onClick={onCloseMobileMenu} />
      )}

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div
            className="sidebar-brand-left"
            onClick={() => handleNavClick(isStudent ? 'members' : 'dashboard')}
          >
            <div className="brand-circle-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <path d="M10 7h6"></path>
                <path d="M10 11h6"></path>
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-main-title">Library System</span>
              <span className="brand-role-subtitle">{isStudent ? 'Student Portal' : 'Admin Console'}</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button className="sidebar-mobile-close" onClick={onCloseMobileMenu} aria-label="Close menu">
            &times;
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {currentNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {isActive && <span className="nav-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* AI Assistant Quick Pill */}
        <div className="sidebar-ai-box">
          <button
            className="sidebar-ai-btn"
            onClick={() => {
              onCloseMobileMenu();
              onOpenAi();
            }}
          >
            <div className="ai-icon-bubble">✨</div>
            <div className="ai-box-info">
              <span className="ai-box-title">Ask Athena AI</span>
              <span className="ai-box-status">Gemini Flash · Online</span>
            </div>
          </button>
        </div>

        {/* Landing Page Link & Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-link"
            onClick={() => {
              onCloseMobileMenu();
              onViewLandingPage();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Landing Page</span>
          </button>

          <button
            className="sidebar-footer-link logout-btn"
            onClick={() => {
              onCloseMobileMenu();
              onOpenLoginModal();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Switch Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}
