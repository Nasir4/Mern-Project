const Errorhandler = require("../utils/ErrorHandler");
const AsyncHandler = require("../middleware/AsyncError");
const sendToken = require("../utils/jwtToken");

const User = require("../models/userModel");

const sendEmail = require("../utils/sendEmail");

const crypto = require("crypto");

// Register user

exports.registerUser = AsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "sample url",
    },
  });

  sendToken(user, 201, res);
});

//login user

exports.loginUser = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user has given password and email both
  if (!email || !password) {
    return next(new Errorhandler("Please Enter Email and Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new Errorhandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new Errorhandler("Invalid email and password", 401));
  }

  sendToken(user, 200, res);
});

//Logout user
exports.logoutUser = AsyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});

//forget password
exports.forgotPassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }

  //get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password Reset Token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this mail please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new Errorhandler(err.message, 500));
  }
});

//reset password

exports.resetPassword = AsyncHandler(async (req, res, next) => {
  //hashing token from url
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new Errorhandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Errorhandler("Password Dose not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//Get User Details

exports.getUsersDetails = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//update password

exports.updatePassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //if user found check password
  const isPasswordMatched = user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new Errorhandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new Errorhandler("new password and confirm password not matched", 400)
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//update user profile

exports.updateProfile = AsyncHandler(async (req, res, next) => {
  const newUserUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  //we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

//get all users (admin)

exports.getAllUsers = AsyncHandler(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});

//get single user (admin)

exports.getSingleUser = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`Not found user with this id : ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//update user role - Admin

exports.updateUserRole = AsyncHandler(async (req, res, next) => {
  const newUserUpdate = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//delete user - Admin

exports.deleteUser = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new Errorhandler(`user doset exit with this id : ${req.params.id}`)
    );
  }

  //we will remove cloudinary later

  await user.remove();

  res.status(200).json({
    success: true,
  });
});

//Create new Reviews or update a review
exports.createProductReview = AsyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating,
    comment,
  };
});
