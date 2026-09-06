require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "library_db",
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432", 10)
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err);
});

// Ensure returned_at timestamp column exists for real-time circulation activity tracking
pool.query(`
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP;
    UPDATE transactions SET returned_at = created_at WHERE status = 'returned' AND returned_at IS NULL;
`).catch(err => {
    console.error("Warning: Could not auto-migrate returned_at column:", err.message);
});

module.exports = pool;