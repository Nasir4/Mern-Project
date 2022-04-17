const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const AsyncError = require("../middleware/AsyncError");
const ApiFeatures = require("../utils/apiFeautures");

//@desc post a product by Admin
//@url http://localhost:5000/api/vi/product/new
//access Private only for Admin

exports.createProduct = AsyncError(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

//@desc Get a products
//@url http://localhost:5000/api/vi/product
//access Public

exports.getAllProducts = AsyncError(async (req, res, next) => {
  const resultPerPage = 2;
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    totalProducts: products.length,
    data: products,
  });
});

//@desc Update a product
//@url http://localhost:5000/api/vi/product/:id
//access Admin only Private

exports.updateProduct = AsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

//@desc Get a Single product
//@url http://localhost:5000/api/vi/product/:id
//access Admin only Private

exports.getProductDetails = AsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found with this Id", 404));
  }

  res.status(201).json({
    success: true,
    data: product,
  });
});

//@desc Delete a product
//@url http://localhost:5000/api/vi/product/:id
//access Admin only Private

exports.deleteProduct = AsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found with this Id", 404));
  }

  product = await Product.findByIdAndRemove(req.params.id);

  res.status(200).json({
    success: true,
    msg: "Successfully Deleted",
  });
});

//Create new Review or Update the Review
exports.createProductReview = AsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const reviews = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(reviews);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  // let avg = product.reviews.reduce((acc, cur) => {
  //   // return acc.rating + cur;
  //   console.log(acc, cur);
  // });

  // product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//get all reviews

exports.getProductReviews = AsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete reviews
exports.deleteReviews = AsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidator: true }
  );

  res.status(200).json({
    success: true,
  });
});
