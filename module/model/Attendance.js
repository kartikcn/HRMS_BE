const Mongoose = require("mongoose");

const AttendanceSchema = new Mongoose.Schema(
  {
    user_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    login_time: { type: Date },
    logout_time: { type: Date },
    status: {
      type: String,
      enum: ["logged_in", "logged_out"],
      default: "logged_out",
    },
    reason: { type: String },
    // latitude: { type: Number },
    // longitude: { type: Number },
    // office_location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point",
    //   },
    //   coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    // },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial query
AttendanceSchema.index({ office_location: "2dsphere" });

module.exports = Mongoose.model("Attendance", AttendanceSchema);
