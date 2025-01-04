const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Activity_score_userSchema = Mongoose.Schema(
    {
        user_id: { type: Number, default: null },
        activity_id: { type: Number, default: null },
        activity_type: { type: String, default: null },

        poll_answer: { type: String, default: null },

        challenge_earn_score: { type: Number, default: null},
        challenge_total_score: { type: Number, default: null},

        quest_image: { type: JSON, default: null },

        activity_score_user_id: { type: Number, unique:true },
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
const activity_score_userCounter = Mongoose.model('activity_score_userCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await activity_score_userCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Activity_score_userSchema.pre('save', async function (next) {
    if (!this.activity_score_user_id) {
        this.activity_score_user_id = await getNextSequenceValue('activity_score_user_id');
    }
    next();
});
module.exports = Mongoose.model("activity_score_user", Activity_score_userSchema);
