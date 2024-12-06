const mongoose = require("mongoose");

const workHistorySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  itemName: { type: String, required: true },
  itemPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});
workHistorySchema.pre("save", function (next) {
  this.totalPrice = this.itemPrice * this.quantity;
  next();
});

module.exports = mongoose.model("WorkHistory", workHistorySchema);
