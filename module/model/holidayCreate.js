const Mongoose = require("mongoose");

const HolidaySchema = new Mongoose.Schema(
  {
    holiday_name: {
      type: String,
      required: true,
    },
    holiday_date: {
      type: Date,
      required: true,
    },
    is_compulsory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("holidayCreate", HolidaySchema);
