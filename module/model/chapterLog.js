const Schema = Mongoose.Schema;
const chapterLogSchema = Mongoose.Schema(
    {
        course_id:{ type: Number },
        chapter_id:{type:Number},
        chapterlog_id:{type:Number, unique:true},
        remark:{type:String},
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        created_date: { type: Date }
    },
    {
        timestamps: true,
        chapter_id:false,
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
const chapterLogCounter = Mongoose.model('chapterLogCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await chapterLogCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


chapterLogSchema.pre('save', async function (next) {
    if (!this.chapterlog_id) {
        this.chapterlog_id = await getNextSequenceValue('chapterlog_id');
    }
    next();
});
module.exports = Mongoose.model("chapterLog", chapterLogSchema);
