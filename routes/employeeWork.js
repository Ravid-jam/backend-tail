const express = require("express");
const WorkHistory = require("../models/EmployeeWork");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { employeeId, itemName, itemPrice, quantity } = req.body;

    const itemQuantity = quantity || 1;

    const totalPrice = itemPrice * itemQuantity;

    const newWorkHistory = new WorkHistory({
      employeeId,
      itemName,
      itemPrice,
      quantity: itemQuantity,
      totalPrice,
    });

    await newWorkHistory.save();
    res.status(201).send(newWorkHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/view-work/:employeeId/:date", async (req, res) => {
  try {
    const { employeeId, date } = req.params;

    const workHistory = await WorkHistory.find({
      employeeId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    }).populate({
      path: "employeeId",
      select: "name mobile address",
    });

    if (workHistory.length === 0) {
      return res
        .status(404)
        .json({ message: "No work history found for this date" });
    }

    const dailyTotal = workHistory.reduce(
      (total, entry) => total + entry.totalPrice,
      0
    );

    res.status(200).json({ workHistory, dailyTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/view-monthly/:employeeId/:month", async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const year = new Date().getFullYear();

    const monthNumber = parseInt(month);
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res
        .status(400)
        .json({ message: "Invalid month value. Must be between 1 and 12." });
    }

    const startOfMonth = new Date(year, monthNumber - 1, 1);
    const endOfMonth = new Date(year, monthNumber, 0, 23, 59, 59, 999);

    const workHistory = await WorkHistory.find({
      employeeId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate({
      path: "employeeId",
      select: "name mobile address",
    });

    if (!workHistory || workHistory.length === 0) {
      return res
        .status(404)
        .json({ message: "No work history found for this month" });
    }

    const monthlyTotal = workHistory.reduce(
      (total, entry) => total + entry.totalPrice,
      0
    );

    res.status(200).json({
      workHistory,
      monthlyTotal,
    });
  } catch (err) {
    console.error("Error fetching monthly work history:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;