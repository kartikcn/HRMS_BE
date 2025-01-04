const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const FeedbackSchema = Mongoose.Schema(
    {
        description:{type:String, default: null},
        course_id:{type:Number, default: null},
        user_id:{type:Number, default: null},
        feedback_id: {type: Number},
        user_rating: {type: Number, default: 0},
        feed_type:{type: String, default: null},
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        modified_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_date: { type: Date, default:null }
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
const feedbackCounter = Mongoose.model('feedbackCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await feedbackCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


FeedbackSchema.pre('save', async function (next) {
    if (!this.feedback_id) {
        this.feedback_id = await getNextSequenceValue('feedback_id');
    }
    next();
});
module.exports = Mongoose.model("feedback", FeedbackSchema);
