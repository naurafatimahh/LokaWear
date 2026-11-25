require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((err, conn) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("MySQL connected!");
    conn.release();
});

module.exports = db;
