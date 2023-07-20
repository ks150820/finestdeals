const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController");
const {auth, authorizeRole} = require('../middleware/auth');

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/admin/products", [auth, authorizeRole("admin")], getAdminProducts)
router.post("/admin/product/new",[auth, authorizeRole("admin")], createProduct);
router.put("/admin/products/:id", [auth, authorizeRole("admin")], updateProduct);
router.delete("/admin/product/:id",[auth, authorizeRole("admin")], deleteProduct);
router.get("/product/:id", getProductDetails);
router.put("/review", auth, createProductReview);
router.get("/reviews", getProductReviews);
router.delete("/reviews", auth, deleteReview);

module.exports = router;
