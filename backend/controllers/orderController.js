const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

// create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  let order = new Order({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  order = await order.save();

  res.status(201).json({
    success: true,
    order,
  });
});

// get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  let order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) return next(new ErrorHandler("Order not found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  let orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all orders -- admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  let orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((element) => {
    totalAmount += element.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update orders status -- admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );

  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler("Your ordered is already delivered", 400));

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete order -- admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
