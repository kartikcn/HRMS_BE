const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const FaqSchema = Mongoose.Schema(
    {
        question: { type: String },
        answer: { type: String },
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
module.exports = Mongoose.model("Faq", FaqSchema);
