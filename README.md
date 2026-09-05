# 📚 NSCC Library Management System

A full-stack, enterprise-grade Library Management and Circulation System designed for modern academic institutions. Built with **React 18**, **Node.js**, **Express**, and **PostgreSQL**.

---

## 🌟 Key Features

### 1. 📊 Executive Admin Dashboard
- **Real-Time Institutional Metrics**: Total Books, Available Inventory, Active Loans, and Overdue Returns.
- **Overdue Tracking Engine**: Automated overdue detection based on 14-day standard academic loan cycles.
- **Active Loan Auditing**: Dedicated table of currently borrowed books with real-time student contact/ID info and overdue duration calculation.

### 2. 📖 Books Catalog & Inventory Control
- Complete catalog management (Title, Author, ISBN, Category, Total Quantity, Available Copies).
- Search and filtering across titles, authors, and genres.
- Full transactional safety (automatic quantity decrement on checkout, increment on return).
- Safe stock prevention (prevents issuing books with zero stock).

### 3. 🔄 Circulation & Transaction Management
- Standard 14-day checkout cycles with automated due date tracking.
- One-click book returns with immediate inventory synchronization.
- **Audit-Ready Data Export**: RFC 4180-compliant CSV export containing comprehensive transaction records, timestamps, and return status.

### 4. 🤖 AI-Powered Library Assistant ("Athena")
- **Conversational Library Help**: Answers student queries about library catalog, borrowing policies, and operating hours.
- **Automated Book Categorization**: Analyzes book titles/descriptions to recommend appropriate library classifications.
- **Smart Recommendations**: Suggests relevant academic reading materials based on topics and course disciplines.

### 5. 🎨 Modern & Responsive Design
- Frosted-glass aesthetics (Glassmorphism), subtle depth, and responsive grid layouts.
- Built-in live API status heartbeat indicator in the navigation header.
- Interactive modal dialogs, status badges, and smooth CSS micro-interactions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js, CORS, Dotenv |
| **Database** | PostgreSQL, \pg\ (node-postgres connection pool) |
| **AI Layer** | Built-in Intelligent Classification & Recommendation Engine |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### 1. Database Setup
1. Create a PostgreSQL database named \library_db\:
   \\\sql
   CREATE DATABASE library_db;
   \\\
2. Run the database schema and seed script:
   \\\ash
   psql -U postgres -d library_db -f backend/database/schema.sql
   psql -U postgres -d library_db -f backend/database/seed.sql
   \\\

### 2. Backend Setup
1. Navigate to the backend directory:
   \\\ash
   cd backend
   \\\
2. Install dependencies:
   \\\ash
   npm install
   \\\
3. Configure environment variables in \.env\:
   \\\env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=library_db
   \\\
4. Start the backend server:
   \\\ash
   npm run dev
   # Server runs on http://localhost:5000
   \\\

### 3. Frontend Setup
1. Navigate to the frontend directory:
   \\\ash
   cd ../frontend
   \\\
2. Install dependencies:
   \\\ash
   npm install
   \\\
3. Start the Vite development server:
   \\\ash
   npm run dev
   # App runs on http://localhost:5173
   \\\

---

## 📡 REST API Reference

### Books API (\/api/books\)
- \GET /api/books\ - Retrieve all books (supports \?search=\ query parameter)
- \GET /api/books/:id\ - Retrieve specific book details
- \POST /api/books\ - Add a new book to the library catalog
- \PUT /api/books/:id\ - Update existing book information
- \DELETE /api/books/:id\ - Remove a book from the catalog

### Transactions API (\/api/transactions\)
- \GET /api/transactions\ - Retrieve full circulation history
- \POST /api/transactions/issue\ - Issue a book to a student
- \POST /api/transactions/return/:id\ - Return an issued book
- \GET /api/transactions/stats\ - Retrieve executive dashboard circulation metrics
- \GET /api/transactions/export\ - Export complete circulation records as RFC 4180 CSV

### AI Assistant API (\/api/ai\)
- \POST /api/ai/chat\ - Interactive conversation with Library Assistant Athena
- \POST /api/ai/categorize\ - Suggest book category based on title and summary
- \POST /api/ai/recommend\ - Suggest books based on user interests

---

## 📄 License
This project was developed for the NSCC Library Management initiative.
