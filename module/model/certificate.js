const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const CertificateSchema = Mongoose.Schema(
    {
        certificate_id: { type: Number, unique:true },
        course_id: { type: Number },
        user_id: { type: Number },
        certificate: { type: String, default: null },
        img_certificate: { type: String, default: null },
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
const CertificateCounter = Mongoose.model('CertificateCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await CertificateCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


CertificateSchema.pre('save', async function (next) {
    if (!this.certificate_id) {
        this.certificate_id = await getNextSequenceValue('certificate_id');
    }
    next();
});
module.exports = Mongoose.model("Certificate", CertificateSchema);
