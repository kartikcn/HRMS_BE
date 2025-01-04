const Schema = Mongoose.Schema;
const chapterSchema = Mongoose.Schema(
    {
        chapter_title: { type: String },
        modified_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        modified_date: { type: Date, default:null },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        created_date: { type: Date },
        deleted_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_date: { type: Date, default:null },
        course_id:{ type: Number },
        chapterEdition_id:{ type: Number },
        chapter_id:{type:Number, unique:true}
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
const chapterCounter = Mongoose.model('chapterCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await chapterCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


chapterSchema.pre('save', async function (next) {
    if (!this.chapter_id) {
        this.chapter_id = await getNextSequenceValue('chapter_id');
    }
    next();
});
module.exports = Mongoose.model("chapter", chapterSchema);
