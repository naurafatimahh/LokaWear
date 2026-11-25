
const brandModel = require("../models/brandModel");

// Mengambil semua brand
const getAllBrands = (req, res) => {
    brandModel.getAllBrands((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil data brand",
            });
        }

        res.json({
            message: "Data brand berhasil diambil",
            data: results
        });
    });
};

// Mengambil detail brand
const getBrandById = (req, res) => {
    const { id } = req.params;

    brandModel.getBrandById(id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil data brand",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Brand tidak ditemukan"
            });
        }

        res.json({
            message: "Data brand berhasil diambil",
            data: results[0]
        });
    });
};

// Membuat brand
const createBrand = (req, res) => {
    const userId = req.user.user_id;

    const {
        brand_name,
        description,
        logo,
        instagram_url,
        website_url
    } = req.body;

    if (!brand_name) {
        return res.status(400).json({
            message: "brand_name wajib diisi"
        });
    }

    brandModel.createBrand(
        userId,
        brand_name,
        description || null,
        logo || null,
        instagram_url || null,
        website_url || null,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal membuat brand",
                });
            }

            res.status(201).json({
                message: "Brand berhasil dibuat",
                brand_id: result.insertId
            });
        }
    );
};

// Mengedit brand milik sendiri
const updateBrand = (req, res) => {
    const brandId = req.params.id;
    const userId = req.user.user_id;

    const {
        brand_name,
        description,
        logo,
        instagram_url,
        website_url
    } = req.body;

    if (!brand_name) {
        return res.status(400).json({
            message: "brand_name wajib diisi"
        });
    }

    brandModel.updateBrand(
        brandId,
        userId,
        brand_name,
        description || null,
        logo || null,
        instagram_url || null,
        website_url || null,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal mengedit brand",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Brand tidak ditemukan atau bukan milik kamu"
                });
            }

            res.json({
                message: "Brand berhasil diperbarui"
            });
        }
    );
};

// Menghapus brand milik sendiri
const deleteBrand = (req, res) => {
    const brandId = req.params.id;
    const userId = req.user.user_id;

    brandModel.deleteBrand(brandId, userId, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal menghapus brand",
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Brand tidak ditemukan atau bukan milik kamu"
            });
        }

        res.json({
            message: "Brand berhasil dihapus"
        });
    });
};

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
