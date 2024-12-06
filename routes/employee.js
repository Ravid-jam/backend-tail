const express = require("express");
const Employee = require("../models/Employee");
const EmployeeWork = require("../models/EmployeeWork");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

router.post("/create", authenticateToken, async (req, res) => {
  const { name, mobile, address, user } = req.body;

  if (!user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const existingEmployee = await Employee.findOne({ mobile });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee already exists with this mobile number" });
    }

    const newEmployee = new Employee({ name, mobile, address, user });
    await newEmployee.save();

    res.status(201).json({
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/get/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const employees = await Employee.find({ user: userId });
    if (employees.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees found for this user" });
    }

    const employeesWithWorkHistory = await Promise.all(
      employees.map(async (employee) => {
        const workHistory = await EmployeeWork.find({
          employeeId: employee._id,
        });

        // Convert employee to object and delete totalQuantity and totalPrice if present
        const employeeObj = employee.toObject();
        delete employeeObj.totalQuantity;
        delete employeeObj.totalPrice;

        return { ...employeeObj, workHistory };
      })
    );

    res.status(200).json({ employees: employeesWithWorkHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { name, address, mobile } = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, address, mobile },
      { new: true }
    );
    res.status(200).send(updatedEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-employee/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Employee get successfully", employee: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/delete-employee/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).send("Employee deleted successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
