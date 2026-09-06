import React, { useState, useEffect } from 'react';
import LibNexusLogo from './LibNexusLogo';

export default function LandingPage({
  onEnterApp,
  onExploreStudent,
  onOpenLogin,
  books = [],
  stats
}) {
  const [activeSection, setActiveSection] = useState('hero');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fallback curated books if database collection is loading or empty
  const defaultBooks = [
    {
      id: 1,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Programming',
      total_copies: 5,
      available_copies: 3,
      status: 'Available'
    },
    {
      id: 2,
      title: 'Data Structures and Algorithm Analysis in C++',
      author: 'Mark Allen Weiss',
      isbn: '9780132847377',
      category: 'Computer Science',
      total_copies: 8,
      available_copies: 6,
      status: 'Available'
    },
    {
      id: 3,
      title: 'Operating System Concepts (10th Edition)',
      author: 'Abraham Silberschatz & Peter B. Galvin',
      isbn: '9781119800330',
      category: 'Computer Science',
      total_copies: 6,
      available_copies: 4,
      status: 'Available'
    },
    {
      id: 4,
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz & Henry F. Korth',
      isbn: '9780073523323',
      category: 'Database',
      total_copies: 7,
      available_copies: 2,
      status: 'Available'
    },
    {
      id: 5,
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell & Peter Norvig',
      isbn: '9780134610993',
      category: 'AI/ML',
      total_copies: 6,
      available_copies: 5,
      status: 'Available'
    },
    {
      id: 6,
      title: 'Computer Networks: A Systems Approach',
      author: 'Larry L. Peterson & Bruce S. Davie',
      isbn: '9780123850591',
      category: 'Networks',
      total_copies: 4,
      available_copies: 4,
      status: 'Available'
    }
  ];

  const displayBooks = books.length > 0 ? books : defaultBooks;

  // Filter books in catalog section
  const categoriesList = ['All', 'Computer Science', 'Programming', 'AI/ML', 'Database', 'Networks'];

  const filteredCatalogBooks = displayBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (book.isbn && book.isbn.includes(catalogSearch));
    const matchesCategory =
      selectedCategory === 'All' ||
      (book.category && book.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Smooth scroll handler for navbar links
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Observe active section on scroll
  useEffect(() => {
    const sectionIds = ['hero', 'features', 'catalog', 'about'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page-wrapper animate-fade-in">
      {/* Landing Navbar */}
      <nav className="landing-navbar">
        <div className="landing-nav-brand" onClick={(e) => handleNavClick(e, 'hero')} style={{ cursor: 'pointer' }}>
          <LibNexusLogo
            size={36}
            showText={true}
            variant="dark"
            subtitle="Library Platform"
          />
        </div>

        <div className="landing-nav-links">
          <a
            href="#hero"
            className={`landing-nav-link ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'hero')}
          >
            Home
          </a>
          <a
            href="#features"
            className={`landing-nav-link ${activeSection === 'features' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>
          <a
            href="#catalog"
            className={`landing-nav-link ${activeSection === 'catalog' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'catalog')}
          >
            Catalog
          </a>
          <a
            href="#about"
            className={`landing-nav-link ${activeSection === 'about' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
        </div>

        <div className="landing-nav-actions">
          <button className="btn-landing-login" onClick={onOpenLogin}>
            <span>Switch Role</span>
          </button>
          <button className="btn-landing-primary" onClick={() => onEnterApp('dashboard')}>
            <span>Enter Library &rarr;</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero-section" id="hero">
        <div className="hero-content-left">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Next-Generation LibNexus Platform</span>
          </div>

          <h1 className="hero-main-title">
            Knowledge Today<br />
            <span className="hero-highlight">A Better Tomorrow</span>
          </h1>

          <p className="hero-subtitle">
            LibNexus connects students, faculty, and administrators with frictionless book borrowing, instant QR circulation, and Athena AI.
            Seamless cataloging, live PostgreSQL synchronization, and Gemini AI assistance.
          </p>

          {/* 4 Feature Badges */}
          <div className="hero-feature-pills">
            <div className="hero-pill" onClick={(e) => handleNavClick(e, 'features')} style={{ cursor: 'pointer' }}>
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

            <div className="hero-pill" onClick={(e) => handleNavClick(e, 'catalog')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Track Books</span>
            </div>

            <div className="hero-pill" onClick={(e) => handleNavClick(e, 'features')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Smart Search</span>
            </div>

            <div className="hero-pill" onClick={(e) => handleNavClick(e, 'about')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="12 8 12 12 14 14"></polyline>
                <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
              </svg>
              <span>Real-time Records</span>
            </div>
          </div>

          <div className="hero-actions-row">
            <button className="btn-hero-cta" onClick={() => onEnterApp('dashboard')}>
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button
              className="btn-hero-secondary"
              onClick={onExploreStudent}
              title="Enter directly as Student Member"
            >
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
            <span className="stat-strip-val">{stats?.totalBooks ? `${stats.totalBooks}+` : '10,000+'}</span>
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

      {/* =========================================================================
          SECTION 2: FEATURES
          ========================================================================= */}
      <section className="landing-section landing-features-section" id="features">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <span className="badge-dot"></span>
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 className="landing-section-title">Everything You Need in a Modern Library</h2>
          <p className="landing-section-subtitle">
            Engineered from the ground up for lightning-fast book discovery, automated circulation,
            strict role segregation, and live database synchrony.
          </p>
        </div>

        <div className="landing-features-grid">
          {/* Feature 1 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                <rect x="3" y="15" width="6" height="6" rx="1"></rect>
                <path d="M15 15h2v2h-2z"></path>
                <path d="M19 15h2v6h-2z"></path>
                <path d="M15 19h2v2h-2z"></path>
              </svg>
            </div>
            <h3 className="feature-card-title">Dual-Mode QR Circulation</h3>
            <p className="feature-card-desc">
              Camera-based optical scanner on mobile phones paired with rapid keyboard lookups and database quick-chips on desktop workstations.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="feature-card-title">Role-Based Access Control</h3>
            <p className="feature-card-desc">
              Issuing, returning, adding, and modifying catalog records is strictly guarded for librarians. Students get a focused read-only borrowing view.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <h3 className="feature-card-title">Live PostgreSQL Synchronization</h3>
            <p className="feature-card-desc">
              Fully ACID-compliant transactions with immediate shelf quantity updates, zero data drift, and persistent history tracking.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="feature-card-title">Smart Natural Language Search</h3>
            <p className="feature-card-desc">
              Search by title, author, ISBN, or academic disciplines. Instant category filtering and fuzzy title matching across entire collections.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3 className="feature-card-title">Athena Gemini AI Assistant</h3>
            <p className="feature-card-desc">
              Built-in conversational assistant powered by Google Gemini to discover research literature, explain syllabus topics, and guide students.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="landing-feature-card">
            <div className="feature-card-icon icon-rose">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 className="feature-card-title">Automated Overdue Auditing</h3>
            <p className="feature-card-desc">
              Live overdue fine calculators, return deadline indicators, and instantaneous CSV data exports for circulation and inventory reports.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CATALOG
          ========================================================================= */}
      <section className="landing-section landing-catalog-section" id="catalog">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <span className="badge-dot"></span>
            <span>LIVE INVENTORY</span>
          </div>
          <h2 className="landing-section-title">Explore the Library Catalog</h2>
          <p className="landing-section-subtitle">
            Browse active holdings, inspect real-time shelf availability, and discover resources
            across computer science, engineering, and data disciplines.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="landing-catalog-toolbar">
          <div className="landing-catalog-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="landing-search-input"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="landing-search-clear"
              >
                &times;
              </button>
            )}
          </div>

          <div className="landing-category-pills">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`landing-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="landing-books-grid">
          {filteredCatalogBooks.slice(0, 6).map((book) => {
            const isAvailable = (book.available_copies ?? 1) > 0;
            return (
              <div key={book.id} className="landing-book-card">
                <div className="landing-book-card-top">
                  <span className="landing-book-category">{book.category || 'General'}</span>
                  <span className={`landing-book-badge ${isAvailable ? 'badge-available' : 'badge-issued'}`}>
                    {isAvailable ? `${book.available_copies ?? 1} Available` : 'Issued Out'}
                  </span>
                </div>

                <div className="landing-book-info">
                  <h4 className="landing-book-title">{book.title}</h4>
                  <p className="landing-book-author">by {book.author}</p>
                </div>

                <div className="landing-book-footer">
                  <span className="landing-book-isbn">ISBN: {book.isbn || 'N/A'}</span>
                  <button
                    className="landing-btn-book-action"
                    onClick={() => onEnterApp('books')}
                  >
                    View in Catalog
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCatalogBooks.length === 0 && (
          <div className="landing-catalog-empty">
            <p>No books match your search &ldquo;{catalogSearch}&rdquo; in {selectedCategory}.</p>
            <button
              className="btn-secondary-clean"
              onClick={() => {
                setCatalogSearch('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* CTA Callout */}
        <div className="landing-catalog-cta-card">
          <div className="catalog-cta-text">
            <h3>Looking for more titles or ready to borrow?</h3>
            <p>Access our complete circulation system or browse your borrowed items in the student portal.</p>
          </div>
          <div className="catalog-cta-buttons">
            <button className="btn-landing-primary" onClick={() => onEnterApp('books')}>
              <span>Open Full Catalog</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn-hero-secondary" onClick={onExploreStudent}>
              Explore as Student
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ABOUT
          ========================================================================= */}
      <section className="landing-section landing-about-section" id="about">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <span className="badge-dot"></span>
            <span>ABOUT THE SYSTEM</span>
          </div>
          <h2 className="landing-section-title">Bridging Academia with Modern Technology</h2>
          <p className="landing-section-subtitle">
            Our mission is to eliminate friction between learners and knowledge with automated,
            reliable, and transparent digital tools.
          </p>
        </div>

        <div className="landing-about-grid">
          <div className="landing-about-card">
            <div className="about-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Our Academic Mission</h3>
            <p>
              Knowledge should be accessible, organized, and effortlessly discoverable. We replace paper logs
              and cumbersome desk queues with instant barcode scanning, live search, and atomic inventory sync.
            </p>
          </div>

          <div className="landing-about-card highlight-card">
            <div className="about-icon icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Circulation Desk & Hours</h3>
            <div className="about-hours-list">
              <div className="hour-row">
                <span>Monday &ndash; Friday</span>
                <strong>8:00 AM &ndash; 9:00 PM</strong>
              </div>
              <div className="hour-row">
                <span>Saturday &ndash; Sunday</span>
                <strong>10:00 AM &ndash; 6:00 PM</strong>
              </div>
              <div className="hour-row">
                <span>Digital Search & AI</span>
                <span className="hour-tag-badge">24/7 Continuous</span>
              </div>
              <div className="hour-row">
                <span>Desk Location</span>
                <strong>Central Library, Level 1</strong>
              </div>
            </div>
          </div>

          <div className="landing-about-card">
            <div className="about-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Built for Every Device</h3>
            <p>
              Optimized for high-throughput librarian desktops as well as student mobile phones with dedicated
              optical camera scanning, touch navigation bars, and offline-resilient local caching.
            </p>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <LibNexusLogo
                size={34}
                showText={true}
                variant="light"
                subtitle="Next-Gen Library Platform"
              />
            </div>
            <p className="footer-tagline">
              LibNexus is an intelligent library management and circulation platform engineered for students, faculty, and academic librarians.
            </p>
            <div className="footer-system-status">
              <span className="status-indicator-dot online"></span>
              <span>PostgreSQL Synchronized &bull; Operational</span>
            </div>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-heading">Navigation</span>
            <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>Home</a>
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>Features</a>
            <a href="#catalog" onClick={(e) => handleNavClick(e, 'catalog')}>Catalog</a>
            <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-heading">Access Portals</span>
            <button type="button" className="footer-link-btn" onClick={onExploreStudent}>Student Portal</button>
            <button type="button" className="footer-link-btn" onClick={() => onEnterApp('dashboard')}>Librarian Console</button>
            <button type="button" className="footer-link-btn" onClick={onOpenLogin}>Account Switcher</button>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} LibNexus. All rights reserved.</p>
          <div className="footer-tech-stack">
            <span>React</span>
            <span>&bull;</span>
            <span>PostgreSQL</span>
            <span>&bull;</span>
            <span>Node.js</span>
            <span>&bull;</span>
            <span>Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
