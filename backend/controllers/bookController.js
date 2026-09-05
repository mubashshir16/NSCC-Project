const pool = require("../config/db");

// Get all books with optional search, category, and availability filters
const getBooks = async (req, res, next) => {
    try {
        const { search, category, availability } = req.query;

        let query = "SELECT * FROM books WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        if (search && search.trim()) {
            query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex} OR isbn ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
            params.push(`%${search.trim()}%`);
            paramIndex++;
        }

        if (category && category !== "All Categories" && category.trim()) {
            query += ` AND category = $${paramIndex}`;
            params.push(category.trim());
            paramIndex++;
        }

        if (availability === "Available") {
            query += " AND available_quantity > 0";
        } else if (availability === "Issued") {
            query += " AND available_quantity = 0";
        }

        query += " ORDER BY id ASC";

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

// Get book by ID
const getBookById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM books WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Also fetch active transactions for this book
        const transactions = await pool.query(
            "SELECT id, book_id, student_name, student_id, TO_CHAR(issue_date, 'YYYY-MM-DD') AS issue_date, TO_CHAR(return_date, 'YYYY-MM-DD') AS return_date, status FROM transactions WHERE book_id = $1 ORDER BY id DESC LIMIT 5",
            [id]
        );

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                recentTransactions: transactions.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create a new book
const createBook = async (req, res, next) => {
    const { title, author, isbn, category, quantity } = req.body;

    if (!title || !author || !isbn || quantity === undefined) {
        return res.status(400).json({
            success: false,
            message: "Title, author, ISBN, and quantity are required"
        });
    }

    const totalQty = parseInt(quantity, 10);
    if (isNaN(totalQty) || totalQty <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    try {
        // Check for duplicate ISBN
        const existing = await pool.query(
            "SELECT id FROM books WHERE LOWER(isbn) = LOWER($1)",
            [isbn.trim()]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A book with this ISBN already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO books (title, author, isbn, category, quantity, available_quantity)
             VALUES ($1, $2, $3, $4, $5, $5)
             RETURNING *`,
            [title.trim(), author.trim(), isbn.trim(), category ? category.trim() : null, totalQty]
        );

        res.status(201).json({
            success: true,
            message: "Book added successfully",
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update an existing book
const updateBook = async (req, res, next) => {
    const { id } = req.params;
    const { title, author, isbn, category, quantity } = req.body;

    if (!title || !author || !isbn || quantity === undefined) {
        return res.status(400).json({
            success: false,
            message: "Title, author, ISBN, and quantity are required"
        });
    }

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    try {
        // Find existing book
        const bookResult = await pool.query(
            "SELECT * FROM books WHERE id = $1",
            [id]
        );

        if (bookResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const currentBook = bookResult.rows[0];

        // Check if ISBN is being changed to one that already exists
        const isbnCheck = await pool.query(
            "SELECT id FROM books WHERE LOWER(isbn) = LOWER($1) AND id != $2",
            [isbn.trim(), id]
        );

        if (isbnCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another book with this ISBN already exists"
            });
        }

        // Calculate issued copies
        const issuedCopies = currentBook.quantity - currentBook.available_quantity;

        if (newQty < issuedCopies) {
            return res.status(400).json({
                success: false,
                message: `Total quantity cannot be less than currently issued copies (${issuedCopies})`
            });
        }

        const newAvailableQty = newQty - issuedCopies;

        const updatedResult = await pool.query(
            `UPDATE books
             SET title = $1,
                 author = $2,
                 isbn = $3,
                 category = $4,
                 quantity = $5,
                 available_quantity = $6
             WHERE id = $7
             RETURNING *`,
            [
                title.trim(),
                author.trim(),
                isbn.trim(),
                category ? category.trim() : null,
                newQty,
                newAvailableQty,
                id
            ]
        );

        res.json({
            success: true,
            message: "Book updated successfully",
            data: updatedResult.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete a book
const deleteBook = async (req, res, next) => {
    const { id } = req.params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const bookResult = await client.query(
            "SELECT * FROM books WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (bookResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const book = bookResult.rows[0];

        // Check if any copies are currently issued
        const issuedCheck = await client.query(
            "SELECT COUNT(*) FROM transactions WHERE book_id = $1 AND status = 'issued'",
            [id]
        );

        const activeIssues = parseInt(issuedCheck.rows[0].count, 10);
        if (activeIssues > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: `Cannot delete book: ${activeIssues} copy/copies are currently issued to students`
            });
        }

        // Delete associated returned transactions to maintain referential integrity
        await client.query("DELETE FROM transactions WHERE book_id = $1", [id]);

        // Delete the book
        await client.query("DELETE FROM books WHERE id = $1", [id]);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: `Book "${book.title}" deleted successfully`
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

// Get distinct categories
const getCategories = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category != '' ORDER BY category ASC"
        );
        const categories = result.rows.map(r => r.category);
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getCategories
};