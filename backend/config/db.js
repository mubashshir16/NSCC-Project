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

// Ensure returned_at timestamp column exists for real-time circulation activity tracking
pool.query(`
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP;
    UPDATE transactions SET returned_at = created_at WHERE status = 'returned' AND returned_at IS NULL;
`).catch(err => {
    console.error("Warning: Could not auto-migrate returned_at column:", err.message);
});

module.exports = pool;