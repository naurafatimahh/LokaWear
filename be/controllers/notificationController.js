const notificationModel = require("../models/notificationModel");

const getNotifications = (req, res) => {
    const userId = req.user.user_id;

    notificationModel.getNotificationsByUser(
        userId,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal mengambil notification",
                });
            }

            res.json({
                message: "Notification berhasil diambil",
                data: results
            });
        }
    );
};

const markNotificationAsRead = (req, res) => {
    const userId = req.user.user_id;
    const { id } = req.params;

    notificationModel.markAsRead(
        id,
        userId,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal mengubah notification",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Notification tidak ditemukan"
                });
            }

            res.json({
                message: "Notification berhasil ditandai sebagai sudah dibaca"
            });
        }
    );
};

const createNotification = (req, res) => {
    const {
        user_id,
        product_id,
        title,
        message,
        type
    } = req.body;

    if (!user_id || !title || !message || !type) {
        return res.status(400).json({
            message: "user_id, title, message, dan type wajib diisi"
        });
    }

    notificationModel.createNotification(
        user_id,
        product_id || null,
        title,
        message,
        type,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal membuat notification",
                });
            }

            res.status(201).json({
                message: "Notification berhasil dibuat",
                notification_id: result.insertId
            });
        }
    );
};


module.exports = {
    getNotifications,
    markNotificationAsRead,
    createNotification
};