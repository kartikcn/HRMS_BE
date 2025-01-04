const Schema = Mongoose.Schema;
const Contact_usSchema = Mongoose.Schema(
    {
        query: { type: String },
        user_id: { type: Number },
        contact_us_id:{type:Number, unique:true}
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
const contact_usCounter = Mongoose.model('contact_usCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await contact_usCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Contact_usSchema.pre('save', async function (next) {
    if (!this.contact_us_id) {
        this.contact_us_id = await getNextSequenceValue('contact_us_id');
    }
    next();
});
module.exports = Mongoose.model("contact_us", Contact_usSchema);
