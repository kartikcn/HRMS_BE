const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const User_register_eventSchema = Mongoose.Schema(
    {
        user_id: { type: Number },
        event_id: { type: Number },
        paid_amount: { type: Number },
        attend_event: { type: Boolean, default: true },
        event_booking_id: { type: String, default: null },
        payment_detail_id: {
            type: Schema.Types.ObjectId,
            ref: "Payment_detail",
            default:null
        },
        refund_status: { type: Boolean, default: false },
        refund_reason: { type: String, default: null },
        user_register_event_id: { type: Number, unique:true },

        // created_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
        // modified_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
        // deleted_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
        // deleted_date: { type: Date, default:null },
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
const user_register_eventCounter = Mongoose.model('user_register_eventCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await user_register_eventCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


User_register_eventSchema.pre('save', async function (next) {
    if (!this.user_register_event_id) {
        this.user_register_event_id = await getNextSequenceValue('user_register_event_id');
    }
    next();
});
module.exports = Mongoose.model("user_register_event", User_register_eventSchema);
