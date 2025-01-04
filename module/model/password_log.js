const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const Password_logSchema = Mongoose.Schema(
    {
        user_email: { type: String },
        old_password: { type: String },
        new_password: { type: String },
        modified_by: { type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        }
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
module.exports = Mongoose.model("Password_log", Password_logSchema);
