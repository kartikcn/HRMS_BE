const Schema = Mongoose.Schema;
const Activity_challengeSchema = Mongoose.Schema(
    {
        question: { type: String },
        option1: { type: String },
        option2: { type: String },
        option3: { type: String },
        option4: { type: String },
        correctanswer: { type: Number },
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
const activity_challengeCounter = Mongoose.model('activity_challengeCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await activity_challengeCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Activity_challengeSchema.pre('save', async function (next) {
    if (!this.activityType_id) {
        this.activityType_id = await getNextSequenceValue('activityType_id');
    }
    next();
});
module.exports = Mongoose.model("activity_challenge", Activity_challengeSchema);
