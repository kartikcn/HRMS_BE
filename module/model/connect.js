const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const ConnectSchema = Mongoose.Schema(
    {
        user_id: { type: Number },
        c_user_id: { type: Number },
        chat_value: { type: String },
        connected: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        connect_id: { type: Number, unique:true },

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
const connectCounter = Mongoose.model('connectCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await connectCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


ConnectSchema.pre('save', async function (next) {
    if (!this.connect_id) {
        this.connect_id = await getNextSequenceValue('connect_id');
    }
    next();
});
module.exports = Mongoose.model("connect", ConnectSchema);
