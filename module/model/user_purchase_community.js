const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const User_purchase_communitySchema = Mongoose.Schema(
    {
        type: { type: String },
        user_id: { type: Number },
        course_id: { type: Number },
        courseedition_id: { type: Number },
        community_id: { type: Number },
        paid_amount: { type: Number },
        payment_detail_id: {
            type: Schema.Types.ObjectId,
            ref: "Payment_detail",
            default:null
        },
        user_purchase_community_id: { type: Number, unique:true },

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
const user_purchase_communityCounter = Mongoose.model('user_purchase_communityCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await user_purchase_communityCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


User_purchase_communitySchema.pre('save', async function (next) {
    if (!this.user_purchase_community_id) {
        this.user_purchase_community_id = await getNextSequenceValue('user_purchase_community_id');
    }
    next();
});
module.exports = Mongoose.model("user_purchase_community", User_purchase_communitySchema);
