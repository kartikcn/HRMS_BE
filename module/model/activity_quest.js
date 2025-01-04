const Schema = Mongoose.Schema;
const Activity_questSchema = Mongoose.Schema(
    {
        quest_title: { type: String },
        description: { type: String },
        type:{type:String},
        activity_id: { type: Number },
        community_id: { type: Number },
        is_deleted: { type: Boolean, default: false },
        activityType_id:{ type:Number, unique:true }
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
const activity_questCounter = Mongoose.model('activity_questCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await activity_questCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Activity_questSchema.pre('save', async function (next) {
    if (!this.activityType_id) {
        this.activityType_id = await getNextSequenceValue('activityType_id');
    }
    next();
});
module.exports = Mongoose.model("activity_quest", Activity_questSchema);
