
const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Melihat semua brand (public)
router.get("/", brandController.getAllBrands);

// Dashboard brand milik sendiri (harus di atas "/:id")
router.get("/mine", authMiddleware, roleMiddleware("brand"), brandController.getMyDashboard);

// Admin: brand yang menunggu verifikasi (harus di atas "/:id")
router.get("/pending", authMiddleware, roleMiddleware("admin"), brandController.getPendingBrands);

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

// Admin: verifikasi / tolak brand
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin"), brandController.verifyBrand);

module.exports = router;
