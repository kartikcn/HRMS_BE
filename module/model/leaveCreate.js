const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const LeaveSchema = new Mongoose.Schema(
  {
    leave_name: { type: String },
    leave_code: { type: String, unique: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// const LeaveCreate = Mongoose.model("leaveCreate", LeaveSchema);

module.exports = Mongoose.model("leaveCreate", LeaveSchema);
