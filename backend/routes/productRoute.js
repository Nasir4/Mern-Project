const express = require("express");

const Router = express.Router();

const { isAuthentication, authorizeRoles } = require("../middleware/checkAuth");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReviews,
} = require("../controller/productController");

Router.route("/products").get(getAllProducts);
Router.route("/product/new").post(
  isAuthentication,
  authorizeRoles("admin"),
  createProduct
);
Router.route("/product/:id")
  .patch(isAuthentication, authorizeRoles("admin"), updateProduct)
  .delete(isAuthentication, authorizeRoles("admin"), deleteProduct);

Router.route("/product/:id").get(getProductDetails);

Router.route("/review").put(isAuthentication, createProductReview);

Router.route("/reviews")
  .get(getProductReviews)
  .delete(isAuthentication, deleteReviews);

module.exports = Router;
