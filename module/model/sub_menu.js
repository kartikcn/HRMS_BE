const Schema = Mongoose.Schema;
const Sub_menuSchema = Mongoose.Schema(
    {
        title: { type: String, required: true }, 
        status: { type: Boolean, default: true },
        menu_id:{ type:Number },
        sub_menu_id:{ type:Number, unique:true },
        route:{ type: String, default: null },
        is_add:{type:Boolean, default:false},
        is_view:{type:Boolean, default:false},
        is_delete:{type:Boolean, default:false},
        is_view:{type:Boolean, default:false},
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
const sub_menuCounter = Mongoose.model('sub_menuCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await sub_menuCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Sub_menuSchema.pre('save', async function (next) {
    if (!this.sub_menu_id) {
        this.sub_menu_id = await getNextSequenceValue('sub_menu_id');
    }
    next();
});
module.exports = Mongoose.model("sub_menu", Sub_menuSchema);
