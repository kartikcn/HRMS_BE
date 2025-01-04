const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const OTPSchema = Mongoose.Schema(
    {
        otp: { type: Number},
        otp_action: { type: String },
        user_email: { type: String },
        user_id: { type: String },
        updated_date : { type: Date},
        updated_by : { type: mongoose.Types.ObjectId, ref: "User" },
        created_by : { type: mongoose.Types.ObjectId, ref: "User" },
        created_date : { type: Date},
        deleted_by : { type: mongoose.Types.ObjectId, ref: "User" },
        deleted_date : { type: Date},
    },
    {
        timestamps: true,
        otp_id: false,
        toObject: {
            virtuals: true,
            getters: true,
        },
        toJSON: {
            virtuals: true,
            getters: true,
        },
    }
);
module.exports = Mongoose.model("OTP", OTPSchema);
