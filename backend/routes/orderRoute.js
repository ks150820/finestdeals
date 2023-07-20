const express = require("express");
const { auth, authorizeRole } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.post("/order/new", auth, newOrder);
router.get("/order/:id", auth, getSingleOrder);
router.get("/orders/me", auth, myOrders);

router.get("/admin/orders", [auth, authorizeRole("admin")], getAllOrders);
router.put("/admin/order/:id", [auth, authorizeRole("admin")], updateOrder);
router.delete("/admin/order/:id", [auth, authorizeRole("admin")], deleteOrder);

module.exports = router;
