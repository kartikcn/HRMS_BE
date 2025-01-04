const auth = require("../middleware/auth");
const moment = require("moment");
const mongoose = require("mongoose");

const create = async (data, authData) => {
  try {
    const decoded = auth.decodeToken(authData);

    // Check user validity
    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];

    // Construct task data
    const taskData = {
      task_name: data.task_name,
      description: data.description,
      project_name: data.project_name,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status || "ongoing",
      is_submit: data.is_submit || false,
    };

    try {
      // Check if a document exists for the user and current date
      const existingDocument = await Models.task_list.findOne({
        user_id: decoded._id,
        current_date: data.current_date,
      });

      if (existingDocument) {
        // If document exists, add the new task to the tasks array
        existingDocument.tasks.push(taskData);
        const updatedDocument = await existingDocument.save();

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: updatedDocument,
          message: "Task added successfully to existing document.",
        };
      } else {
        // If no document exists, create a new one
        const newDocument = new Models.task_list({
          user_id: decoded._id,
          current_date: data.current_date,
          tasks: [taskData], // Add the task to the tasks array
        });

        const savedDocument = await newDocument.save();

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: savedDocument,
          message: "New document created successfully.",
        };
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      data.response = {
        status: 500,
        message: "Database operation failed.",
        error: dbError,
      };
    }

    return data;
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    data.response = {
      status: 500,
      message: "Something went wrong.",
      error,
    };
    return data;
  }
};
const deleteTask = async (data, authData) => {
  try {
    const decoded = auth.decodeToken(authData);

    // Check user validity
    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    // Validate input
    if (!data.task_id && (!data.user_id || !data.current_date)) {
      data.response = {
        status: 400,
        message:
          "Invalid request. Provide either task_id or user_id and current_date.",
      };
      return data;
    }

    try {
      let updatedDocument;

      if (data.task_id) {
        // Delete by task ID from the tasks array
        updatedDocument = await Models.task_list.findOneAndUpdate(
          { "tasks._id": data.task_id, current_date: data.current_date },
          { $pull: { tasks: { _id: data.task_id } } },
          { new: true }
        );
      } else {
        // Delete tasks for the user on the specific date
        updatedDocument = await Models.task_list.findOneAndUpdate(
          {
            user_id: decoded._id,
            current_date: data.current_date,
          },
          { $set: { tasks: [] } }, // Remove all tasks for that date
          { new: true }
        );
      }

      if (!updatedDocument) {
        data.response = {
          status: 404,
          message: "Task not found or no matching data to delete.",
        };
        return data;
      }

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updatedDocument,
        message: "Task(s) deleted successfully.",
      };

      return data;
    } catch (dbError) {
      console.error("Error during task deletion:", dbError);
      data.response = {
        status: 500,
        message: "Error occurred while deleting task.",
        error: dbError,
      };
      return data;
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    data.response = {
      status: 500,
      message: "Something went wrong.",
      error,
    };
    return data;
  }
};
const updateTask = async (data, authData) => {
  try {
    const decoded = auth.decodeToken(authData);

    // Check user validity
    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    // Validate input
    if (!data.task_id || !data.updates) {
      data.response = {
        status: 400,
        message: "Invalid request. Provide task_id and updates.",
      };
      return data;
    }

    try {
      let updateQuery;
      let findQuery;

      // Check if this is a submit operation
      if (data.updates.is_submit) {
        // Update query for submit operation
        updateQuery = {
          $set: {
            "tasks.$[].is_submit": true,
            is_submit: true, // Also set the list's is_submit to true
          },
        };
        // Find all lists for the current date
        findQuery = { current_date: data.current_date };

        // Update all documents for the current date
        const updateResult = await Models.task_list.updateMany(
          findQuery,
          updateQuery
        );

        if (updateResult.matchedCount === 0) {
          data.response = {
            status: 404,
            message: "No lists found for the given date.",
          };
          return data;
        }

        // Fetch the updated documents to return
        const updatedDocuments = await Models.task_list.find(findQuery);

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: updatedDocuments,
          message: "All lists for the current date submitted successfully.",
        };
      } else {
        // For regular updates, only update the specific task
        updateQuery = {
          $set: Object.keys(data.updates).reduce((acc, key) => {
            acc[`tasks.$.${key}`] = data.updates[key];
            return acc;
          }, {}),
        };

        // Find the specific task to update
        findQuery = {
          "tasks._id": data.task_id,
          current_date: data.current_date,
        };

        const updatedDocument = await Models.task_list.findOneAndUpdate(
          findQuery,
          updateQuery,
          { new: true }
        );

        if (!updatedDocument) {
          data.response = {
            status: 404,
            message: "Task not found or no matching data to update.",
          };
          return data;
        }

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: updatedDocument,
          message: "Task updated successfully.",
        };
      }

      return data;
    } catch (dbError) {
      console.error("Error during task update:", dbError);
      data.response = {
        status: 500,
        message: "Error occurred while updating task.",
        error: dbError,
      };
      return data;
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    data.response = {
      status: 500,
      message: "Something went wrong.",
      error,
    };
    return data;
  }
};
const getTask = async (data, authData) => {
  try {
    const decoded = auth.decodeToken(authData);
    console.log("jsdlfjsldfj", decoded);

    // Check user validity
    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    try {
      // Query to find tasks by current_date and user_id
      const tasks = await Models.task_list.find({
        current_date: data.current_date,
        user_id: decoded._id,
      });

      // If no tasks are found, return a 404 error
      if (!tasks || tasks.length === 0) {
        data.response = {
          status: 404,
          message: "No tasks found for the given date and user.",
        };
        return data;
      }

      // Return the tasks found
      data.response = {
        status: 200,
        result: "success",
        message: "Tasks retrieved successfully.",
        data: tasks,
      };
      return data;
    } catch (dbError) {
      // Handle any errors that occur during the query
      console.error("Error retrieving tasks:", dbError);
      data.response = {
        status: 500,
        message: "Error occurred while retrieving tasks.",
        error: dbError,
      };
      return data;
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("An unexpected error occurred:", error);
    data.response = {
      status: 500,
      message: "Something went wrong.",
      error,
    };
    return data;
  }
};
const getLogs = async (data, authData) => {
  try {
    const decoded = auth.decodeToken(authData);

    // User validation
    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      return {
        response: {
          status: 0,
          message: "You are not a valid user!",
        },
      };
    }

    const { year, month, week, user_id } = data;

    // Validate input parameters
    if (!year || !month || !week || !user_id) {
      return {
        response: {
          status: 400,
          message: "Missing required parameters.",
        },
      };
    }

    // Convert month name to number (January = 1, December = 12)
    const monthNumber = moment().month(month).format("MM");

    // Calculate week dates
    const firstDayOfMonth = moment(`${year}-${monthNumber}-01`, "YYYY-MM-DD");
    const startDate = firstDayOfMonth
      .clone()
      .add((week - 1) * 7, "days")
      .startOf("week");
    const endDate = startDate.clone().endOf("week");

    // Debugging log
    console.log(
      `Fetching submitted tasks for user ${user_id} from ${startDate.format(
        "YYYY-MM-DD"
      )} to ${endDate.format("YYYY-MM-DD")}`
    );

    // Find tasks for the specific user and date range where is_submit is true
    const tasks = await Models.task_list.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          current_date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $unwind: "$tasks",
      },
      {
        $match: {
          "tasks.is_submit": true, // Add this stage to filter only submitted tasks
        },
      },
      {
        $project: {
          _id: 1,
          task_name: "$tasks.task_name",
          description: "$tasks.description",
          start_time: "$tasks.start_time",
          end_time: "$tasks.end_time",
          status: "$tasks.status",
          project_name: "$tasks.project_name",
          is_submit: "$tasks.is_submit",
          current_date: 1,
        },
      },
      {
        $sort: { current_date: 1, start_time: 1 },
      },
    ]);

    // Check if tasks were found
    if (tasks && tasks.length > 0) {
      // Group tasks by date
      const tasksByDate = tasks.reduce((acc, task) => {
        const dateKey = moment(task.current_date).format("YYYY-MM-DD");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      }, {});

      return {
        response: {
          status: 200,
          result: "success",
          message: "Submitted tasks retrieved successfully.",
          data: {
            tasks,
            tasksByDate,
          },
          metadata: {
            totalTasks: tasks.length,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          },
        },
      };
    } else {
      return {
        response: {
          status: 404,
          message: "No submitted tasks found for the given week and user.",
          data: {
            tasks: [],
            tasksByDate: {},
          },
        },
      };
    }
  } catch (error) {
    console.error("Error in getLogs:", error);
    return {
      response: {
        status: 500,
        message: "Something went wrong.",
        error: error.toString(),
      },
    };
  }
};
module.exports = {
  create,
  deleteTask,
  updateTask,
  getTask,
  getLogs,
};
