const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const NoteSchema = Mongoose.Schema(
    {
        title: { type: String },
        description: { type: String },
        note_type: { type: String },
        is_deleted: { type: Boolean, default: false},
        course_id: { type: Number },
        module_id: { type: Number },
        user_id: { type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        created_by: { type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        modified_by: { type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deleted_by: { type: Schema.Types.ObjectId,
            ref: "User",
            default:null
        },
        deletedAt: { type: Date, default:null },
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
module.exports = Mongoose.model("Note", NoteSchema);
