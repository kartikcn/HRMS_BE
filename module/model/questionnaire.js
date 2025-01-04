const Schema = Mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const QuestionnaireSchema = Mongoose.Schema(
    {
        questions : {type:String},
        category_id:{type:Number},
        sequenceNumber:{type:Number},
        modified_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        modified_date: { type: Date, default:null },
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
        question_id: { type: Number, unique: true },
    },
    {
        timestamps: true,
        question_id: false,
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

QuestionnaireSchema.pre("save", function (next) {
    this.wasNew = this.isNew;
    console.log(this.questions,'tis.firstnaem');
    next();
});

const Counter = Mongoose.model('questionnaireCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await Counter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


QuestionnaireSchema.pre('save', async function (next) {
    if (!this.question_id) {
        this.question_id = await getNextSequenceValue('question_id');
    }
    next();
});


module.exports = Mongoose.model("questionnaire", QuestionnaireSchema);