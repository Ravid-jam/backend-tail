const express = require("express");
const Merchant = require("../models/Merchant");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
const mongoose = require("mongoose");
router.post("/create", authenticateToken, async (req, res) => {
  const { name, mobile, address, user } = req.body;

  const existingMerchant = await Merchant.findOne({ mobile });
  if (existingMerchant) {
    return res
      .status(400)
      .json({ message: "Merchant already exists with this mobile number" });
  }

  const newMerchant = new Merchant({ name, mobile, address, user });
  await newMerchant.save();

  res
    .status(201)
    .json({ message: "Merchant created successfully", merchant: newMerchant });
});

router.get("/get/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const merchants = await Merchant.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "merchantId",
          as: "stocks",
        },
      },
      {
        $addFields: {
          totalStockPrice: {
            $sum: {
              $map: {
                input: "$stocks",
                as: "stock",
                in: { $multiply: ["$$stock.quantity", "$$stock.price"] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          mobile: 1,
          address: 1,
          totalStockPrice: 1,
          stocks: 1,
        },
      },
    ]);

    if (merchants.length === 0) {
      return res
        .status(404)
        .json({ message: "No merchants found for this user" });
    }

    res.status(200).json(merchants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const merchant = await Merchant.findById(id);

  if (!merchant) {
    return res.status(404).json({ message: "Merchant not found" });
  }

  res.status(200).json(merchant);
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, mobile, address } = req.body;

  const updatedMerchant = await Merchant.findByIdAndUpdate(
    id,
    { name, mobile, address },
    { new: true }
  );

  if (!updatedMerchant) {
    return res.status(404).json({ message: "Merchant not found" });
  }

  res.status(200).json({
    message: "Merchant updated successfully",
    merchant: updatedMerchant,
  });
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  const deletedMerchant = await Merchant.findByIdAndDelete(id);

  if (!deletedMerchant) {
    return res.status(404).json({ message: "Merchant not found" });
  }

  res.status(200).json({ message: "Merchant deleted successfully" });
});

module.exports = router;
