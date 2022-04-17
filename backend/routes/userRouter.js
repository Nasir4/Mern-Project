const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUsersDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controller/userController");

const { isAuthentication, authorizeRoles } = require("../middleware/checkAuth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthentication, getUsersDetails);

router.route("/password/update").put(isAuthentication, updatePassword);

router.route("/me/update").put(isAuthentication, updateProfile);

router
  .route("/admin/users")
  .get(isAuthentication, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthentication, authorizeRoles("admin"), getSingleUser)
  .put(isAuthentication, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthentication, authorizeRoles("admin"), deleteUser);

module.exports = router;
