const Schema = Mongoose.Schema;
const CommunitySchema = Mongoose.Schema(
    {
        community_type: { type: String },
        community_title: { type: String },
        community_description: { type: String },
        is_deleted: { type: Boolean, default: false},
        is_active:{ type: Boolean, default: false},
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
        declined_user: { type: JSON, default: [] },
        course_id:{type:Number},
        community_id:{type:Number, unique:true}
    },
    {
        timestamps: true,
        community_id:false,
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
const CommunityCounter = Mongoose.model('CommunityCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await CommunityCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


CommunitySchema.pre('save', async function (next) {
    if (!this.community_id) {
        this.community_id = await getNextSequenceValue('community_id');
    }
    next();
});
module.exports = Mongoose.model("community", CommunitySchema);
