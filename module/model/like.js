const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const LikeSchema = Mongoose.Schema(
    {
        post_id: { type: Number },
        user_id: { type: Number },
        like_status: { type: Boolean },
        like_id: { type: Number, unique: true }
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
const likeCounter = Mongoose.model('likeCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await likeCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


LikeSchema.pre('save', async function (next) {
    if (!this.like_id) {
        this.like_id = await getNextSequenceValue('like_id');
    }
    next();
});
module.exports = Mongoose.model("like", LikeSchema);
