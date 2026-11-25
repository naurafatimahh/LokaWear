const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, notificationController.getNotifications);

router.patch("/:id/read", authMiddleware, notificationController.markNotificationAsRead);

router.post("/", authMiddleware, roleMiddleware("brand", "admin"), notificationController.createNotification);

module.exports = router;