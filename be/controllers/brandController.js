
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
        city,
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
        city || null,
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
        city,
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
        city || null,
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

// Dashboard brand milik user yang login
const getMyDashboard = async (req, res) => {
    try {
        const data = await brandModel.getDashboardByUser(req.user.user_id);

        res.json({
            message: "Dashboard brand berhasil diambil",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Gagal mengambil dashboard brand"
        });
    }
};

// Daftar brand yang menunggu verifikasi (admin)
const getPendingBrands = (req, res) => {
    brandModel.getPendingBrands((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil brand yang menunggu verifikasi"
            });
        }

        res.json({
            message: "Data brand pending berhasil diambil",
            data: results
        });
    });
};

// Admin memverifikasi atau menolak brand
const verifyBrand = (req, res) => {
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({
            message: "status harus 'verified' atau 'rejected'"
        });
    }

    brandModel.setVerification(req.params.id, status, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal memperbarui status brand"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Brand tidak ditemukan"
            });
        }

        res.json({
            message: "Status brand berhasil diperbarui"
        });
    });
};

module.exports = {
    getPendingBrands,
    verifyBrand,
    getMyDashboard,
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
