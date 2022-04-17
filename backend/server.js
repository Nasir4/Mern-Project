const app = require("./app");
const dotenv = require("dotenv");
const connectDb = require("./db/dbConnection");

dotenv.config({ path: "./backend/.env" });

connectDb();
const PORT = process.env.PORT || 5000;

app.listen(process.env.PORT, () => {
  console.log(`server running on http://localhost:${process.env.PORT}`);
});
