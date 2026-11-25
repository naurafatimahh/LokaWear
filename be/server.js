require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET belum diset atau terlalu pendek (min 32 karakter) di .env");
    process.exit(1);
}

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("./config/database");

const userRoutes = require("./routes/userRoutes");
const brandRoutes = require("./routes/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : false
}));
app.use(express.json({ limit: "100kb" }));

// Pembatasan umum + lebih ketat untuk login/register
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { message: "Terlalu banyak percobaan, coba lagi nanti" }
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

app.use("/api/users", userRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Lokawear API is running!" });
});

app.get("/api/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Kamu berhasil mengakses profile",
        user: req.user
    });
});

// Error handler terakhir: jangan bocorkan detail
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: "Terjadi kesalahan pada server" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
