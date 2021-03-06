const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const errorMiddleWare = require("./middleware/error");

app.use(express.json());
app.use(cookieParser());

//Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRouter");
const order = require("./routes/orderRouter");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

//Error Middleware
app.use(errorMiddleWare);

module.exports = app;
