const Order = require("../models/orderModels");
const Product = require("../models/productModel");
const ErrorHandle = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/AsyncError");

// create new order

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
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

  res.status(201).json({
    success: true,
    order,
  });
});

//get Single Order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandle("Not Found Order Id", 404));
  }

  res.status(200).json({ success: true, order });
});

//get Single Order

exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({ success: true, orders });
});

//get All Orders -- Admin only

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.paymentInfo.totalPrice;
  });

  res.status(200).json({ success: true, orders, totalAmount });
});

//Update Order Status -- Admin only

exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandle("Order not found with this id", 404));
  }

  if (order.paymentInfo.orderStatus === "Delivery") {
    return next(
      new ErrorHandle("You Have All Ready Delivered This Order", 400)
    );
  }

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  order.paymentInfo.orderStatus = req.body.status;

  if (req.body.status === "Delivery") {
    order.paymentInfo.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({ success: true });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

//delete Order -- Admin only

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandle("Order not found with this id", 404));
  }

  await order.remove();

  res.status(200).json({ success: true });
});
