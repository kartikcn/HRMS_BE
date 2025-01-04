const Schema = Mongoose.Schema;
const EventFAQSchema = Mongoose.Schema(
    {
        event_id: { type: Number, required: true },
        question: { type: String },
        answer: { type: String },
        eventFAQ_id:{type:Number, unique:true},
        deleted_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_date: { type: Date, default:null },
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
const eventFAQCounter = Mongoose.model('eventFAQCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await eventFAQCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


EventFAQSchema.pre('save', async function (next) {
    if (!this.eventFAQ_id) {
        this.eventFAQ_id = await getNextSequenceValue('eventFAQ_id');
    }
    next();
});
module.exports = Mongoose.model("event_faq", EventFAQSchema);
