const express = require("express");
const router = express.Router();

const userModel = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

router.get("/", authMiddleware, roleMiddleware("admin"), (req, res) => {
    userModel.getAllUsers((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil data users",
            });
        }

        res.json(results);
    });
});

router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;