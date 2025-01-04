const Schema = Mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const CategorySchema = Mongoose.Schema(
    {
        category_name : {type:String},
        is_active : {type:Boolean, default:true},
        total_books:{type:Number, default:0},
        videos:{type:Number, default:0},
        shorts:{type:Number, default:0},
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
        category_id: { type: Number, unique: true },
    },
    {
        timestamps: true,
        category_id: false,
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

CategorySchema.pre("save", function (next) {
    this.wasNew = this.isNew;
    console.log(this.category_name,'tis.firstnaem');
    if (!(this.category_name)) {
        this.category_name = this.category_name.trim() ;
    } 
    next();
});

const Counter = Mongoose.model('CategoryCounter', new Mongoose.Schema({
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


CategorySchema.pre('save', async function (next) {
    if (!this.category_id) {
        this.category_id = await getNextSequenceValue('category_id');
    }
    next();
});

const category = Mongoose.model('category', CategorySchema);


module.exports = Mongoose.model("category", CategorySchema);