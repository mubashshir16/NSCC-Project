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

  // Actions
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (formData) => {
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
    setPresetBook(null);
    setIsIssueModalOpen(true);
  };

  const handleIssueBookWithPreset = (book) => {
    setPresetBook(book);
    setIsIssueModalOpen(true);
  };

  const handleIssueBook = async (issueData) => {
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
          onEnterApp={() => setViewMode('app')}
          onOpenLogin={() => setIsLoginModalOpen(true)}
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
            />
          )}

          {activeTab === 'scan-qr' && (
            <ScanQRView
              books={books}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              onReturnBook={handleReturnBook}
              onViewBookDetails={handleViewBookDetails}
              transactions={transactions}
            />
          )}

          {activeTab === 'issue-return' && (
            <ScanQRView
              books={books}
              onIssueBookWithPreset={handleIssueBookWithPreset}
              onReturnBook={handleReturnBook}
              onViewBookDetails={handleViewBookDetails}
              transactions={transactions}
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
    </div>
  );
}
