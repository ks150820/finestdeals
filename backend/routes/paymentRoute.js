const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
} = require("../controllers/paymentController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/payment/process", auth, processPayment);
router.get("/stripeapikey", auth, sendStripeApiKey);

module.exports = router;
