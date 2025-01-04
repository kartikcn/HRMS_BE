const Schema = Mongoose.Schema;
const chapterEditionSchema = Mongoose.Schema(
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
        chapterEdition_id:{type:Number, unique:true}
    },
    {
        timestamps: true,
        chapterEdition_id:false,
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
const chapterEditionCounter = Mongoose.model('chapterEditionCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await chapterEditionCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


chapterEditionSchema.pre('save', async function (next) {
    if (!this.chapterEdition_id) {
        this.chapterEdition_id = await getNextSequenceValue('chapterEdition_id');
    }
    next();
});
module.exports = Mongoose.model("chapterEdition", chapterEditionSchema);
