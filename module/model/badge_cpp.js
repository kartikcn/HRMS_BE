const Schema = Mongoose.Schema;
const Badge_cppSchema = Mongoose.Schema(
    {
        user_id: { type: Number },
        cpp: { type: Number, default: 0 },
        post_count_used: { type: Number, default: 0 },
        connect_count_used: { type: Number, default: 0 },
        certificate_count_used: { type: Number, default: 0 },
        badge_cpp_id:{ type:Number, unique:true }
    },
    {
        timestamps: true,
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
const badge_cppCounter = Mongoose.model('badge_cppCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await badge_cppCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Badge_cppSchema.pre('save', async function (next) {
    if (!this.badge_cpp_id) {
        this.badge_cpp_id = await getNextSequenceValue('badge_cpp_id');
    }
    next();
});
module.exports = Mongoose.model("badge_cpp", Badge_cppSchema);
