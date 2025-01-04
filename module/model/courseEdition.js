const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const CourseEditionSchema = Mongoose.Schema(
    {
        author_name: { type: String },
        course_type: { type: String },
        course_title: { type: String },
        description: { type: String },
        is_active:{ type: Boolean, default: true},
        is_deleted: { type: Boolean, default: false},
        category_id: { type: Number},
        course_level:{type:String},
        status:{type:Number},
        amount:{type:Number},
        discount_amount:{type: String, default:null},
        discount_tenure:{type:String, default:null},
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
        cover_img: { type: String, default: null },
        courseedition_id:{type:Number, unique:true}
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
const CourseEditionCounter = Mongoose.model('CourseEditionCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await CourseEditionCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


CourseEditionSchema.pre('save', async function (next) {
    if (!this.courseedition_id) {
        this.courseedition_id = await getNextSequenceValue('courseedition_id');
    }
    next();
});
module.exports = Mongoose.model("CourseEdition", CourseEditionSchema);