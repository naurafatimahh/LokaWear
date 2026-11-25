const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Nama, email, dan password wajib diisi"
            });
        }

        if (
            typeof name !== "string" || typeof email !== "string" || typeof password !== "string" ||
            name.length > 100 || email.length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({ message: "Data tidak valid" });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({ message: "Password harus 8-72 karakter" });
        }

        userModel.findUserByEmail(email, async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Terjadi kesalahan pada database",
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "Email sudah terdaftar"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            userModel.createUser(
                name,
                email,
                hashedPassword,
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            message: "Gagal membuat akun",
                        });
                    }

                    res.status(201).json({
                        message: "Registrasi berhasil",
                        user_id: result.insertId
                    });
                }
            );
        });

    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
        });
    }
};

const jwt = require("jsonwebtoken");

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email dan password wajib diisi"
        });
    }

    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Data tidak valid" });
    }

    userModel.findUserByEmail(email, async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Terjadi kesalahan pada database"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login berhasil",
            token: token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
};

module.exports = {
    register,
    login
};