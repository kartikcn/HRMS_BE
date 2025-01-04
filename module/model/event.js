const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const EventSchema = Mongoose.Schema(
    {
        type : { type: String, default: null },
        name : { type: String, default: null },
        seat : { type: Number, default: null },
        image : { type: String, default: null },
        amount : { type: Number, default: null },
        description : { type: String, default: null },
        registration_from_link: { type: String, default: null },

        start_date : { type: String, default: null },
        end_date : { type: String, default: null },
        
        // start_time : { type: String, required: true },
        // end_time : { type: String, required: true },

        join_link : { type: String, default: null },
        address : { type: String, default: null },

        media: { type: JSON, default: null },
        testimonial: { type: String, default: null },
        hosted_by: { type: String, default: null },

        is_deleted: { type: Boolean, default: false },
        status: { type: Boolean, default: true },
        event_id: { type: Number, unique:true },

        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        modified_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_date: { type: Date, default:null },
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
const eventCounter = Mongoose.model('eventCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await eventCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


EventSchema.pre('save', async function (next) {
    if (!this.event_id) {
        this.event_id = await getNextSequenceValue('event_id');
    }
    next();
});
module.exports = Mongoose.model("event", EventSchema);
