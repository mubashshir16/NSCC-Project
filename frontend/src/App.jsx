import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BooksList from './components/BooksList';
import TransactionsList from './components/TransactionsList';
import BookModal from './components/BookModal';
import BookDetailsModal from './components/BookDetailsModal';
import IssueBookModal from './components/IssueBookModal';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import Toast from './components/Toast';
import { api } from './api/api';
import { exportTransactionsToCsv } from './utils/csvExport';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Books Filter States
  const [bookSearch, setBookSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('All Books');

  // Transactions Filter States
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

  // AI Assistant Drawer State
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [isBackendOnline, setIsBackendOnline] = useState(true);

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
        search: bookSearch,
        category: selectedCategory,
        availability: availabilityFilter
      });
      if (res.success) {
        setBooks(res.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast(err.message || 'Failed to fetch books', 'error');
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearch, selectedCategory, availabilityFilter]);

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

  // 4. Fetch Transactions with Filters
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
      showToast(err.message || 'Failed to fetch transactions', 'error');
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

  // Refresh everything helper
  const refreshAllData = () => {
    loadDashboardStats();
    loadBooks();
    loadCategories();
    loadTransactions();
  };

  // ==================== ACTIONS ====================

  // Open Add Book Modal
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  // Open Edit Book Modal
  const handleOpenEditBook = (book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  // Save Book (Add or Edit)
  const handleSaveBook = async (formData) => {
    setIsSubmitting(true);
    try {
      if (bookToEdit) {
        const res = await api.updateBook(bookToEdit.id, formData);
        showToast(res.message || 'Book updated successfully');
      } else {
        const res = await api.createBook(formData);
        showToast(res.message || 'Book added to library successfully');
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

  // Delete Book
  const handleDeleteBook = async (book) => {
    const isLent = book.available_quantity < book.quantity;
    if (isLent) {
      showToast(`Cannot delete "${book.title}": Copies are currently lent to students`, 'error');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete "${book.title}" from the library catalog?`);
    if (!confirm) return;

    try {
      const res = await api.deleteBook(book.id);
      showToast(res.message || 'Book deleted successfully');
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    }
  };

  // View Book Details
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

  // Open Issue Modal (General or Preset)
  const handleOpenIssueBook = () => {
    setPresetBook(null);
    setIsIssueModalOpen(true);
  };

  const handleIssueBookWithPreset = (book) => {
    setPresetBook(book);
    setIsIssueModalOpen(true);
  };

  // Process Issue Book
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

  // Process Return Book
  const handleReturnBook = async (transactionId) => {
    const confirm = window.confirm('Confirm return of this book to library shelf stock?');
    if (!confirm) return;

    try {
      const res = await api.returnBook(transactionId);
      showToast(res.message || 'Book returned successfully');
      refreshAllData();
    } catch (err) {
      showToast(err.message || 'Failed to process return', 'error');
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast('No circulation records to export', 'error');
      return;
    }
    const success = exportTransactionsToCsv(transactions);
    if (success) {
      showToast('Circulation report exported to CSV successfully');
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddBook={handleOpenAddBook}
        onOpenIssueBook={handleOpenIssueBook}
        onOpenAi={() => setIsAiOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Content Area */}
      <main className="content-container">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            loading={loadingStats}
            isBackendOnline={isBackendOnline}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddBook={handleOpenAddBook}
            onOpenIssueBook={handleOpenIssueBook}
            onReturnBook={handleReturnBook}
            onExportCsv={handleExportCsv}
            onOpenAi={() => setIsAiOpen(true)}
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
      </main>

      {/* Floating AI Librarian Launcher */}
      {!isAiOpen && (
        <button
          className="floating-ai-btn"
          onClick={() => setIsAiOpen(true)}
          title="Open Athena, your AI Librarian Assistant"
        >
          <span className="sparkle-ai">✨</span>
          <span className="ai-btn-text">Ask AI Librarian</span>
          <span className="ai-live-badge">Online</span>
        </button>
      )}

      {/* Footer */}
      <footer className="footer-container">
        <p>NSCC Library Management System &bull; Powered by React, Node.js &amp; PostgreSQL (library_db)</p>
      </footer>

      {/* AI Assistant Drawer */}
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
    </div>
  );
}