const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const NotificationLogSchema = Mongoose.Schema(
    {
        user_id: { type: Number, default: null },
        event_id: { type: Number, default: null },
        course_id: { type: Number, default: null },
        title: { type: String },
        message: { type: String },
        type: { type: String },
        deleted_by: { type: Schema.Types.ObjectId,
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

const notificationLogCounter = Mongoose.model('notificationLogCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await notificationLogCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


NotificationLogSchema.pre('save', async function (next) {
    if (!this.notificationLog_id) {
        this.notificationLog_id = await getNextSequenceValue('notificationLog_id');
    }
    next();
});

module.exports = Mongoose.model("notificationLog", NotificationLogSchema);
