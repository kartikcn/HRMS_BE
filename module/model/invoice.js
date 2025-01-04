const Schema = Mongoose.Schema;
const InvoiceSchema = Mongoose.Schema(
    {
        course_id:{type:Number},
        event_id:{type:Number},
        user_id:{type:Number},
        invoice_no:{type: String},
        invoice_file:{type: String},
        invoice_id:{type:Number, unique:true}
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
const invoiceCounter = Mongoose.model('invoiceCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await invoiceCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


InvoiceSchema.pre('save', async function (next) {
    if (!this.invoice_id) {
        this.invoice_id = await getNextSequenceValue('invoice_id');
    }
    next();
});
module.exports = Mongoose.model("invoice", InvoiceSchema);
