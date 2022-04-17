const ErrorHandler = require("../utils/ErrorHandler");

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found, Invalid Id: ${err.value}`;
    err = new ErrorHandler(message, 404);
  }

  //mongoose duplicate error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;

    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT error

  if (err.name === "JsonWebTokenError") {
    const message = `Json web Token is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  // JWT expire error
  if (err.name === "TokenExpiredError") {
    const message = `Json web Token is Expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};

module.exports = ErrorMiddleware;
