const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["received", "given"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  stockPrice: {
    type: Number,
    required: true,
  },
  totalStockPrice: {
    type: Number,
    required: true,
  },
});

const StockHistory = mongoose.model("StockHistory", stockHistorySchema);

module.exports = StockHistory;
