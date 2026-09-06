require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production" || process.env.DB_SSL === "true" || !!process.env.DATABASE_URL;

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction && !process.env.DATABASE_URL.includes("localhost")
            ? { rejectUnauthorized: false }
            : false
    }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "library_db",
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || "5432", 10),
        ssl: isProduction && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1"
            ? { rejectUnauthorized: false }
            : false
    };

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err);
});

// Auto-initialize schema and seed data on startup (idempotent)
const initDatabase = async () => {
    try {
        await pool.query(`
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

            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
                student_name VARCHAR(255) NOT NULL,
                student_id VARCHAR(100) NOT NULL,
                issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
                return_date DATE,
                returned_at TIMESTAMP,
                status VARCHAR(50) NOT NULL DEFAULT 'issued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
            CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
            CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON transactions(student_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

            INSERT INTO books (title, author, isbn, category, quantity, available_quantity)
            VALUES
                ('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 'Computer Science', 5, 5),
                ('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 4, 4),
                ('Database System Concepts', 'Abraham Silberschatz, Henry F. Korth', '978-0073523323', 'Computer Science', 6, 6),
                ('Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0136042594', 'Artificial Intelligence', 3, 3),
                ('Operating System Concepts', 'Abraham Silberschatz, Peter B. Galvin', '978-1118063330', 'Computer Science', 4, 4),
                ('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm', '978-0201633610', 'Software Engineering', 3, 3),
                ('Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', '978-0133594140', 'Networking', 5, 5),
                ('Digital Logic and Computer Design', 'M. Morris Mano', '978-0132145107', 'Electronics', 4, 4),
                ('Higher Engineering Mathematics', 'B.S. Grewal', '978-8174091955', 'Mathematics', 8, 8),
                ('Principles of Management', 'Harold Koontz, Heinz Weihrich', '978-0070682139', 'Management', 3, 3)
            ON CONFLICT (isbn) DO NOTHING;
        `);
        console.log("PostgreSQL database tables and seed data verified successfully.");
    } catch (err) {
        console.error("Warning: Database auto-initialization check:", err.message);
    }
};

initDatabase();

module.exports = pool;