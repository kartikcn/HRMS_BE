const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const CourseSchema = Mongoose.Schema(
    {
        author_name: { type: String },
        course_type: { type: String },
        course_title: { type: String },
        description: { type: String },
        is_deleted: { type: Boolean, default: false},
        category_id: { type: Number},
        is_active:{ type: Boolean, default: true},
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
        dummy_rating: { type: Number, default: null },
        best_course: { type: Boolean, default: false },
        is_favourite: { type: Boolean, default: false },
        courseedition_id:{type:Number, default: null},
        cover_img: { type: String, default: null },
        declined_user: { type: JSON, default: [] },
        course_id:{type:Number, unique:true}
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
const CourseCounter = Mongoose.model('CourseCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await CourseCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


CourseSchema.pre('save', async function (next) {
    if (!this.course_id) {
        this.course_id = await getNextSequenceValue('course_id');
    }
    next();
});
module.exports = Mongoose.model("Course", CourseSchema);
