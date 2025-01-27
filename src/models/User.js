const { mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  telegram: String,
  instagram: String,
  isPeriodPaid: Boolean,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  paymentPeriod: Number,
  numberOfPeople: Number,
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
