
const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Melihat semua brand (public)
router.get("/", brandController.getAllBrands);

// Melihat detail brand (public)
router.get("/:id", brandController.getBrandById);

// Membuat brand
router.post(
    "/",
    authMiddleware,
    roleMiddleware("brand"),
    brandController.createBrand
);

// Mengedit brand milik sendiri
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("brand"),
    brandController.updateBrand
);

// Menghapus brand milik sendiri
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("brand"),
    brandController.deleteBrand
);

module.exports = router;
