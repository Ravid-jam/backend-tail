const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
// const connectDB = require("./database/db");
const authRoutes = require("./routes/auth");
const merchant = require("./routes/merchant");
const mongoose = require("mongoose");
const employee = require("./routes/employee");
const employeeWork = require("./routes/employeeWork");
const authenticateToken = require("./middleware/auth");
require("dotenv").config();

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URL).then(() => console.log("connected"));
// connectDB();
app.use(function (req, res, next) {
  res.json({
    message: "Hello , welcome to backend",
    status: 200,
  });
});
app.use("/auth", authRoutes);
app.use("/merchants", merchant);
app.use("/employee", employee);
app.use("/employeeWork", employeeWork);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
