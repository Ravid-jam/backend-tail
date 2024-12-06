const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const connectDB = require("./database/db");
const authRoutes = require("./routes/auth");
const merchant = require("./routes/merchant");
const employee = require("./routes/employee");
const employeeWork = require("./routes/employeeWork");
const authenticateToken = require("./middleware/auth");
require("dotenv").config();

const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
// Connect to MongoDB
connectDB();

app.use("/auth", authRoutes);
app.use("/merchants", merchant);
app.use("/employee", employee);
app.use("/employeeWork", employeeWork);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
