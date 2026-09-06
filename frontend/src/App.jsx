import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import BooksList from './components/BooksList';
import ScanQRView from './components/ScanQRView';
import MembersView from './components/MembersView';
import SmartSearchView from './components/SmartSearchView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import TransactionsList from './components/TransactionsList';
import BookModal from './components/BookModal';
import BookDetailsModal from './components/BookDetailsModal';
import IssueBookModal from './components/IssueBookModal';
import LoginModal from './components/LoginModal';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import Toast from './components/Toast';
import { api } from './api/api';
import { exportTransactionsToCsv } from './utils/csvExport';
import './App.css';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('app'); // 'landing' | 'app'
  const [userRole, setUserRole] = useState('librarian'); // 'librarian' | 'student'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States from PostgreSQL
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Global & Module Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('All Books');
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('all');

  // Modals States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [presetBook, setPresetBook] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBookDetails, setSelectedBookDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // 1. Fetch Dashboard Stats
  const loadDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
        setIsBackendOnline(true);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setIsBackendOnline(false);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Books with Filters
  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const res = await api.getBooks({
        search: bookSearch || globalSearch,
        category: selectedCategory,
        availability: availabilityFilter
      });
      if (res.success) {
        setBooks(res.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast(err.message || 'Failed to fetch books from database', 'error');
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearch, globalSearch, selectedCategory, availabilityFilter]);

  // 3. Fetch Distinct Categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // 4. Fetch Transactions
  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const res = await api.getTransactions({
        search: txSearch,
        status: txStatusFilter
      });
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [txSearch, txStatusFilter]);

  // Initial Load & Synchronizations
  useEffect(() => {
    loadDashboardStats();
    loadCategories();
  }, [loadDashboardStats, loadCategories]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refreshAllData = () => {
    loadDashboardStats();
    loadBooks();
    loadCategories();
    loadTransactions();
  };

  // Actions (Restricted to librarian)
  const handleOpenAddBook = () => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff are authorized to add books.', 'error');
      return;
    }
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book) => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff are authorized to edit books.', 'error');
      return;
    }
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (formData) => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff can save catalog changes.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (bookToEdit) {
        const res = await api.updateBook(bookToEdit.id, formData);
        showToast(res.message || 'Book updated successfully');
      } else {
        const res = await api.createBook(formData);
        showToast(res.message || 'Book registered into catalog successfully');
      }
      setIsBookModalOpen(false);
      setBookToEdit(null);
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Error saving book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (book) => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff can delete books.', 'error');
      return;
    }
    const isLent = book.available_quantity < book.quantity;
    if (isLent) {
      showToast(`Cannot delete "${book.title}": Copies are currently lent to students`, 'error');
      return;
    }
    const confirm = window.confirm(`Are you sure you want to remove "${book.title}" from library catalog?`);
    if (!confirm) return;

    try {
      const res = await api.deleteBook(book.id);
      showToast(res.message || 'Book deleted successfully');
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    }
  };

  const handleViewBookDetails = async (bookId) => {
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.getBookById(bookId);
      if (res.success) {
        setSelectedBookDetails(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load book specifications', 'error');
      setIsDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenIssueBook = () => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff are authorized to issue books.', 'error');
      return;
    }
    setPresetBook(null);
    setIsIssueModalOpen(true);
  };

  const handleIssueBookWithPreset = (book) => {
    if (userRole === 'student') {
      showToast('Action restricted: Only library staff are authorized to issue books.', 'error');
      return;
    }
    setPresetBook(book);
    setIsIssueModalOpen(true);
  };

  const handleIssueBook = async (issueData) => {
    if (userRole === 'student') {
      showToast('Action restricted: Students cannot issue books directly.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.issueBook(issueData);
      showToast(res.message || 'Book issued successfully');
      setIsIssueModalOpen(false);
      setPresetBook(null);
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Failed to issue book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnBook = async (transactionId) => {
    if (userRole === 'student') {
      showToast('Action restricted: Returns must be processed at the library desk.', 'error');
      return;
    }
    const confirm = window.confirm('Confirm return of this book to shelf stock?');
    if (!confirm) return;

    try {
      const res = await api.returnBook(transactionId);
      showToast(res.message || 'Book returned successfully');
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Failed to process return', 'error');
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast('No circulation records to export', 'error');
      return;
    }
    const success = exportTransactionsToCsv(transactions);
    if (success) {
      showToast('Circulation history exported to CSV successfully');
    }
  };

  // If user selected Landing Page view mode (Screen 1 from mockup)
  if (viewMode === 'landing') {
    return (
      <div className="landing-view-root">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LandingPage
          onEnterApp={(targetTab = 'dashboard') => {
            setActiveTab(targetTab);
            setViewMode('app');
          }}
          onExploreStudent={() => {
            setUserRole('student');
            setActiveTab('members');
            setViewMode('app');
            showToast('Welcome to the Student Portal!');
          }}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          books={books}
          stats={stats}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          userRole={userRole}
          onLoginSuccess={(role) => {
            setUserRole(role);
            setViewMode('app');
            showToast(`Logged in as ${role === 'student' ? 'Student Member' : 'Librarian'}`);
          }}
        />
      </div>
    );
  }

  // App Layout (Sidebar + TopHeader + Views matching mockup)
  return (
    <div className="app-portal-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onViewLandingPage={() => setViewMode('landing')}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Body */}
      <div className="app-main-viewport">
        {/* Top Header */}
        <TopHeader
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          userRole={userRole}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenAi={() => setIsAiOpen(true)}
          isBackendOnline={isBackendOnline}
          onQuickNavigate={(tab) => setActiveTab(tab)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Scrollable View Content */}
        <main className="app-view-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={loadingStats}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddBook={handleOpenAddBook}
              onOpenIssueBook={handleOpenIssueBook}
              onReturnBook={handleReturnBook}
              transactions={transactions}
            />
          )}

          {activeTab === 'books' && (
            <BooksList
              books={books}
              categories={categories}
              loading={loadingBooks}
              searchQuery={bookSearch}
              onSearch={setBookSearch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              availabilityFilter={availabilityFilter}
              onAvailabilityChange={setAvailabilityFilter}
              onOpenAddBook={handleOpenAddBook}
              onViewBookDetails={handleViewBookDetails}
              onEditBook={handleOpenEditBook}
              onDeleteBook={handleDeleteBook}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              userRole={userRole}
            />
          )}

          {activeTab === 'scan-qr' && (
            <ScanQRView
              books={books}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              onReturnBook={handleReturnBook}
              onViewBookDetails={handleViewBookDetails}
              transactions={transactions}
              userRole={userRole}
            />
          )}

          {activeTab === 'issue-return' && (
            <ScanQRView
              books={books}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              onReturnBook={handleReturnBook}
              onViewBookDetails={handleViewBookDetails}
              transactions={transactions}
              userRole={userRole}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsList
              transactions={transactions}
              loading={loadingTransactions}
              statusFilter={txStatusFilter}
              onStatusChange={setTxStatusFilter}
              searchQuery={txSearch}
              onSearch={setTxSearch}
              onReturnBook={handleReturnBook}
              onOpenIssueBook={handleOpenIssueBook}
              onExportCsv={handleExportCsv}
              userRole={userRole}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              transactions={transactions}
              onReturnBook={handleReturnBook}
              onOpenIssueBook={handleOpenIssueBook}
              userRole={userRole}
            />
          )}

          {activeTab === 'search-books' && (
            <SmartSearchView
              books={books}
              categories={categories}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              onViewBookDetails={handleViewBookDetails}
              userRole={userRole}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              books={books}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              isBackendOnline={isBackendOnline}
              userRole={userRole}
              setUserRole={setUserRole}
              onOpenAi={() => setIsAiOpen(true)}
            />
          )}
        </main>
      </div>

      {/* AI Assistant Drawer (Athena) */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onOpenIssueBookWithPreset={handleIssueBookWithPreset}
        onViewBookDetails={handleViewBookDetails}
      />

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSave={handleSaveBook}
        bookToEdit={bookToEdit}
        isSubmitting={isSubmitting}
      />

      <BookDetailsModal
        isOpen={isDetailsModalOpen}
        bookDetails={selectedBookDetails}
        loading={loadingDetails}
        onClose={() => setIsDetailsModalOpen(false)}
        onIssueThisBook={handleIssueBookWithPreset}
        onEditThisBook={handleOpenEditBook}
        userRole={userRole}
      />

      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssue={handleIssueBook}
        books={books}
        presetBook={presetBook}
        isSubmitting={isSubmitting}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        userRole={userRole}
        onLoginSuccess={(role) => {
          setUserRole(role);
          showToast(`Logged in as ${role === 'student' ? 'Student Member' : 'Librarian'}`);
        }}
      />

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet viewports) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          aria-label="Dashboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
          aria-label="Books"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Books</span>
        </button>

        <button
          className={`mobile-nav-item mobile-nav-scan ${activeTab === 'scan-qr' || activeTab === 'issue-return' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan-qr')}
          aria-label="Scan QR Code"
        >
          <div className="mobile-scan-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="15" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="15" width="6" height="6" rx="1" />
              <line x1="15" y1="15" x2="21" y2="15" />
              <line x1="15" y1="21" x2="21" y2="21" />
              <line x1="18" y1="15" x2="18" y2="21" />
            </svg>
          </div>
          <span>Scan QR</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
          aria-label="Circulation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span>Activity</span>
        </button>

        <button
          className={`mobile-nav-item ${isAiOpen ? 'active' : ''}`}
          onClick={() => setIsAiOpen(true)}
          aria-label="AI Assistant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.11L3 22l1.11-4.413A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z"></path>
            <circle cx="8" cy="12" r="1.5" fill="currentColor"></circle>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
            <circle cx="16" cy="12" r="1.5" fill="currentColor"></circle>
          </svg>
          <span>AI Chat</span>
        </button>
      </nav>
    </div>
  );
}
