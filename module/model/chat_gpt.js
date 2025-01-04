const Schema = Mongoose.Schema;
const Chat_gptSchema = Mongoose.Schema(
    {
        user_id: { type: Number, default: null },
        question: { type: String, default: null },
        gpt_answer: { type: String, default: null },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        chat_gpt_id: { type: Number, unique:true },

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
const chat_gptCounter = Mongoose.model('chat_gptCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await chat_gptCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Chat_gptSchema.pre('save', async function (next) {
    if (!this.chat_gpt_id) {
        this.chat_gpt_id = await getNextSequenceValue('chat_gpt_id');
    }
    next();
});
module.exports = Mongoose.model("Chat_gpt", Chat_gptSchema);