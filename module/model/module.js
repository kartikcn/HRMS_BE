const Schema = Mongoose.Schema;
const ModuleSchema = Mongoose.Schema(
    {
        module_header:{type:String},
        course_id:{type:Number},
        module_description:{type:String},
        module_link:{type:String},
        module_pdf: {type: String},
        chapter_id:{ type:Number }, 
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
        moduleEdition_id:{type:Number},
        module_id:{type:Number, unique:true}
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
const moduleCounter = Mongoose.model('moduleCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await moduleCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


ModuleSchema.pre('save', async function (next) {
    if (!this.module_id) {
        this.module_id = await getNextSequenceValue('module_id');
    }
    next();
});
module.exports = Mongoose.model("module", ModuleSchema);
