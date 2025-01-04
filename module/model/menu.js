const Schema = Mongoose.Schema;
const MenuSchema = Mongoose.Schema(
    {
        title: { type: String, required: true }, 
        status: { type: Boolean, default: true },
        route:{ type: String, default: null },
        menu_id:{ type:Number, unique:true }
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
const menuCounter = Mongoose.model('menuCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await menuCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


MenuSchema.pre('save', async function (next) {
    if (!this.menu_id) {
        this.menu_id = await getNextSequenceValue('menu_id');
    }
    next();
});
module.exports = Mongoose.model("menu", MenuSchema);
