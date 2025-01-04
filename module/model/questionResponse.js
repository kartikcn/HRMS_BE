const Schema = Mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const QuestionResponseSchema = Mongoose.Schema(
    {
        category_id:{type:Number},
        avg_score:{type:Number},
        attempt:{type:Number},
        user_id:{type:Number},
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
        questionResponse_id: { type: Number, unique: false },
    },
    {
        timestamps: true,
        questionResponse_id: false,
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

module.exports = Mongoose.model("questionResponse", QuestionResponseSchema);