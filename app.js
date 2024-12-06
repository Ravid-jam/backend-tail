const express = require("express");
var cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const connectDB = require("./database/db");
const authRoutes = require("./routes/auth");
const merchant = require("./routes/merchant");
const employee = require("./routes/employee");
const employeeWork = require("./routes/employeeWork");

const app = express();
app.use(cors());
require("dotenv").config();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/merchants", merchant);
app.use("/employee", employee);
app.use("/employeeWork", employeeWork);
app.get("/", (req, res) => {
  res.json({
    message: "Hello, welcome to the backend",
    status: 200,
  });
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});
