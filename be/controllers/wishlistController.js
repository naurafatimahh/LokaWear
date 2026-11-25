const wishlistModel = require("../models/wishlistModel");

const getWishlist = (req, res) => {
    const userId = req.user.user_id;

    wishlistModel.getWishlistByUser(userId, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Gagal mengambil wishlist",
            });
        }

        res.json({
            message: "Wishlist berhasil diambil",
            data: results
        });
    });
};

const addWishlist = (req, res) => {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({
            message: "product_id wajib diisi"
        });
    }

    wishlistModel.addWishlist(
        userId,
        product_id,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal menambahkan produk ke wishlist",
                });
            }

            res.status(201).json({
                message: "Produk berhasil ditambahkan ke wishlist",
                wishlist_id: result.insertId
            });
        }
    );
};

const removeWishlist = (req, res) => {
    const userId = req.user.user_id;
    const { product_id } = req.params;

    wishlistModel.removeWishlist(
        userId,
        product_id,
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Gagal menghapus produk dari wishlist",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Produk tidak ditemukan di wishlist"
                });
            }

            res.json({
                message: "Produk berhasil dihapus dari wishlist"
            });
        }
    );
};


module.exports = {
    getWishlist,
    addWishlist,
    removeWishlist
};