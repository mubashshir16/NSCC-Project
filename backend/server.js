require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const { getDashboardStats } = require("./controllers/transactionController");

// API Routes
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.get("/api/dashboard/stats", getDashboardStats);

// Health / Database check endpoint (available at both /api/test-db and /test-db)
const handleTestDb = async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() as current_time, current_database() as db_name");
        res.json({
            success: true,
            message: "PostgreSQL connected successfully",
            database: result.rows[0].db_name,
            timestamp: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "PostgreSQL connection failed",
            error: error.message
        });
    }
};

app.get("/api/test-db", handleTestDb);
app.get("/test-db", handleTestDb);

// Root welcome
app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running",
        endpoints: {
            books: "/api/books",
            transactions: "/api/transactions",
            stats: "/api/transactions/stats",
            testDb: "/api/test-db"
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`NSCC Library Server running on http://localhost:${PORT}`);
});