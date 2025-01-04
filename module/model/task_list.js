const mongoose = require("mongoose");

const TaskListSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    current_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    tasks: [
      {
        task_name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        project_name: {
          type: String,
          required: true,
          trim: true,
        },
        start_time: {
          type: String,
          required: true,
        },
        end_time: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["Ongoing", "Completed"],
          default: "Ongoing",
        },
        is_submit: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("TaskList", TaskListSchema);
