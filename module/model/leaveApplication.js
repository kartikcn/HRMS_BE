const Mongoose = require("mongoose");

const LeaveApplicationSchema = new Mongoose.Schema(
  {
    user_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from_date: {
      type: Date,
      required: true,
    },
    to_date: {
      type: Date,
      required: true,
    },
    leave_code: {
      type: String,
      required: true,
    },
    leave_reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("leaveApplication", LeaveApplicationSchema);
