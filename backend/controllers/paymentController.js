const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require("stripe")("sk_test_51N7tJLSC6WMHZtvq4El8khJHGFHt1D9arNC5USQ9ZgxULJ6aa4kQWrw9vBbZCfVaO0NnocgIrYYtpt3oddIQC3Qg00p2iOM9Ly");

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Finestdeals",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment?.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
