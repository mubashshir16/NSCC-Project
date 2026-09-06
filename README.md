# 📚 Library Book Issue & Return Management System

A modern, full-stack, enterprise-grade **Library Management and Circulation System** engineered to streamline book cataloging, circulation tracking, optical QR code issuance, and automated overdue management. Built with **React 19**, **Node.js / Express**, **PostgreSQL**, and **Google Gemini AI**.

---

## 📑 Table of Contents
1. [Overview & Objectives](#-overview--objectives)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
3. [Features Implemented](#-features-implemented)
   - [Librarian Circulation & Catalog](#1-librarian-side--catalog-management)
   - [Dual-Mode QR Code System](#2-dual-mode-qr-code-generation--scanning)
   - [Backend Core & Atomic Transactions](#3-backend-core--atomic-transactions)
   - [Admin Dashboard & Brownie Subtasks](#4-admin-dashboard--brownie-subtasks)
   - [Data Export (RFC 4180 CSV)](#5-data-export-rfc-4180-csv)
   - [AI Capabilities (Athena & Smart Search)](#6-optional-ai-features-gemini-ai)
   - [Student Member Portal & Strict RBAC](#7-student-member-portal--strict-rbac)
4. [REST API Documentation](#-rest-api-documentation)
5. [Setup & Running Instructions](#-setup--running-instructions)
   - [Prerequisites](#prerequisites)
   - [1. Database Configuration (PostgreSQL)](#1-database-configuration-postgresql)
   - [2. Backend Setup](#2-backend-setup)
   - [3. Frontend Setup](#3-frontend-setup)
6. [Important Implementation Decisions](#-important-implementation-decisions)
7. [Concepts Learned & Engineering Highlights](#-concepts-learned--engineering-highlights)
8. [Submission Checklist](#-submission-checklist)

---

## 🎯 Overview & Objectives

The primary objective of this project is to eliminate paper-based logs, prevent stock inaccuracies, and accelerate library circulation using:
- **Optical QR Code Workflows**: Instant camera-based scanning on mobile devices and keyboard-first lookups on librarian desktop workstations.
- **Accurate Real-Time Inventory**: Atomic ACID database transactions that update shelf availability immediately upon checkout and return.
- **Role-Based Access Control (RBAC)**: Clear, auditable boundary between Librarian administrative powers and Student self-service borrowing visibility.
- **AI-Powered Discovery**: Integrated Google Gemini AI to assist students with curriculum reading recommendations and librarians with automated book classification.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Key Responsibilities |
|---|---|---|
| **Frontend** | React 19, Vite 8, Vanilla CSS3 | SPA architecture, responsive layout, camera optical scanner, QR label rendering, smooth transitions |
| **Backend** | Node.js, Express.js 5 | RESTful API routes, concurrency locking, CSV generation, Gemini AI controller |
| **Database** | PostgreSQL 14+, `pg` pool | Relational schema, ACID transactions (`BEGIN ... FOR UPDATE ... COMMIT`), date arithmetic |
| **AI Layer** | Google GenAI SDK (`@google/genai`) | Gemini 1.5 / 2.0 Flash models for conversational assistance, semantic categorization, and syllabus search |
| **QR Engine** | `qrcode` (SVG/Canvas), `BarcodeDetector` / `getUserMedia` | Unique QR generation, shelf sticker printing, optical video frame detection |

---

## 🌟 Features Implemented

### 1. 📖 Librarian Side — Catalog Management
- **Complete Book Records**: Maintain Book Title, Author, ISBN / Catalog ID, Category, Total Copies, and Available Copies.
- **Real-Time Status Indicators**: Automatic status calculation — `Available` (green badge), `Low Stock` (amber badge), or `Out of Stock` / `Issued` (red badge).
- **Search & Multi-Level Filtering**: Search books by title, author, or ISBN; filter by Category (Computer Science, Programming, AI/ML, Databases, etc.) and Shelf Availability.
- **CSV Catalog Import**: Built-in CSV parser to ingest batch book records into the system.

### 2. 📷 Dual-Mode QR Code Generation & Scanning
- **Unique QR Code Generation**:
  - Each book automatically receives a unique QR code encoded with its identifiers (`{"id": book.id, "isbn": book.isbn, "title": book.title}`).
  - **Downloadable PNG**: Librarians can download high-resolution QR codes with one click.
  - **Printable Shelf Stickers**: Built-in "Print Shelf Sticker" dialog formatted with the book title, author, ISBN, and QR code ready for physical book spines.
- **Dual-Mode Scanner (`ScanQRView`)**:
  - **Mobile Mode (Hardware Camera)**: Utilizes `navigator.mediaDevices.getUserMedia` with rear camera priority (`facingMode: 'environment'`) and HTML5 `BarcodeDetector` API for optical barcode scanning with laser beam animation.
  - **Laptop / Desktop Mode (Keyboard Search)**: High-speed manual lookup accepting Book ID, ISBN, or Title with direct database quick-chips for 1-click circulation.
  - **Instant Issue & Return via QR**: Scanning a book reveals real-time shelf status, borrower history, and 1-click Issue / Return buttons.

### 3. ⚙️ Backend Core & Atomic Transactions
- **Concurrency & Race Condition Prevention**:
  - Every issue and return operation uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) wrapped inside an atomic transaction (`BEGIN ... COMMIT / ROLLBACK`).
- **Inventory Safety**:
  - Strictly prevents issuing a book when `available_quantity <= 0`.
  - Prevents duplicate active checkouts of the same book title to the same student ID.
  - Prevents invalid return operations on books that are already returned.
- **Complete Audit Trail**:
  - Maintains full transaction history with student name, student ID, issue timestamp, return timestamp, due date (14-day standard loan cycle), and days overdue.

### 4. 📊 Admin Dashboard & Brownie Subtasks (★)
- **Executive Metric Cards**: Total Books, Available Inventory, Issued Books, and Overdue Books with real-time PostgreSQL synchronization.
- **List of Currently Issued Books**: Dedicated tab displaying active loans with borrower name, student ID, issue date, and due date.
- **Bonus — Overdue Days Engine**:
  - Calculates exact overdue duration: `CURRENT_DATE - (issue_date + 14 days)`.
  - Displays color-coded alert badges (`⚠️ 5 days overdue` vs `✓ On Track`).
- **Hourly Activity Analytics**: Dual-bar chart visualizing today's issue vs return volume across operating hours.

### 5. 📁 Data Export (RFC 4180 CSV)
- Complete issue/return history export available in both frontend and backend:
  - **Columns included**: `Transaction ID`, `Book ID`, `Book Title`, `Author`, `ISBN`, `Issued To (Name)`, `Issued To (Student ID)`, `Issue Date`, `Due Date`, `Return Date`, `Current Status`, `Days Overdue`.
  - Proper RFC 4180 CSV escaping, UTF-8 BOM encoding for Excel compatibility, and automated timestamped filenames (`Library_Circulation_YYYY-MM-DD.csv`).

### 6. 🤖 Optional AI Features (Gemini AI) (★)
- **Athena Library Assistant**: Interactive conversational drawer powered by Google Gemini to answer questions on library policies, catalog holdings, and citation styles.
- **Smart Natural Language Search**: Allows students and faculty to search books using conversational prompts (e.g., *"books about distributed consensus algorithms"*).
- **Automated Book Categorization**: Automatically suggests the most accurate academic genre and Dewey/LC classification when librarians enter a book title.

### 7. 🛡️ Student Member Portal & Strict RBAC
- **Strict Role-Based Segregation**:
  - **Librarians**: Full administrative power to add books, edit catalog items, issue loans, process returns, and delete records.
  - **Students**: Dedicated, focused read-only view ("My Books") showing their currently borrowed items, due dates, and front-desk return notices.
  - **App-Level Defense-in-Depth**: Every mutation handler verifies `userRole` and blocks unauthorized calls with error toasts.

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Books API (`/api/books`)
| Method | Endpoint | Description | Request Body / Query |
|---|---|---|---|
| `GET` | `/api/books` | Retrieve all books with real-time availability | `?search=clean` |
| `GET` | `/api/books/:id` | Get book specifications and lending history | None |
| `POST` | `/api/books` | Add a new book record | `{ title, author, isbn, category, quantity }` |
| `PUT` | `/api/books/:id` | Update existing book information | `{ title, author, isbn, category, quantity }` |
| `DELETE` | `/api/books/:id` | Remove a book from the catalog | None |

### 2. Transactions & Circulation API (`/api/transactions`)
| Method | Endpoint | Description | Request Body / Query |
|---|---|---|---|
| `GET` | `/api/transactions` | Retrieve all transactions with filters | `?status=all&search=arjun` |
| `POST` | `/api/transactions/issue` | Issue a book copy to a student | `{ book_id, student_name, student_id }` |
| `POST` | `/api/transactions/return/:id`| Process return of an issued loan | None |
| `GET` | `/api/transactions/stats` | Executive dashboard metrics & active loans | None |
| `GET` | `/api/transactions/export` | Download complete circulation history as CSV | Attachment download |

### 3. AI Assistant API (`/api/ai`)
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Chat with Athena Library Assistant | `{ message, conversationHistory }` |
| `POST` | `/api/ai/categorize` | Auto-suggest book genre/category | `{ title, author }` |
| `POST` | `/api/ai/recommend` | Natural language book recommendations | `{ query, category }` |

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Node.js** (v18.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

---

### 1. Database Configuration (PostgreSQL)

1. Open PostgreSQL prompt or pgAdmin:
   ```sql
   CREATE DATABASE library_db;
   ```

2. Run the database schema and seed scripts:
   ```bash
   # From the project root:
   psql -U postgres -d library_db -f backend/database/schema.sql
   psql -U postgres -d library_db -f backend/database/seed.sql
   ```
   *The schema sets up indexed tables for `books` and `transactions` with foreign key constraints, checked quantities, and automated timestamp triggers.*

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create or update your `.env` configuration file in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=library_db
   GEMINI_API_KEY=your_gemini_api_key_optional
   ```

4. Start the backend server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Application opens at http://localhost:5173
   ```

4. Verify production build:
   ```bash
   npm run build
   # Builds optimized static bundle in dist/
   ```

---

## 💡 Important Implementation Decisions

1. **PostgreSQL Row-Level Locking (`FOR UPDATE`)**:
   In high-throughput library circulation desks, multiple librarians could attempt to issue the last available copy of a popular textbook simultaneously. To eliminate race conditions, checkout operations lock the target book row (`SELECT ... FOR UPDATE`), verify available stock, decrement inventory, and insert the transaction within a single atomic commit.

2. **Dual-Mode QR Architecture**:
   Laptops and desktop PCs rarely have rear-facing autofocus cameras, making barcode scanning cumbersome. The application detects viewport width and hardware capabilities:
   - On mobile screens, it defaults to the optical video viewfinder with camera toggle (`front` vs `environment`).
   - On desktop workstations, it activates an instant keyboard lookup bar with database quick-chips.

3. **Client-Side QR Code Generation & SVG Rendering**:
   Rather than storing static image files on disk or relying on third-party image APIs, unique QR codes are generated dynamically using the `qrcode` engine. This enables offline operation, zero server storage overhead, and high-DPI label printing.

4. **Defense-in-Depth Role-Based Access Control**:
   Role permissions are checked both in the UI presentation layer (hiding action buttons for student profiles) and in application dispatch handlers (`handleOpenAddBook`, `handleIssueBook`, `handleReturnBook`), rejecting unauthorized operations with informative warning toasts.

---

## 🧠 Concepts Learned & Engineering Highlights

- **ACID Concurrency Control**: Designing database transactions that maintain total inventory integrity across concurrent issue and return requests.
- **HTML5 Camera Stream & Optical Barcode Detection**: Interfacing with `navigator.mediaDevices.getUserMedia` and `BarcodeDetector` with fallbacks for unsupported browsers.
- **Google Gemini Multi-turn Integration**: Utilizing the `@google/genai` SDK to supply library catalog context to the model for accurate syllabus-aligned book suggestions.
- **Dynamic CSS & Print Media Styling**: Structuring print stylesheets to generate physical shelf sticker labels containing title, author, ISBN, and QR code.

---

## ✅ Submission Checklist

- [x] Complete source code pushed to GitHub repository
- [x] Real-time PostgreSQL database synchronization with transaction logs
- [x] Unique QR code generation for each book with print label functionality
- [x] Camera-based optical QR code scanner + desktop manual search
- [x] Issue & return processing via QR scanning
- [x] Available vs Issued status tracking with stock decrement/increment
- [x] Search and multi-category filters
- [x] CSV data export with all required fields
- [x] Admin Dashboard with metrics, currently issued books, and overdue days calculation
- [x] AI-powered smart search, conversational assistant, and auto-categorization
- [x] Comprehensive, well-documented README explaining every aspect of the project

---

*Engineered with precision for modern academic libraries.*
