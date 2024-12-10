const express = require("express");
const authenticateToken = require("../middleware/auth");
const WorkHistory = require("../models/EmployeeWork");
const router = express.Router();

router.post("/create", authenticateToken, async (req, res) => {
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

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, itemPrice, quantity } = req.body;

    if (!itemName || !itemPrice || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const totalPrice = itemPrice * quantity;

    const updatedWorkHistory = await WorkHistory.findByIdAndUpdate(
      id,
      { itemName, itemPrice, quantity, totalPrice },
      { new: true }
    );

    if (!updatedWorkHistory) {
      return res.status(404).json({ message: "Work history not found" });
    }

    res.status(200).json({
      message: "Work history updated successfully",
      workHistory: updatedWorkHistory,
    });
  } catch (err) {
    console.error("Error updating work history:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWorkHistory = await WorkHistory.findByIdAndDelete(id);

    if (!deletedWorkHistory) {
      return res.status(404).json({ message: "Work history not found" });
    }

    res.status(200).json({
      message: "Work history deleted successfully",
      deletedWorkHistory,
    });
  } catch (err) {
    console.error("Error deleting work history:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.get("/view-single/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const workHistory = await WorkHistory.findById(id).populate({
      path: "employeeId",
      select: "name mobile address",
    });

    if (!workHistory) {
      return res.status(404).json({ message: "Work history not found" });
    }

    res.status(200).json(workHistory);
  } catch (err) {
    console.error("Error fetching work history:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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
