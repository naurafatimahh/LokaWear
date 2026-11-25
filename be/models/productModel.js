
const db = require("../config/database");

// Mengambil semua produk
const getAllProducts = (callback) => {
    const sql = `
        SELECT
            products.product_id,
            products.product_name,
            products.description,
            products.price,
            products.image,
            products.status,
            products.po_start,
            products.po_end,
            brands.brand_id,
            brands.brand_name
        FROM products
        JOIN brands
            ON products.brand_id = brands.brand_id
        ORDER BY products.created_at DESC
    `;

    db.query(sql, callback);
};

// Mengambil produk berdasarkan ID
const getProductById = (productId, callback) => {
    const sql = `
        SELECT
            products.product_id,
            products.product_name,
            products.description,
            products.price,
            products.image,
            products.status,
            products.po_start,
            products.po_end,
            brands.brand_id,
            brands.brand_name
        FROM products
        JOIN brands
            ON products.brand_id = brands.brand_id
        WHERE products.product_id = ?
    `;

    db.query(sql, [productId], callback);
};

// Membuat produk hanya untuk brand milik user yang login
const createProduct = (
    brandId,
    userId,
    productName,
    description,
    price,
    image,
    status,
    poStart,
    poEnd,
    callback
) => {
    const sql = `
        INSERT INTO products
        (
            brand_id,
            product_name,
            description,
            price,
            image,
            status,
            po_start,
            po_end
        )
        SELECT
            brand_id, ?, ?, ?, ?, ?, ?, ?
        FROM brands
        WHERE brand_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [
            productName,
            description,
            price,
            image,
            status,
            poStart,
            poEnd,
            brandId,
            userId
        ],
        callback
    );
};

// Mengedit produk milik sendiri
const updateProduct = (
    productId,
    userId,
    productName,
    description,
    price,
    image,
    status,
    poStart,
    poEnd,
    callback
) => {
    const sql = `
        UPDATE products AS p
        JOIN brands AS b
            ON p.brand_id = b.brand_id
        SET
            p.product_name = ?,
            p.description = ?,
            p.price = ?,
            p.image = ?,
            p.status = ?,
            p.po_start = ?,
            p.po_end = ?
        WHERE p.product_id = ?
        AND b.user_id = ?
    `;

    db.query(
        sql,
        [
            productName,
            description,
            price,
            image,
            status,
            poStart,
            poEnd,
            productId,
            userId
        ],
        callback
    );
};

// Menghapus produk milik sendiri
const deleteProduct = (productId, userId, callback) => {
    const sql = `
        DELETE p
        FROM products AS p
        JOIN brands AS b
            ON p.brand_id = b.brand_id
        WHERE p.product_id = ?
        AND b.user_id = ?
    `;

    db.query(sql, [productId, userId], callback);
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
