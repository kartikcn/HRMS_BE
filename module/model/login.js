const Schema = Mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(Mongoose);
const bcrypt = require("bcryptjs");

const LoginSchema = Mongoose.Schema(
    {
        email:{ type: String},
        password: { type: String},
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        created_date: { type: Date },
        last_login_dt: { type: Date },
        login_id: { type: Number, unique: true },
        user_id:{type:Number}
    },
    {
        timestamps: true,
        login_id: false,
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

const Counter = Mongoose.model('LoginCounter', new Mongoose.Schema({
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


LoginSchema.pre('save', async function (next) {
    if (!this.login_id) {
        this.login_id = await getNextSequenceValue('login_id');
    }
    next();
});

LoginSchema.methods.isCorrectPassword = async function (password) {
    var check_pass = await bcrypt.compare(password, this.password);
    return check_pass;
};

LoginSchema.methods.isModified = async function (password) {
  var hash_data = await bcrypt.hash(password, 10);
  return hash_data;
};

const Login = Mongoose.model('login', LoginSchema);


module.exports = Mongoose.model("login", LoginSchema);