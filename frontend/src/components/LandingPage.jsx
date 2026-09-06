import React from 'react';

export default function LandingPage({ onEnterApp, onOpenLogin }) {
  return (
    <div className="landing-page-wrapper animate-fade-in">
      {/* Landing Navbar */}
      <nav className="landing-navbar">
        <div className="landing-nav-brand">
          <div className="brand-circle-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <path d="M10 7h6"></path>
              <path d="M10 11h6"></path>
            </svg>
          </div>
          <span className="landing-brand-name">Library System</span>
        </div>

        <div className="landing-nav-links">
          <a href="#hero" className="landing-nav-link active">Home</a>
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#catalog" className="landing-nav-link">Catalog</a>
          <a href="#about" className="landing-nav-link">About</a>
        </div>

        <div className="landing-nav-actions">
          <button className="btn-landing-login" onClick={onOpenLogin}>
            Login
          </button>
          <button className="btn-landing-primary" onClick={onEnterApp}>
            <span>Open Dashboard</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero-section" id="hero">
        <div className="hero-content-left">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Next-Generation Library Platform</span>
          </div>

          <h1 className="hero-main-title">
            Knowledge Today<br />
            <span className="hero-highlight">A Better Tomorrow</span>
          </h1>

          <p className="hero-subtitle">
            A smart library management system to issue, return and track books effortlessly.
            Seamless cataloging, live PostgreSQL synchronization, and Gemini AI assistance.
          </p>

          {/* 4 Feature Badges */}
          <div className="hero-feature-pills">
            <div className="hero-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                <rect x="3" y="15" width="6" height="6" rx="1"></rect>
                <path d="M15 15h2v2h-2z"></path>
                <path d="M19 15h2v6h-2z"></path>
                <path d="M15 19h2v2h-2z"></path>
              </svg>
              <span>Scan QR Code</span>
            </div>

            <div className="hero-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Track Books</span>
            </div>

            <div className="hero-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Smart Search</span>
            </div>

            <div className="hero-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="12 8 12 12 14 14"></polyline>
                <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
              </svg>
              <span>Real-time Records</span>
            </div>
          </div>

          <div className="hero-actions-row">
            <button className="btn-hero-cta" onClick={onEnterApp}>
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn-hero-secondary" onClick={onOpenLogin}>
              Explore as Student
            </button>
          </div>
        </div>

        {/* Hero Right Visual (Stack of Books & Floating Quote) */}
        <div className="hero-content-right">
          <div className="hero-visual-card">
            {/* Floating Quote Box */}
            <div className="floating-quote-box">
              <p className="quote-text">
                &ldquo;Libraries store the energy that fuels the imagination.&rdquo;
              </p>
              <span className="quote-author">&mdash; Oprah Winfrey</span>
            </div>

            {/* 3D Book Stack Graphic */}
            <div className="book-stack-container">
              <div className="book-spine spine-blue">
                <span className="book-spine-text">DISCOVER</span>
              </div>
              <div className="book-spine spine-teal">
                <span className="book-spine-text">LEARN</span>
              </div>
              <div className="book-spine spine-green">
                <span className="book-spine-text">GROW</span>
              </div>
              <div className="book-spine spine-burgundy">
                <span className="book-spine-text">BELONG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Stats Proof Strip */}
      <section className="landing-stats-strip">
        <div className="stat-strip-item">
          <div className="stat-strip-icon icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="stat-strip-info">
            <span className="stat-strip-val">10,000+</span>
            <span className="stat-strip-lbl">Books Cataloged</span>
          </div>
        </div>

        <div className="stat-strip-divider"></div>

        <div className="stat-strip-item">
          <div className="stat-strip-icon icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-strip-info">
            <span className="stat-strip-val">1,000+</span>
            <span className="stat-strip-lbl">Active Users</span>
          </div>
        </div>

        <div className="stat-strip-divider"></div>

        <div className="stat-strip-item">
          <div className="stat-strip-icon icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="6" height="6" rx="1"></rect>
              <rect x="15" y="3" width="6" height="6" rx="1"></rect>
              <rect x="3" y="15" width="6" height="6" rx="1"></rect>
              <path d="M15 15h2v2h-2z"></path>
            </svg>
          </div>
          <div className="stat-strip-info">
            <span className="stat-strip-val">Easy QR</span>
            <span className="stat-strip-lbl">Scanning Workflow</span>
          </div>
        </div>

        <div className="stat-strip-divider"></div>

        <div className="stat-strip-item">
          <div className="stat-strip-icon icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-strip-info">
            <span className="stat-strip-val">Smarter</span>
            <span className="stat-strip-lbl">Library Experience</span>
          </div>
        </div>
      </section>
    </div>
  );
}
