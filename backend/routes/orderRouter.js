const express = require("express");

const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");

const { isAuthentication, authorizeRoles } = require("../middleware/checkAuth");

router.route("/order/new").post(isAuthentication, newOrder);
router.route("/order/:id").get(isAuthentication, getSingleOrder);

router.route("/orders/me").get(isAuthentication, myOrders);

router
  .route("/admin/orders")
  .get(isAuthentication, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/orders/:id")
  .put(isAuthentication, authorizeRoles("admin"), updateOrder)
  .delete(isAuthentication, authorizeRoles("admin"), deleteOrder);

module.exports = router;
