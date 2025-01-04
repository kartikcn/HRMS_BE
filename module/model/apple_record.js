const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Apple_recordSchema = Mongoose.Schema(
    {
        authorizationCode: { type: String, default: null },
        authorizedScopes: { type: JSON, default: null },
        email: { type: String, default: null },
        fullName: { type: JSON, default: null },
        identityToken: { type: String, default: null },
        nonce: { type: String, default: null },
        realUserStatus: { type: Number, default: null },
        state: { type: String, default: null },
        user: { type: String, default: null },
        apple_id: { type: String, default: null },
        apple_record_id: { type:Number, unique:true },
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
const apple_recordCounter = Mongoose.model('apple_recordCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await apple_recordCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Apple_recordSchema.pre('save', async function (next) {
    if (!this.apple_record_id) {
        this.apple_record_id = await getNextSequenceValue('apple_record_id');
    }
    next();
});
module.exports = Mongoose.model("apple_record", Apple_recordSchema);
