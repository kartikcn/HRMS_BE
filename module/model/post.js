const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const PostSchema = Mongoose.Schema(
    {
        images : { type: Array, default: null },
        description : { type: String, default: null },
        user_id: { type: Number },
        repost_id: { type: Number, default: null },
        post_id: { type: Number, unique:true },

        is_deleted: { type: Boolean, default: false },

        shared_post_id: { type: Number, default: null },
        shared_repost_id: { type: Number, default: null },
        shared_by_user_id: { type: Number, default: null },

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
const postCounter = Mongoose.model('postCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await postCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


PostSchema.pre('save', async function (next) {
    if (!this.post_id) {
        this.post_id = await getNextSequenceValue('post_id');
    }
    next();
});
module.exports = Mongoose.model("post", PostSchema);
