-- NSCC Library Management System
-- Database Schema for PostgreSQL (library_db)

-- Create books table if not exists
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INTEGER NOT NULL DEFAULT 1 CHECK (available_quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table if not exists
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    student_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
