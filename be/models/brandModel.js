
const db = require("../config/database");

// Mengambil semua brand
const getAllBrands = (callback) => {
    const sql = `
        SELECT brand_id, brand_name, city, description, logo, instagram_url, website_url, created_at
        FROM brands
        ORDER BY created_at DESC
    `;

    db.query(sql, callback);
};

// Mengambil brand berdasarkan ID
const getBrandById = (brandId, callback) => {
    const sql = `
        SELECT brand_id, brand_name, city, description, logo, instagram_url, website_url, created_at
        FROM brands
        WHERE brand_id = ?
    `;

    db.query(sql, [brandId], callback);
};

// Membuat brand
const createBrand = (
    userId,
    brandName,
    city,
    description,
    logo,
    instagramUrl,
    websiteUrl,
    callback
) => {
    const sql = `
        INSERT INTO brands
        (
            user_id,
            brand_name,
            city,
            description,
            logo,
            instagram_url,
            website_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            brandName,
            city,
            description,
            logo,
            instagramUrl,
            websiteUrl
        ],
        callback
    );
};

// Mengedit brand milik sendiri
const updateBrand = (
    brandId,
    userId,
    brandName,
    city,
    description,
    logo,
    instagramUrl,
    websiteUrl,
    callback
) => {
    const sql = `
        UPDATE brands
        SET
            brand_name = ?,
            city = ?,
            description = ?,
            logo = ?,
            instagram_url = ?,
            website_url = ?
        WHERE brand_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [
            brandName,
            city,
            description,
            logo,
            instagramUrl,
            websiteUrl,
            brandId,
            userId
        ],
        callback
    );
};

// Menghapus brand milik sendiri
const deleteBrand = (brandId, userId, callback) => {
    const sql = `
        DELETE FROM brands
        WHERE brand_id = ?
        AND user_id = ?
    `;

    db.query(sql, [brandId, userId], callback);
};

// PO aktif: sudah mulai (atau tanpa tanggal mulai) dan belum berakhir
const ACTIVE_PO = `
    p.po_end IS NOT NULL
    AND p.po_end >= NOW()
    AND (p.po_start IS NULL OR p.po_start <= NOW())
`;

// Dashboard untuk pemilik brand: brand miliknya, statistik, dan PO yang sedang berjalan
const getDashboardByUser = async (userId) => {
    const q = db.promise();

    const [brands] = await q.query(
        `SELECT brand_id, brand_name, city, description, logo, instagram_url, website_url, verification_status
         FROM brands
         WHERE user_id = ?`,
        [userId]
    );

    const [[stats]] = await q.query(
        `SELECT
            (SELECT COUNT(*)
             FROM products p JOIN brands b ON p.brand_id = b.brand_id
             WHERE b.user_id = ?) AS product_count,
            (SELECT COUNT(*)
             FROM products p JOIN brands b ON p.brand_id = b.brand_id
             WHERE b.user_id = ? AND ${ACTIVE_PO}) AS active_po_count,
            (SELECT COUNT(DISTINCT w.user_id)
             FROM wishlist w
             JOIN products p ON w.product_id = p.product_id
             JOIN brands b ON p.brand_id = b.brand_id
             WHERE b.user_id = ?) AS wishlist_count`,
        [userId, userId, userId]
    );

    const [activeProducts] = await q.query(
        `SELECT p.product_id, p.product_name, p.price, p.image, p.status, p.po_start, p.po_end
         FROM products p JOIN brands b ON p.brand_id = b.brand_id
         WHERE b.user_id = ? AND ${ACTIVE_PO}
         ORDER BY p.po_end ASC
         LIMIT 20`,
        [userId]
    );

    return { brands, stats, activeProducts };
};

// Brand yang menunggu verifikasi admin
const getPendingBrands = (callback) => {
    const sql = `
        SELECT brand_id, brand_name, city, created_at
        FROM brands
        WHERE verification_status = 'pending'
        ORDER BY created_at ASC
    `;

    db.query(sql, callback);
};

// Admin menetapkan status verifikasi brand
const setVerification = (brandId, status, callback) => {
    const sql = `
        UPDATE brands
        SET verification_status = ?
        WHERE brand_id = ?
    `;

    db.query(sql, [status, brandId], callback);
};

module.exports = {
    getPendingBrands,
    setVerification,
    getDashboardByUser,
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
