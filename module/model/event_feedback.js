const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Event_feedbackSchema = Mongoose.Schema(
    {
        user_id: { type: Number, default: null },
        event_id: { type: Number, default: null },
        message: { type: String, default: null },
        is_deleted: { type: Boolean, default: false },
        event_feedback_id: { type: Number, unique:true },

    },
    {
        timestamps: true,
        module_id:false,
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
const event_feedbackCounter = Mongoose.model('event_feedbackCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await event_feedbackCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Event_feedbackSchema.pre('save', async function (next) {
    if (!this.event_feedback_id) {
        this.event_feedback_id = await getNextSequenceValue('event_feedback_id');
    }
    next();
});
module.exports = Mongoose.model("event_feedback", Event_feedbackSchema);
