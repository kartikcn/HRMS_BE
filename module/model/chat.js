const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const ChatSchema = Mongoose.Schema(
    {
        chat_value : { type: String },
        user_id: { type: Number },
        message: { type: String },
        post_id: { type: Number },
        is_deleted: { type: Boolean, default: false },
        chat_id: { type: Number, unique:true },

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
const chatCounter = Mongoose.model('chatCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await chatCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


ChatSchema.pre('save', async function (next) {
    if (!this.chat_id) {
        this.chat_id = await getNextSequenceValue('chat_id');
    }
    next();
});
module.exports = Mongoose.model("chat", ChatSchema);
