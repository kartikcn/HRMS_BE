const Schema = Mongoose.Schema;
const moduleEditionSchema = Mongoose.Schema(
    {
        module_header:{type:String},
        course_id:{type:Number},
        module_description:{type:String},
        module_link:{type:String},
        module_pdf:{type:String},
        chapterEdition_id:{ type:Number },
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
        moduleEdition_id:{type:Number, unique:true}
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
const moduleEditionCounter = Mongoose.model('moduleEditionCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await moduleEditionCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


moduleEditionSchema.pre('save', async function (next) {
    if (!this.moduleEdition_id) {
        this.moduleEdition_id = await getNextSequenceValue('moduleEdition_id');
    }
    next();
});
module.exports = Mongoose.model("moduleEdition", moduleEditionSchema);
