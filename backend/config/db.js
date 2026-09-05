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

module.exports = pool;