
const productModel = require("../models/productModel");

const isValidUrlOrNull = (v) => v == null || v === "" || (typeof v === "string" && /^https?:\/\//i.test(v));

const isValidProductInput = (b) =>
    typeof b.product_name === "string" && b.product_name.length <= 255 &&
    Number.isFinite(Number(b.price)) && Number(b.price) >= 0 &&
    (b.status == null || (typeof b.status === "string" && b.status.length <= 50)) &&
    isValidUrlOrNull(b.image);

// Mengambil semua produk (public)
const getAllProducts = (req, res) => {
    productModel.getAllProducts((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil data product",
            });
        }

        res.json({
            message: "Data product berhasil diambil",
            data: results
        });
    });
};

// Mengambil detail produk (public)
const getProductById = (req, res) => {
    const { id } = req.params;

    productModel.getProductById(id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil data product",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Product tidak ditemukan"
            });
        }

        res.json({
            message: "Data product berhasil diambil",
            data: results[0]
        });
    });
};

// Membuat produk untuk brand milik sendiri
const createProduct = (req, res) => {
    const userId = req.user.user_id;

    const {
        brand_id,
        product_name,
        description,
        price,
        image,
        status,
        po_start,
        po_end
    } = req.body;

    if (!brand_id || !product_name || price == null) {
        return res.status(400).json({
            message: "brand_id, product_name, dan price wajib diisi"
        });
    }

    if (!isValidProductInput(req.body)) {
        return res.status(400).json({ message: "Data product tidak valid" });
    }

    productModel.createProduct(
        brand_id,
        userId,
        product_name,
        description || null,
        price,
        image || null,
        status || "coming_soon",
        po_start || null,
        po_end || null,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal membuat product",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(403).json({
                    message: "Brand tidak ditemukan atau bukan milik kamu"
                });
            }

            res.status(201).json({
                message: "Product berhasil dibuat",
                product_id: result.insertId
            });
        }
    );
};

// Mengedit produk milik sendiri
const updateProduct = (req, res) => {
    const productId = req.params.id;
    const userId = req.user.user_id;

    const {
        product_name,
        description,
        price,
        image,
        status,
        po_start,
        po_end
    } = req.body;

    if (!product_name || price == null) {
        return res.status(400).json({
            message: "product_name dan price wajib diisi"
        });
    }

    if (!isValidProductInput(req.body)) {
        return res.status(400).json({ message: "Data product tidak valid" });
    }

    productModel.updateProduct(
        productId,
        userId,
        product_name,
        description || null,
        price,
        image || null,
        status || "coming_soon",
        po_start || null,
        po_end || null,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal mengedit product",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product tidak ditemukan, bukan milik kamu, atau tidak ada perubahan"
                });
            }

            res.json({
                message: "Product berhasil diperbarui"
            });
        }
    );
};

// Menghapus produk milik sendiri
const deleteProduct = (req, res) => {
    const productId = req.params.id;
    const userId = req.user.user_id;

    productModel.deleteProduct(
        productId,
        userId,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal menghapus product",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product tidak ditemukan atau bukan milik kamu"
                });
            }

            res.json({
                message: "Product berhasil dihapus"
            });
        }
    );
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
