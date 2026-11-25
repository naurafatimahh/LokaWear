const db = require("../config/database");

const getWishlistByUser = (userId, callback) => {
    const sql = `
        SELECT 
            wishlist.wishlist_id,
            products.product_id,
            products.product_name,
            products.price,
            products.image,
            products.status,
            brands.brand_name
        FROM wishlist
        JOIN products 
            ON wishlist.product_id = products.product_id
        JOIN brands 
            ON products.brand_id = brands.brand_id
        WHERE wishlist.user_id = ?
        ORDER BY wishlist.created_at DESC
    `;

    db.query(sql, [userId], callback);
};

const addWishlist = (userId, productId, callback) => {
    const sql = `
        INSERT INTO wishlist (user_id, product_id)
        VALUES (?, ?)
    `;

    db.query(sql, [userId, productId], callback);
};

const removeWishlist = (userId, productId, callback) => {
    const sql = `
        DELETE FROM wishlist
        WHERE user_id = ? AND product_id = ?
    `;

    db.query(sql, [userId, productId], callback);
};


module.exports = {
    getWishlistByUser,
    addWishlist,
    removeWishlist
};