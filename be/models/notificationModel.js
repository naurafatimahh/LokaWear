const db = require("../config/database");

const getNotificationsByUser = (userId, callback) => {
    const sql = `
        SELECT
            notifications.notification_id,
            notifications.product_id,
            notifications.title,
            notifications.message,
            notifications.type,
            notifications.is_read,
            notifications.created_at,
            products.product_name,
            brands.brand_name
        FROM notifications
        LEFT JOIN products
            ON notifications.product_id = products.product_id
        LEFT JOIN brands
            ON products.brand_id = brands.brand_id
        WHERE notifications.user_id = ?
        ORDER BY notifications.created_at DESC
    `;

    db.query(sql, [userId], callback);
};

const markAsRead = (notificationId, userId, callback) => {
    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [notificationId, userId],
        callback
    );
};

const createNotification = (
    userId,
    productId,
    title,
    message,
    type,
    callback
) => {
    const sql = `
        INSERT INTO notifications
        (
            user_id,
            product_id,
            title,
            message,
            type
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            productId,
            title,
            message,
            type
        ],
        callback
    );
};


module.exports = {
    getNotificationsByUser,
    markAsRead,
    createNotification
};