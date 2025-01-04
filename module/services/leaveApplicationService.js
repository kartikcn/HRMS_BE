const Mail = require("../../system/mailer/mail");
const path = require("path");
const Fs = require("fs");
const tpl = require("node-tpl");
const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (!decoded?.usertype_in || !decoded?.is_active || decoded?.deleted_date) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];

    const userobj = await Models.user.findById(data.user_id).exec();
    if (!userobj) {
      data.response = {
        status: 404,
        message: "User not found",
      };
      return data;
    }

    const reportingToId = userobj.reporting_to;

    const reportingUser = await Models.user.findById(reportingToId).exec();
    if (!reportingUser) {
      data.response = {
        status: 404,
        message: "Reporting user not found",
      };
      return data;
    }

    const templatePath = path.join(
      __dirname,
      "../../system/template/apply_leave.tpl"
    );

    let template;
    try {
      template = Fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      console.error("Error reading the template file:", error);
      data.response = {
        status: 500,
        message: "Template file could not be read",
        error,
      };
      return data;
    }
    template = template.replace(
      "${reporting_manager_name}",
      reportingUser.first_name
    );
    template = template.replace("${employee_name}", userobj.first_name);
    template = template.replace("${leave_code}", data.leave_code);
    template = template.replace("${from_date}", data.from_date);
    template = template.replace("${to_date}", data.to_date);
    template = template.replace("${leave_reason}", data.leave_reason);

    try {
      const mailObj = new Mail();
      const mailResponse = await mailObj.sendMail({
        from: userobj.email,
        to: reportingUser.email,
        subject: "Leave Apply",
        html: template,
      });

      console.log("Mail Response:", mailResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      data.response = {
        status: 500,
        message: "Failed to send email.",
        error: emailError,
      };
      return data;
    }

    const leaveData = {
      user_id: data.user_id,
      from_date: data.from_date,
      to_date: data.to_date,
      leave_code: data.leave_code,
      leave_reason: data.leave_reason,
      status: data.status,
    };

    try {
      const savedData = await Models.leaveApplication(leaveData).save();
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: savedData,
        message: "Data stored successfully.",
      };
    } catch (saveError) {
      console.error("Error saving data:", saveError);
      data.response = {
        status: 500,
        message: "Data could not be stored.",
        error: saveError,
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

const get_leave_application = async function (data, authData) {
  try {
    // Decode the token to verify the user's authentication
    const decoded = Auth.decodeToken(authData);
    // Check if the user is valid (active and not deleted)
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }
    const skip = data.limit * (data.page_no - 1);
    const limit = data.limit;

    // Define the filter for the query based on the provided status in data
    const filter = {};
    if (data.status) {
      filter.status = data.status; // Assuming `status` is provided in data
    }

    // Retrieve leave applications with the specified status
    const applied_application = await Models.leaveApplication
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    // Get total count for pagination
    const total_records = await Models.leaveCreate.countDocuments(filter);

    // Calculate the number of pages
    const total_pages = Math.ceil(total_records / limit);
    // If there are applications, return the data
    if (applied_application.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_records: total_records,
        total_pages: total_pages,
        message: "Applications found.",
        data: applied_application,
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No applications found.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

const update_leave_application = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    // Ensure that the action and command fields are not part of the update
    delete data["action"];
    delete data["command"];

    if (!data.application_id) {
      data.response = {
        status: 0,
        message: "Application ID is required for update.",
      };
      return data;
    }
    const leaveApplication = await Models.leaveApplication.findById(
      data.application_id
    );
    if (!leaveApplication) {
      data.response = {
        status: 0,
        message: "No record found",
      };
      return data;
    }
    const userobj = await Models.user.findById(data.user_id).exec();
    if (!userobj) {
      data.response = {
        status: 404,
        message: "User not found",
      };
      return data;
    }

    const templatePath = path.join(
      __dirname,
      "../../system/template/approve_leave.tpl"
    );

    let template;
    try {
      template = Fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      console.error("Error reading the template file:", error);
      data.response = {
        status: 500,
        message: "Template file could not be read",
        error,
      };
      return data;
    }

    template = template.replace("${user_name}", userobj.first_name);
    template = template.replace("${status", data.status);
    template = template.replace("${from_date}", leaveApplication.from_date);
    template = template.replace("${to_date}", leaveApplication.to_date);
    template = template.replace(
      "${leave_reason}",
      leaveApplication.leave_reason
    );

    try {
      const mailObj = new Mail();
      const mailResponse = await mailObj.sendMail({
        from: decoded.email,
        to: userobj.email,
        subject: "Leave Apply",
        html: template,
      });

      console.log("Mail Response:", mailResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      data.response = {
        status: 500,
        message: "Failed to send email.",
        error: emailError,
      };
      return data;
    }

    const updated_data = await Models.leaveApplication.findByIdAndUpdate(
      { _id: data.application_id, user_id: data.user_id },
      {
        from_date: data.from_date,

        to_date: data.to_date,
        leave_code: data.leave_code,
        leave_reason: data.leave_reason,
        status: data.status,
      },
      { new: true } // This option returns the updated document
    );

    // Check if the update was successful
    if (updated_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updated_data,
        message: "Data updated successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: " User Id may not exist.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error updating holiday ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

const get_moderator_application = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    // Ensure that the action and command fields are not part of the update
    delete data["action"];
    delete data["command"];

    // Ensure holiday ID is provided in the data
    if (!data.user_id) {
      data.response = {
        status: 0,
        message: "User ID is required",
      };
      return data;
    }

    // Update the holiday document in the collection
    //   const updated_data = await Models.leaveApplication.findByIdAndUpdate(
    //     data.application_id,
    //     {
    //       from_date: data.from_date,

    //       to_date: data.to_date,
    //       leave_code: data.leave_code,
    //       leave_reason: data.leave_reason,
    //       status: data.status,
    //     },
    //     { new: true } // This option returns the updated document
    //   );
    let updated_data;
    try {
      // Step 1: Find all users who report to this moderator
      const reportees = await Models.User.find({
        reporting_to: moderatorId,
      }).select("_id");

      if (reportees.length === 0) {
        return {
          message: "No reportees found for this moderator.",
          applications: [],
        };
      }

      // Extract the reportee IDs
      const reporteeIds = reportees.map((reportee) => reportee._id);

      // Step 2: Find all leave applications submitted by these reportees
      const leaveApplications = await Models.leaveApplication.find({
        user_id: { $in: reporteeIds },
      });

      // Return the applications
      updated_data = leaveApplications;
    } catch (error) {
      console.error("Error fetching leave applications for moderator:", error);
      throw error;
    }

    // Check if the update was successful
    if (updated_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updated_data,
        message: "Data updated successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not updated. Holiday ID may not exist.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error updating holiday ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

module.exports = {
  create,
  get_leave_application,
  update_leave_application,
  get_moderator_application,
};
