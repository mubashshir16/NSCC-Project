const pool = require("../config/db");

// Standard loan duration in days
const LOAN_DURATION_DAYS = 14;

// Get all transactions with book details, overdue calculations, and filtering
const getTransactions = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        let query = `
            SELECT 
                t.id,
                t.book_id,
                t.student_name,
                t.student_id,
                TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
                TO_CHAR(t.issue_date + INTERVAL '${LOAN_DURATION_DAYS} days', 'YYYY-MM-DD') AS due_date,
                TO_CHAR(t.return_date, 'YYYY-MM-DD') AS return_date,
                CASE 
                    WHEN t.status = 'issued' AND CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS}) 
                    THEN (CURRENT_DATE - (t.issue_date + ${LOAN_DURATION_DAYS}))
                    ELSE 0 
                END AS days_overdue,
                CASE 
                    WHEN t.status = 'issued' AND CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS}) 
                    THEN TRUE 
                    ELSE FALSE 
                END AS is_overdue,
                t.status,
                t.created_at,
                b.title AS book_title,
                b.author AS book_author,
                b.isbn
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status && status !== "all") {
            if (status.toLowerCase() === "overdue") {
                query += ` AND t.status = 'issued' AND CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS})`;
            } else {
                query += ` AND t.status = $${paramIndex}`;
                params.push(status.toLowerCase());
                paramIndex++;
            }
        }

        if (search && search.trim()) {
            query += ` AND (
                t.student_name ILIKE $${paramIndex} OR 
                t.student_id ILIKE $${paramIndex} OR 
                b.title ILIKE $${paramIndex} OR 
                b.isbn ILIKE $${paramIndex}
            )`;
            params.push(`%${search.trim()}%`);
            paramIndex++;
        }

        query += " ORDER BY t.id DESC";

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Export transactions as CSV
const exportTransactions = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                t.id,
                t.book_id,
                b.title AS book_title,
                b.author AS book_author,
                b.isbn,
                t.student_name,
                t.student_id,
                TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
                TO_CHAR(t.issue_date + INTERVAL '${LOAN_DURATION_DAYS} days', 'YYYY-MM-DD') AS due_date,
                TO_CHAR(t.return_date, 'YYYY-MM-DD') AS return_date,
                t.status,
                CASE 
                    WHEN t.status = 'issued' AND CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS}) 
                    THEN (CURRENT_DATE - (t.issue_date + ${LOAN_DURATION_DAYS}))
                    ELSE 0 
                END AS days_overdue
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            ORDER BY t.id DESC
        `;

        const result = await pool.query(query);

        // Build CSV
        const headers = [
            "Transaction ID",
            "Book ID",
            "Book Title",
            "Author",
            "ISBN",
            "Issued To (Name)",
            "Issued To (Student ID)",
            "Issue Date",
            "Due Date",
            "Return Date",
            "Current Status",
            "Days Overdue"
        ];

        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = result.rows.map(r => [
            escapeCsv(r.id),
            escapeCsv(r.book_id),
            escapeCsv(r.book_title || "Unknown"),
            escapeCsv(r.book_author || "Unknown"),
            escapeCsv(r.isbn || ""),
            escapeCsv(r.student_name),
            escapeCsv(r.student_id),
            escapeCsv(r.issue_date),
            escapeCsv(r.due_date),
            escapeCsv(r.return_date || "Pending Return"),
            escapeCsv(r.status === 'issued' ? (r.days_overdue > 0 ? 'Overdue' : 'Issued') : 'Returned'),
            escapeCsv(r.days_overdue)
        ].join(","));

        const csvContent = [headers.join(","), ...rows].join("\r\n");

        const today = new Date().toISOString().split("T")[0];
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="Library_Circulation_${today}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        next(error);
    }
};

// Issue a book to a student (Atomic Transaction)
const issueBook = async (req, res, next) => {
    const { book_id, student_name, student_id } = req.body;

    if (!book_id || !student_name || !student_id) {
        return res.status(400).json({
            success: false,
            message: "Book, Student Name, and Student ID are required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock and check the book
        const bookResult = await client.query(
            "SELECT * FROM books WHERE id = $1 FOR UPDATE",
            [book_id]
        );

        if (bookResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const book = bookResult.rows[0];

        // 2. Check availability
        if (book.available_quantity <= 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: `"${book.title}" is currently out of stock (0 available)`
            });
        }

        // 3. Prevent duplicate active issue of the same book to the same student
        const existingIssue = await client.query(
            "SELECT id FROM transactions WHERE book_id = $1 AND LOWER(student_id) = LOWER($2) AND status = 'issued'",
            [book_id, student_id.trim()]
        );

        if (existingIssue.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: `Student ${student_name} (${student_id}) already has an active copy of this book issued.`
            });
        }

        // 4. Create transaction
        const transactionResult = await client.query(
            `INSERT INTO transactions (book_id, student_name, student_id, issue_date, status)
             VALUES ($1, $2, $3, CURRENT_DATE, 'issued')
             RETURNING id, book_id, student_name, student_id, TO_CHAR(issue_date, 'YYYY-MM-DD') as issue_date, status, created_at`,
            [book_id, student_name.trim(), student_id.trim()]
        );

        const transaction = transactionResult.rows[0];

        // 5. Decrement available quantity
        await client.query(
            "UPDATE books SET available_quantity = available_quantity - 1 WHERE id = $1",
            [book_id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: `Book "${book.title}" issued successfully to ${student_name}`,
            data: {
                ...transaction,
                book_title: book.title,
                book_author: book.author,
                isbn: book.isbn,
                days_overdue: 0,
                is_overdue: false
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

// Return an issued book (Atomic Transaction)
const returnBook = async (req, res, next) => {
    const { id } = req.params;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Lock and find transaction
        const transactionResult = await client.query(
            "SELECT * FROM transactions WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (transactionResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const transaction = transactionResult.rows[0];

        // 2. Check if already returned
        if (transaction.status === "returned") {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "This book has already been returned"
            });
        }

        // 3. Update transaction record
        const updatedResult = await client.query(
            `UPDATE transactions
             SET return_date = CURRENT_DATE,
                 returned_at = CURRENT_TIMESTAMP,
                 status = 'returned'
             WHERE id = $1
             RETURNING id, book_id, student_name, student_id, TO_CHAR(issue_date, 'YYYY-MM-DD') as issue_date, TO_CHAR(return_date, 'YYYY-MM-DD') as return_date, status`,
            [id]
        );

        const updatedTransaction = updatedResult.rows[0];

        // 4. Increment book available quantity
        const bookUpdateResult = await client.query(
            `UPDATE books
             SET available_quantity = available_quantity + 1
             WHERE id = $1
             RETURNING title, author, isbn, available_quantity, quantity`,
            [transaction.book_id]
        );

        await client.query("COMMIT");

        const book = bookUpdateResult.rows[0] || {};

        res.json({
            success: true,
            message: `Book "${book.title || 'Book'}" returned successfully to shelf stock`,
            data: {
                ...updatedTransaction,
                book_title: book.title,
                book_author: book.author,
                isbn: book.isbn
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

// Get Admin Dashboard Statistics & Active Loans with Overdue status
const getDashboardStats = async (req, res, next) => {
    try {
        const booksSummary = await pool.query(`
            SELECT 
                COUNT(*) AS total_titles,
                COALESCE(SUM(quantity), 0) AS total_books,
                COALESCE(SUM(available_quantity), 0) AS available_books
            FROM books
        `);

        const transactionsSummary = await pool.query(`
            SELECT 
                COUNT(*) AS total_transactions,
                COUNT(*) FILTER (WHERE status = 'issued') AS active_issued,
                COUNT(*) FILTER (WHERE status = 'returned') AS total_returned,
                COUNT(*) FILTER (WHERE status = 'issued' AND CURRENT_DATE > (issue_date + ${LOAN_DURATION_DAYS})) AS overdue_count,
                COUNT(DISTINCT student_id) AS unique_students
            FROM transactions
        `);

        // Active Loans with borrower details and overdue calculation
        const activeLoansResult = await pool.query(`
            SELECT 
                t.id,
                t.book_id,
                t.student_name,
                t.student_id,
                TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
                TO_CHAR(t.issue_date + INTERVAL '${LOAN_DURATION_DAYS} days', 'YYYY-MM-DD') AS due_date,
                CASE 
                    WHEN CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS}) 
                    THEN (CURRENT_DATE - (t.issue_date + ${LOAN_DURATION_DAYS}))
                    ELSE 0 
                END AS days_overdue,
                CASE 
                    WHEN CURRENT_DATE > (t.issue_date + ${LOAN_DURATION_DAYS}) 
                    THEN TRUE 
                    ELSE FALSE 
                END AS is_overdue,
                t.status,
                b.title AS book_title,
                b.author AS book_author,
                b.isbn
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            WHERE t.status = 'issued'
            ORDER BY days_overdue DESC, t.id DESC
        `);

        // Recent activity (latest 5)
        const recentTransactions = await pool.query(`
            SELECT 
                t.id,
                t.book_id,
                t.student_name,
                t.student_id,
                TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
                TO_CHAR(t.return_date, 'YYYY-MM-DD') AS return_date,
                t.status,
                b.title AS book_title,
                b.author AS book_author,
                b.isbn
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            ORDER BY t.id DESC
            LIMIT 5
        `);

        // 5. Dynamic Hourly Activity Breakdown for Today (8AM, 12PM, 4PM, 8PM)
        const todayHourlyActivity = await pool.query(`
            WITH hourly_slots AS (
                SELECT '8AM' AS slot, 1 AS ord
                UNION ALL SELECT '12PM', 2
                UNION ALL SELECT '4PM', 3
                UNION ALL SELECT '8PM', 4
            ),
            issues_today AS (
                SELECT 
                    CASE 
                        WHEN EXTRACT(HOUR FROM created_at) < 11 THEN '8AM'
                        WHEN EXTRACT(HOUR FROM created_at) < 15 THEN '12PM'
                        WHEN EXTRACT(HOUR FROM created_at) < 19 THEN '4PM'
                        ELSE '8PM'
                    END AS slot,
                    COUNT(*) AS cnt
                FROM transactions
                WHERE (DATE(created_at) = CURRENT_DATE OR issue_date = CURRENT_DATE)
                GROUP BY 1
            ),
            returns_today AS (
                SELECT 
                    CASE 
                        WHEN EXTRACT(HOUR FROM COALESCE(returned_at, created_at)) < 11 THEN '8AM'
                        WHEN EXTRACT(HOUR FROM COALESCE(returned_at, created_at)) < 15 THEN '12PM'
                        WHEN EXTRACT(HOUR FROM COALESCE(returned_at, created_at)) < 19 THEN '4PM'
                        ELSE '8PM'
                    END AS slot,
                    COUNT(*) AS cnt
                FROM transactions
                WHERE status = 'returned' AND (return_date = CURRENT_DATE OR DATE(returned_at) = CURRENT_DATE)
                GROUP BY 1
            )
            SELECT 
                h.slot AS time,
                COALESCE(i.cnt, 0)::INTEGER AS issues,
                COALESCE(r.cnt, 0)::INTEGER AS returns
            FROM hourly_slots h
            LEFT JOIN issues_today i ON h.slot = i.slot
            LEFT JOIN returns_today r ON h.slot = r.slot
            ORDER BY h.ord ASC;
        `);

        // 6. Dynamic Weekly Activity Breakdown (Last 7 Days)
        const weeklyDailyActivity = await pool.query(`
            SELECT 
                TO_CHAR(d.date, 'Dy') AS day,
                TO_CHAR(d.date, 'Mon DD') AS label,
                TO_CHAR(d.date, 'YYYY-MM-DD') AS date,
                COALESCE(SUM(CASE WHEN (DATE(t.created_at) = d.date OR t.issue_date = d.date) THEN 1 ELSE 0 END), 0)::INTEGER AS issues,
                COALESCE(SUM(CASE WHEN t.status = 'returned' AND (t.return_date = d.date OR DATE(t.returned_at) = d.date) THEN 1 ELSE 0 END), 0)::INTEGER AS returns
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) AS d(date)
            LEFT JOIN transactions t ON (
                (DATE(t.created_at) = d.date OR t.issue_date = d.date)
                OR (t.status = 'returned' AND (t.return_date = d.date OR DATE(t.returned_at) = d.date))
            )
            GROUP BY d.date
            ORDER BY d.date ASC;
        `);

        const bData = booksSummary.rows[0];
        const tData = transactionsSummary.rows[0];

        const totalBooks = parseInt(bData.total_books, 10);
        const availableBooks = parseInt(bData.available_books, 10);
        const issuedBooks = totalBooks - availableBooks;

        const todayIssuesTotal = todayHourlyActivity.rows.reduce((sum, r) => sum + r.issues, 0);
        const todayReturnsTotal = todayHourlyActivity.rows.reduce((sum, r) => sum + r.returns, 0);

        res.json({
            success: true,
            data: {
                totalTitles: parseInt(bData.total_titles, 10),
                totalBooks: totalBooks,
                availableBooks: availableBooks,
                issuedBooks: issuedBooks,
                activeIssues: parseInt(tData.active_issued, 10),
                overdueCount: parseInt(tData.overdue_count, 10),
                totalTransactions: parseInt(tData.total_transactions, 10),
                totalReturned: parseInt(tData.total_returned, 10),
                uniqueStudents: parseInt(tData.unique_students, 10),
                loanDurationDays: LOAN_DURATION_DAYS,
                activeLoans: activeLoansResult.rows,
                recentActivity: recentTransactions.rows,
                todayActivity: todayHourlyActivity.rows,
                weeklyActivity: weeklyDailyActivity.rows,
                todayIssuesTotal: todayIssuesTotal,
                todayReturnsTotal: todayReturnsTotal
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    exportTransactions,
    issueBook,
    returnBook,
    getDashboardStats
};