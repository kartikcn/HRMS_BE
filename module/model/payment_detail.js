const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Payment_detailSchema = Mongoose.Schema(
    {
        type: { type: String, default:null },
        paid_amount: { type: Number, default:null },
        total_amount: { type: Number, default:null },

        payment_method: { type: String, default:null },
        razorpay_order_id: { type: String, default:null },
        razorpay_signature: { type: String, default:null },
        razorpay_payment_id: { type: String, default:null },
        razorpay_payment_status: { type: String, default:null },
        razorpay_payment_response: { type: JSON, default:null },

        invoice_no: { type: String, default: null },
        invoice_file: { type: String, default: null },

        user_id: { type: Number, default:null },
        event_id: { type: Number, default:null },
        event_booking_id: { type: String, default: null },
        course_id: { type: Number, default:null },
        community_id: { type: Number, default: null },
        subscription_id: { 
            type: Schema.Types.ObjectId,
            ref: "Subscription",
            default:null
        },

        expiry_date : { type: String, default: null },
        payment_status : { type: String, default: "active" },
        apple_data : { type: JSON, default:null },
        created_by: { type: Number, default:null },
        modified_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deletedAt: { type: Date, default:null },
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
module.exports = Mongoose.model("Payment_detail", Payment_detailSchema);
