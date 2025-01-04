const Schema = Mongoose.Schema;
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const SubscriptionSchema = Mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    payment_type: { type: String, required: true },
    button_name: { type: String, default:null },
    amount: { type: Number, default:null },
    subscription_type: { type: String, default:null },
    is_deleted: { type: Boolean, default:false },
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
module.exports = Mongoose.model("Subscription", SubscriptionSchema);
