const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Payment_detail_logSchema = Mongoose.Schema(
    {
        type: { type: String, default: null },
        amount: { type: Number, default: null },
        razorpay_order_id: { type: String, default: null },
        razorpay_payment_id: { type: String, default: null },
        razorpay_payment_res: { type: JSON, default: null },
        apple_data: { type: JSON, default: null },
        user_id: { type: Number, default:null }
    },
    {
        timestamps: true,
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
module.exports = Mongoose.model("Payment_detail_log", Payment_detail_logSchema);
