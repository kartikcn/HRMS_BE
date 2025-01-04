const Mongoose = require("mongoose");
const CreditLeaveSchema = new Mongoose.Schema({
  leave_code: { type: String, required: true },
  user_id: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // User receiving the leave
  leaveType: { type: String, enum: ["credit", "debit"], required: true },
  assigned_leaves: { type: Number, required: true }, // Number of leaves assigned
  assigned_by: { type: Mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who assigned the leave
  assigned_date: { type: Date, default: Date.now },
});
module.exports = Mongoose.model("creditLeave", CreditLeaveSchema);
