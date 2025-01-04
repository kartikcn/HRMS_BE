const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const CourseLogSchema = Mongoose.Schema(
    {
        courselog_id: { type: Number, unique:true },
        course_id: { type: Number },
        courseEdition_id:{type:Number},
        chapterEdition_id: { type: Number },
        action: { type: String },
        remark:{type:String, default:null},
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        created_date: { type: Date }
    },
    {
        timestamps: true,
        course_id:false,
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
const CourseLogCounter = Mongoose.model('CourseLogCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await CourseLogCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


CourseLogSchema.pre('save', async function (next) {
    if (!this.courselog_id) {
        this.courselog_id = await getNextSequenceValue('courselog_id');
    }
    next();
});
module.exports = Mongoose.model("CourseLog", CourseLogSchema);
