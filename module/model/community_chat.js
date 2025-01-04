const Schema = Mongoose.Schema;
const Community_chatSchema = Mongoose.Schema(
    {
        type: { type: String, default: "text" },
        message: { type: String, default: null },
        user_id: { type: Number, default: null },
        activity_id: { type: Number, default: null },
        community_id: { type: Number, default: null },
        community_chat_id: { type: Number, unique:true },

        is_deleted: { type: Boolean, default: false},
        media: { type: JSON, default: null },

        reply_community_chat_id: { type: Number, default: null },
        // created_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
        // modified_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
        // deleted_by: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        //     default:null
        // },
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
const Community_chatCounter = Mongoose.model('Community_chatCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await Community_chatCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}

Community_chatSchema.pre('save', async function (next) {
    if (!this.community_chat_id) {
        this.community_chat_id = await getNextSequenceValue('community_chat_id');
    }
    next();
});
module.exports = Mongoose.model("community_chat", Community_chatSchema);
