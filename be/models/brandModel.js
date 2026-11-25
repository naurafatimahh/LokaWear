
const db = require("../config/database");

// Mengambil semua brand
const getAllBrands = (callback) => {
    const sql = `
        SELECT brand_id, brand_name, description, logo, instagram_url, website_url, created_at
        FROM brands
        ORDER BY created_at DESC
    `;

    db.query(sql, callback);
};

// Mengambil brand berdasarkan ID
const getBrandById = (brandId, callback) => {
    const sql = `
        SELECT brand_id, brand_name, description, logo, instagram_url, website_url, created_at
        FROM brands
        WHERE brand_id = ?
    `;

    db.query(sql, [brandId], callback);
};

// Membuat brand
const createBrand = (
    userId,
    brandName,
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
            description,
            logo,
            instagram_url,
            website_url
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            brandName,
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

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
