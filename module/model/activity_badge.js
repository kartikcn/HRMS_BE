const Schema = Mongoose.Schema;
const Activity_badgeSchema = Mongoose.Schema(
    {
        score: { type: Number, default: null},
        badge: { type: String, default: null},
        badge_type: { type: String, default: null},
        user_id: { type: Number, default: null},
        activity_id: { type: Number, default: null},
        type: { type: String, default: null},
        is_subscribe: { type: Boolean, default: false },
        activity_badge_id: { type: Number, unique:true }
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
const activity_badgeCounter = Mongoose.model('activity_badgeCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await activity_badgeCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Activity_badgeSchema.pre('save', async function (next) {
    if (!this.activity_badge_id) {
        this.activity_badge_id = await getNextSequenceValue('activity_badge_id');
    }
    next();
});
module.exports = Mongoose.model("activity_badge", Activity_badgeSchema);
