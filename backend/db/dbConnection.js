const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("db connected successfully");
  } catch (err) {
    console.log("error on while connecting data", err);
  }
};

module.exports = connectDb;
