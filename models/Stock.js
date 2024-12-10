const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalStockPrice: {
    type: Number,
    default: 0,
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

stockSchema.pre("save", function (next) {
  this.totalStockPrice = this.quantity * this.price;
  next();
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
