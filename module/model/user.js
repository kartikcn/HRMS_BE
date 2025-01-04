const Schema = Mongoose.Schema;
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const AutoIncrement = require("mongoose-sequence")(Mongoose);

const UsersSchema = Mongoose.Schema(
  {
    email: { type: String },
    first_name: { type: String },
    loggedin_via: { type: String },
    usertype_in: { type: Boolean },
    role_id: { type: Number },
    country_code: { type: Number, default: 91 },
    mobile_no: { type: Number, default: 0 },
    city: { type: String, default: null },
    user_interest: { type: Object, default: {} },
    subscribed: { type: Boolean },
    updateLastLogin: { type: Date },
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    modified_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reporting_name: { type: String, default: null },
    reporting_to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employee_type: { type: String },
    modified_date: { type: Date, default: null },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    created_date: { type: Date },
    deleted_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deleted_date: { type: Date, default: null },
    user_id: { type: Number, unique: true },
    image: { type: String, default: null },
    about: { type: String, default: null },
    deviceId: { type: String, default: null },
    device_token: { type: String, default: null },
    user_prof_role: { type: String, default: null },
    company_name: { type: String, default: null },
    company_email: { type: String, default: null },
    company_website: { type: String, default: null },
    is_subscribe: { type: Boolean, default: false },
    role_details: { type: Object, default: null },
    personal_brand: {
      interest: { type: JSON, default: null },
      values: { type: JSON, default: null },
      traits: { type: JSON, default: null },
      models: { type: JSON, default: null },
    },
    professional_details: {
      mission: { type: String, default: null },
      vision: { type: String, default: null },
      education: { type: JSON, default: null },
    },
    pr_percentage: { type: String, default: null },
  },
  {
    timestamps: true,
    user_id: false,
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

UsersSchema.pre("save", function (next) {
  this.wasNew = this.isNew;
  console.log(this.first_name, "tis.firstnaem");
  if (!this.first_name) {
    this.name = this.first_name.trim();
  } else if (!this.first_name) {
    this.name = this.first_name.trim();
  }

  next();
});

UsersSchema.statics.updateLastLogin = async function (user_id) {
  try {
    await Models.User.findOneAndUpdate(
      { _id: user_id },
      { $set: { last_seen: new Date(), is_verified: true } } //status: USER_STATUS.ACTIVE
    );

    // Any other code you need to execute after the update
    // ...
  } catch (error) {
    // Handle the error
    // ...
  }
};

UsersSchema.statics.setActivatedBy = async function (user_id) {
  try {
    await Models.User.findOneAndUpdate(
      { _id: user_id },
      { $set: { activated_by: "User" } }
    );

    // Any other code you need to execute after the update
    // ...
  } catch (error) {
    // Handle the error
    // ...
  }
};

const Counter = Mongoose.model(
  "Counter",
  new Mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  })
);

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
}

UsersSchema.pre("save", async function (next) {
  if (!this.user_id) {
    this.user_id = await getNextSequenceValue("user_id");
  }
  next();
});

const User = Mongoose.model("users", UsersSchema);

module.exports = Mongoose.model("users", UsersSchema);
