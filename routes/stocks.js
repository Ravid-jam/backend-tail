const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const Merchant = require("../models/Merchant");
const StockHistory = require("../models/StockHistory");

router.post("/create", async (req, res) => {
  try {
    const { merchantId, name, quantity, price } = req.body;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    const newStock = new Stock({ merchantId, name, quantity, price });
    await newStock.save();

    const stockHistory = new StockHistory({
      stockId: newStock._id,
      merchantId,
      quantity,
      transactionType: "received",
      stockPrice: price,
      totalStockPrice: newStock.totalStockPrice,
    });

    await stockHistory.save();

    res
      .status(201)
      .json({ message: "Stocks added successfully", data: newStock });
  } catch (err) {
    res.status(500).json({ message: "Error adding stock", error: err });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { name, merchantId, quantity, price } = req.body;
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    stock.quantity = quantity;

    if (price) {
      stock.price = price;
    }

    stock.totalStockPrice = stock.quantity * stock.price;
    stock.name = name;
    stock.merchantId = merchantId;
    await stock.save();

    const stockHistory = new StockHistory({
      stockId: stock._id,
      merchantId: stock.merchantId,
      quantity,
      transactionType: "received",
      stockPrice: price || stock.price,
      totalStockPrice: stock.totalStockPrice,
    });

    await stockHistory.save();

    res
      .status(200)
      .json({ message: "Stock updated successfully", data: stock });
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err });
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.status(200).json(stock);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stock", error: err });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    // Find the stock first to access its details
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Create stock history entry before deleting the stock
    const stockHistory = new StockHistory({
      stockId: stock._id,
      merchantId: stock.merchantId,
      quantity: stock.quantity,
      transactionType: "given",
      stockPrice: stock.price,
      totalStockPrice: stock.totalStockPrice,
    });

    await stockHistory.save();

    // Delete the stock after creating the history
    await Stock.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting stock", error: err });
  }
});

router.get("/view/:merchantId", async (req, res) => {
  try {
    const stocks = await Stock.find({ merchantId: req.params.merchantId });

    if (!stocks) {
      return res
        .status(404)
        .json({ message: "No stocks found for this merchant" });
    }

    res.status(200).json(stocks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stocks", error: err });
  }
});

router.get("/history/:stockId", async (req, res) => {
  try {
    const history = await StockHistory.find({ stockId: req.params.stockId });

    if (!history || history.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this stock" });
    }

    res.status(200).json(history);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching stock history", error: err });
  }
});

router.get("/totals/:merchantId", async (req, res) => {
  try {
    const stocks = await Stock.find({ merchantId: req.params.merchantId });
    const totalQuantity = stocks.reduce(
      (acc, stock) => acc + stock.quantity,
      0
    );
    const totalValue = stocks.reduce(
      (acc, stock) => acc + stock.totalStockPrice,
      0
    );

    res.status(200).json({ totalQuantity, totalValue });
  } catch (err) {
    res.status(500).json({ message: "Error calculating totals", error: err });
  }
});

module.exports = router;
