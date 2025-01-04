const Schema = Mongoose.Schema;
const myLearningSchema = Mongoose.Schema(
    {
        user_id: { type: Number },
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
        end_time:{ type: String },
        module_id:{type:Number},
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
const chapterCounter = Mongoose.model('myLearningCounter', new Mongoose.Schema({
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


myLearningSchema.pre('save', async function (next) {
    if (!this.myLearning_id) {
        this.myLearning_id = await getNextSequenceValue('myLearning_id');
    }
    next();
});
module.exports = Mongoose.model("myLearning", myLearningSchema);
