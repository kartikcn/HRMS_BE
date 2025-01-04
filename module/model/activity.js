const Schema = Mongoose.Schema;
const ActivitySchema = Mongoose.Schema(
    {
        type: { type: String },
        community_id: { type: Number },
        content_type: { type: String },
        content_title: { type: String },
        description: { type: String },
        start_date: { type: String },
        end_date: { type: String },
        provided_timer: { type: String },
        status: { type: String, default: "active" },
        is_deleted: { type: Boolean, default: false },
        activity_status: { type: String, default: "Draft" },
        activity_id:{ type:Number, unique:true }
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
const activityCounter = Mongoose.model('activityCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await activityCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


ActivitySchema.pre('save', async function (next) {
    if (!this.activity_id) {
        this.activity_id = await getNextSequenceValue('activity_id');
    }
    next();
});
module.exports = Mongoose.model("activity", ActivitySchema);
