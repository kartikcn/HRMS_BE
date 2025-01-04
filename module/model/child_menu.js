const Schema = Mongoose.Schema;
const Child_menuSchema = Mongoose.Schema(
    {
        title: { type: String, required: true }, 
        status: { type: Boolean, default: true },
        menu_id:{ type:Number },
        sub_menu_id:{ type:Number },
        child_menu_id:{ type:Number, unique:true },
        route:{ type: String, default: null },
        is_add:{type:Boolean, default:false},
        is_view:{type:Boolean, default:false},
        is_delete:{type:Boolean, default:false},
        is_edit:{type:Boolean, default:false},
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
const child_menuCounter = Mongoose.model('child_menuCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await child_menuCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


Child_menuSchema.pre('save', async function (next) {
    if (!this.child_menu_id) {
        this.child_menu_id = await getNextSequenceValue('child_menu_id');
    }
    next();
});
module.exports = Mongoose.model("child_menu", Child_menuSchema);
