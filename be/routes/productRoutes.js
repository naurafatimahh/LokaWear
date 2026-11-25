
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Melihat semua produk (public)
router.get("/", productController.getAllProducts);

// Melihat detail produk (public)
router.get("/:id", productController.getProductById);

// Membuat produk
router.post(
    "/",
    authMiddleware,
    roleMiddleware("brand"),
    productController.createProduct
);

// Mengedit produk
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("brand"),
    productController.updateProduct
);

// Menghapus produk
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("brand"),
    productController.deleteProduct
);

module.exports = router;
