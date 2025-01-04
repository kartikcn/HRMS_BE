const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const AssignmentSchema = Mongoose.Schema(
    {
        question: { type: String },
        option1: { type: String },
        option2: { type: String },
        option3: { type: String },
        option4: { type: String},
        correctanswer: { type: Number},
        course_id:{type:Number},
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
        assignment_id:{type:Number, unique:true}
    },
    {
        timestamps: true,
        assignment_id:false,
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
const AssignmentCounter = Mongoose.model('AssignmentCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await AssignmentCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


AssignmentSchema.pre('save', async function (next) {
    if (!this.assignment_id) {
        this.assignment_id = await getNextSequenceValue('assignment_id');
    }
    next();
});
module.exports = Mongoose.model("assignment", AssignmentSchema);
