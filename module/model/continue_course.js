const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Contunue_courseSchema = Mongoose.Schema(
    {
        course_id: { type: Number },
        chapter_id: { type: Number },
        module_id: { type: Number },
        end_time: { type: String },
        status: { type: String },
        user_id: { type: Number },

        is_deleted: { type: Boolean, default: false},
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
        continue_course_id:{type:Number, unique:true}
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
const Contunue_courseCounter = Mongoose.model('Contunue_courseCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await Contunue_courseCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Contunue_courseSchema.pre('save', async function (next) {
    if (!this.continue_course_id) {
        this.continue_course_id = await getNextSequenceValue('continue_course_id');
    }
    next();
});
module.exports = Mongoose.model("Contunue_course", Contunue_courseSchema);
