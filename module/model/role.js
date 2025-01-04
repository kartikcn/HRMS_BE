const Schema = Mongoose.Schema;
const RoleSchema = Mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        priviledge_data: { type: JSON },
        status: { type: Boolean, default: true },
        role_id:{type:Number, unique:true}
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
const roleCounter = Mongoose.model('roleCounter', new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));

async function getNextSequenceValue(sequenceName) {
    const counter = await roleCounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return counter.seq;
}


RoleSchema.pre('save', async function (next) {
    if (!this.role_id) {
        this.role_id = await getNextSequenceValue('role_id');
    }
    next();
});
module.exports = Mongoose.model("role", RoleSchema);
