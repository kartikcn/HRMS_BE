// const { sendPushNotification } = require("../../firebaseHandler");
const commonFunction = require("../services/commonFunctions");

// const create = async (data, authData) => {
//   try {
//     const decoded = Auth.decodeToken(authData);

//     if (
//       decoded?.usertype_in === false ||
//       decoded?.is_active == false ||
//       decoded?.deleted_date !== null
//     ) {
//       data.response = {
//         status: 0,
//         message: "You are not valid user!",
//       };
//       return data;
//     }

//     delete data["action"];
//     delete data["command"];

//     data.created_by = decoded._id;

//     var record = await Models.event(data).save();

//     if (record != null) {
//       data.response = {
//         status: 200,
//         result: STATUS.SUCCESS,
//         data: record,
//         message: "Data stored successfully.",
//       };

//       var new_event_notif = await new Models.notificationLog({
//         type: "Event",
//         title: "New Event",
//         message: "Check out this new event",
//         event_id: record.event_id,
//       }).save();

//       var user_record = await Models.user.aggregate([
//         {
//           $match: {
//             deleted_date: null,
//             usertype_in: false,
//             device_token: {
//               $exists: true,
//             },
//           },
//         },
//         {
//           $project: {
//             device_token: 1,
//           },
//         },
//       ]);
//       data.response = {
//         status: 200,
//         result: STATUS.SUCCESS,
//         message: "Success fully registered the event",
//         error: error,
//       };

//       // for (var token_data of user_record) {
//       //   if (
//       //     token_data.device_token !== undefined &&
//       //     token_data.device_token !== null
//       //   ) {
//       //     console.log(
//       //       "token_data       ----------->   ",
//       //       token_data.device_token
//       //     );
//       //     console.log(" ");
//       //     var title = "Course approved";
//       //     var message = "New event added.";
//       //     var notif_token = token_data.device_token;
//       //     var notifyResponse = await sendPushNotification(
//       //       message,
//       //       notif_token,
//       //       title
//       //     );
//       //     console.log("notifyResponse    ------>  ", notifyResponse);
//       //     console.log(" ");
//       //     console.log(" --------------------------------------------------- ");
//       //   }
//       // }
//     } else {
//       data.response = {
//         status: 0,
//         result: STATUS.ERROR,
//         message: "Data not stored.",
//       };
//     }

//     return data;
//   } catch (error) {
//     data.response = {
//       status: 0,
//       result: STATUS.ERROR,
//       message: "Something is wrong",
//       error: error,
//     };
//     return data;
//   }
// };
const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active == false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];

    data.created_by = decoded._id;

    var record = await Models.event(data).save();

    if (record != null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data stored successfully.",
      };

      /* Notification logic commented out
      var new_event_notif = await new Models.notificationLog({
        type: "Event",
        title: "New Event",
        message: "Check out this new event",
        event_id: record.event_id,
      }).save();

      var user_record = await Models.user.aggregate([
        {
          $match: {
            deleted_date: null,
            usertype_in: false,
            device_token: {
              $exists: true,
            },
          },
        },
        {
          $project: {
            device_token: 1,
          },
        },
      ]);
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Success fully registered the event",
        error: error,
      };

      // for (var token_data of user_record) {
      //   if (
      //     token_data.device_token !== undefined &&
      //     token_data.device_token !== null
      //   ) {
      //     console.log(
      //       "token_data       ----------->   ",
      //       token_data.device_token
      //     );
      //     console.log(" ");
      //     var title = "Course approved";
      //     var message = "New event added.";
      //     var notif_token = token_data.device_token;
      //     var notifyResponse = await sendPushNotification(
      //       message,
      //       notif_token,
      //       title
      //     );
      //     console.log("notifyResponse    ------>  ", notifyResponse);
      //     console.log(" ");
      //     console.log(" --------------------------------------------------- ");
      //   }
      // }
      */
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not stored.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const get_list = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var skip = data.limit * (data.page_no - 1);
    var limit = data.limit;
    var list_type = data.flag;
    var filter = data.filter;
    var todays_date = new Date();

    var project_data = {
      name: 1,
      type: 1,
      amount: 1,
      image: 1,
      event_id: 1,
      hosted_by: 1,
      start_date: 1,
      end_date: 1,
      status: {
        $cond: {
          if: {
            $and: [
              {
                $lte: ["$start_date", todays_date.toISOString()],
              },
              {
                $gt: ["$end_date", todays_date.toISOString()],
              },
            ],
          },
          then: "Live",
          else: "Scheduled",
        },
      },
    };

    if (list_type == "schedule_event") {
      data.end_date = {
        $gt: todays_date.toISOString(),
      };
    }

    if (list_type == "past_event") {
      data.end_date = {
        $lt: todays_date.toISOString(),
      };
    }

    delete data["action"];
    delete data["command"];
    delete data["page_no"];
    delete data["limit"];
    delete data["flag"];
    delete data["filter"];
    data.is_deleted = false;
    if (filter != null) {
      console.log("filter      ------------------>   ");

      if (filter.name != undefined) {
        filter.name = {
          $regex: new RegExp(filter.name),
          $options: "i",
        };
      }

      if (filter.type != undefined) {
        filter.type = {
          $regex: new RegExp(filter.type),
          $options: "i",
        };
      }

      if (filter.status != undefined) {
        filter.status = {
          $regex: new RegExp(filter.status),
          $options: "i",
        };
      }

      var record = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: project_data,
        },
        {
          $match: filter,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      var total = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: project_data,
        },
        {
          $match: filter,
        },
      ]);
    } else {
      var record = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: project_data,
        },
      ]);

      var total = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: project_data,
        },
      ]);
    }

    var devident = total.length / limit;
    var pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1;
    } else {
      pages = devident;
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "List fetched successfully",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const view_event = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var list_type = data.flag;

    delete data["action"];
    delete data["command"];
    delete data["flag"];

    if (list_type == "schedule_event") {
      var record = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $lookup: {
            from: "user_register_events",
            localField: "event_id",
            foreignField: "event_id",
            as: "user_register_event_data",
          },
        },
        {
          $lookup: {
            from: "event_faqs",
            localField: "event_id",
            foreignField: "event_id",
            as: "event_register_event_data",
          },
        },
        {
          $lookup: {
            from: "event_feedbacks",
            localField: "event_id",
            foreignField: "event_id",
            as: "event_feedbacks_data",
          },
        },
        {
          $lookup: {
            as: "user_event_attent_data",
            from: "user_register_events",
            let: { event_id: "$event_id", refund_status: false },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$event_id", "$$event_id"] } },
                    { $expr: { $eq: ["$refund_status", "$$refund_status"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $addFields: {
            sold_ticket_count: {
              $size: "$user_event_attent_data",
            },
            event_feedbacks_count: {
              $size: "$event_feedbacks_data",
            },
          },
        },
        {
          $addFields: {
            sold_ticket_amount: {
              $multiply: ["$amount", "$sold_ticket_count"],
            },
            remaining_ticket_count: {
              $subtract: ["$seat", "$sold_ticket_count"],
            },
          },
        },
      ]);
    }

    if (list_type == "past_event") {
      var record = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $lookup: {
            from: "user_register_events",
            localField: "event_id",
            foreignField: "event_id",
            as: "user_register_event_data",
          },
        },
        {
          $lookup: {
            from: "event_faqs",
            localField: "event_id",
            foreignField: "event_id",
            as: "event_register_event_data",
          },
        },
        {
          $lookup: {
            as: "user_event_attent_data",
            from: "user_register_events",
            let: { event_id: "$event_id", refund_status: false },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$event_id", "$$event_id"] } },
                    { $expr: { $eq: ["$refund_status", "$$refund_status"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $lookup: {
            as: "user_event_not_attent_data",
            from: "user_register_events",
            let: { event_id: "$event_id", refund_status: true },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$event_id", "$$event_id"] } },
                    { $expr: { $eq: ["$refund_status", "$$refund_status"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $addFields: {
            sold_ticket_count: {
              $size: "$user_event_attent_data",
            },
            user_event_attend_count: {
              $size: "$user_event_attent_data",
            },
            user_event_not_attend_count: {
              $size: "$user_event_not_attent_data",
            },
          },
        },
        {
          $addFields: {
            sold_ticket_amount: {
              $multiply: ["$amount", "$user_event_attend_count"],
            },
            remaining_ticket_count: {
              $subtract: ["$seat", "$user_event_attend_count"],
            },
          },
        },
      ]);
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        data: record[0],
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const update_event = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active == false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var record;
    var list_type = data.flag;

    delete data["action"];
    delete data["command"];
    delete data["flag"];

    if (data["is_deleted"] != undefined && data["is_deleted"] == true) {
      data.deleted_date = new Date();
      data.deleted_by = decoded?._id;
    }

    record = await Models.event.findOneAndUpdate(
      { event_id: data.event_id },
      { $set: data },
      { new: true }
    );

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data updated.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not updated.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const delete_event = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var record;
    var list_type = data.flag;

    delete data["action"];
    delete data["command"];
    delete data["flag"];

    record = await Models.event.findOneAndUpdate(
      { event_id: data.event_id },
      { $set: data },
      { new: true }
    );

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Data deleted.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not deleted.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const get_list_for_mobile = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);
    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var skip = data.limit * (data.page_no - 1);
    var limit = data.limit;
    var user_id = data.user_id;
    var list_type = data.flag;
    var todays_date = new Date();
    var matchData;

    var project_data = {
      user_id: 1,
      event_id: 1,
      attend_event: 1,
      hosted_by: "$event_data.hosted_by",
      payment_detail_id: 1,
      createdAt: 1,
      updatedAt: 1,
      user_register_event_id: 1,
      type: "$event_data.type",
      name: "$event_data.name",
      seat: "$event_data.seat",
      image: "$event_data.image",
      amount: "$event_data.amount",
      description: "$event_data.description",
      start_date: "$event_data.start_date",
      end_date: "$event_data.end_date",
      join_link: "$event_data.join_link",
      address: "$event_data.address",
      media: "$event_data.media",
      testimonial: "$event_data.testimonial",
      status: "$event_data.status",
    };

    if (list_type == "schedule_event") {
      data.end_date = {
        $gt: todays_date.toISOString(),
      };

      matchData = {
        user_id: user_id,
        refund_status: false,
      };
    }

    if (list_type == "past_event") {
      data.end_date = {
        $lt: todays_date.toISOString(),
      };

      matchData = {
        user_id: user_id,
        refund_status: false,
      };
    }

    if (list_type == "refund_event") {
      matchData = {
        user_id: user_id,
        refund_status: true,
      };
    }

    delete data["action"];
    delete data["command"];
    delete data["user_id"];
    delete data["page_no"];
    delete data["limit"];
    delete data["flag"];

    var record = await Models.user_register_event.aggregate([
      {
        $match: matchData,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event_id",
          foreignField: "event_id",
          as: "event_data",
        },
      },
      {
        $unwind: {
          path: "$event_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: project_data,
      },
      {
        $match: data,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    var total = await Models.user_register_event.aggregate([
      {
        $match: matchData,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event_id",
          foreignField: "event_id",
          as: "event_data",
        },
      },
      {
        $unwind: {
          path: "$event_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: project_data,
      },
      {
        $match: data,
      },
    ]);

    var devident = total.length / limit;
    var pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1;
    } else {
      pages = devident;
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "List fetched successfully",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const event_attendance_add = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];
    delete data["flag"];

    var record = await Models.user_register_event.findOneAndUpdate(
      { user_register_event_id: data.user_register_event_id },
      { $set: data },
      { new: true }
    );

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data updated.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not updated.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const view_event_for_mobile = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }

    var list_type = data.flag;
    var user_id = data.user_id;

    delete data["action"];
    delete data["command"];
    delete data["flag"];
    delete data["user_id"];

    if (list_type == "schedule_event") {
      var record = await Models.event.aggregate([
        {
          $match: data,
        },
        {
          $lookup: {
            from: "user_register_events",
            localField: "event_id",
            foreignField: "event_id",
            as: "total_user_register_event_data",
          },
        },
        {
          $lookup: {
            as: "user_event_attent_data",
            from: "user_register_events",
            let: { event_id: "$event_id", refund_status: false },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$event_id", "$$event_id"] } },
                    { $expr: { $eq: ["$refund_status", "$$refund_status"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $addFields: {
            total_user_register_event_count: {
              $size: "$user_event_attent_data",
            },
          },
        },
        {
          $lookup: {
            as: "user_register_event_data",
            from: "user_register_events",
            let: { event_id: "$event_id", user_id: user_id },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$event_id", "$$event_id"] } },
                    { $expr: { $eq: ["$user_id", "$$user_id"] } },
                  ],
                },
              },
            ],
          },
        },
      ]);
    }

    if (list_type == "past_event") {
      var record = await Models.event.aggregate([
        {
          $match: data,
        },
      ]);
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        data: record[0],
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  ---------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const addFaq = async (data, authData) => {
  try {
    userLogger.info(__filename, "add faq start ---->  ," + data);
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active == false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }
    delete data["action"];
    delete data["command"];
    delete data.faq._id;
    console.log(data.faq.eventFAQ_id, "faq data");
    if (data.faq.eventFAQ_id != undefined && data.faq.eventFAQ_id != "") {
      if (data.faq.is_deleted == true) {
        data.faq.deleted_date = new Date();
        data.faq.deleted_by = decoded?._id;
      }
      console.log(data.faq, "faq data");
      var record = await Models.event_faq.findOneAndUpdate(
        { eventFAQ_id: data.faq.eventFAQ_id },
        { $set: data.faq },
        { new: true }
      );

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "FAQ updated successfully",
      };
      return data;
    } else {
      console.log(data.faq, "datatat");
      var record = await Models.event_faq(data.faq).save();
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "FAQ created successfully",
      };
      return data;
    }
  } catch (error) {
    console.log(error);
    userLogger.info(__filename, "add faq error ---->  ," + error);
    data.response = {
      status: 200,
      result: STATUS.ERROR,
      data: error,
      message: "FAQ error",
    };
    return data;
  }
};

const getEventFAQ = async (data, authData) => {
  try {
    userLogger.info(__filename, "assignment list," + data);
    var decoded = Auth.decodeToken(authData);
    if (decoded?.is_active === false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    const getAssignmentList = await Models.event_faq.aggregate([
      {
        $match: {
          event_id: data?.event_id,
          deleted_date: null,
        },
      },
      {
        $sort: {
          eventFAQ_id: 1,
        },
      },
    ]);
    data.response = {
      status: 200,
      message: "Fetched successfully assignment",
      data: getAssignmentList,
    };
    return data;
  } catch (e) {
    console.log(e);
  }
};

const eventConsumerList = async (data, authData) => {
  try {
    userLogger.info(__filename, "eventConsumerList start ---->  ," + data);
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active == false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }
    delete data["action"];
    delete data["command"];
    const result = await Models.user_register_event.aggregate([
      {
        $match: {
          event_id: data.event_id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $group: {
          _id: "$event_id",
          event_details: { $first: "$$ROOT" },
          user_data: { $push: "$user" },
        },
      },
      {
        $project: {
          _id: 0,
          event_details: 1,
          user_data: 1,
        },
      },
    ]);
    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      message: "Successfully fetched",
      data: result,
    };
    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "add eventConsumerList end ---->  ," + data);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Error processing request",
      error: error,
    };
    return data;
  }
};

const pastEventAttendanceList = async (data, authData) => {
  try {
    userLogger.info(__filename, "add faq start ---->  ," + data);
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active == false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!",
      };
      return data;
    }
    delete data["action"];
    delete data["command"];
    if (data.flag == "attended") {
      var result = await Models.user_register_event.aggregate([
        {
          $match: {
            event_id: data.event_id,
          },
        },
        {
          $group: {
            _id: "$attend_event",
            events: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "events.event_id",
            foreignField: "event_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "events.user_id",
            foreignField: "user_id",
            as: "users",
          },
        },
        {
          $project: {
            attend_event: {
              $cond: [
                { $eq: ["$_id", true] },
                {
                  $map: {
                    input: "$events",
                    as: "event",
                    in: {
                      $mergeObjects: [
                        "$$event",
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$users",
                                cond: {
                                  $eq: ["$$this.user_id", "$$event.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        { result: "$result" },
                      ],
                    },
                  },
                },
                [],
              ],
            },
            unattended_event: {
              $cond: [
                { $eq: ["$_id", false] },
                {
                  $map: {
                    input: "$events",
                    as: "event",
                    in: {
                      $mergeObjects: [
                        "$$event",
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$users",
                                cond: {
                                  $eq: ["$$this.user_id", "$$event.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        { result: "$result" },
                      ],
                    },
                  },
                },
                [],
              ],
            },
          },
        },
        {
          $project: {
            attend_event: 1,
            total_count: {
              $add: [
                { $size: "$attend_event" },
                { $size: "$unattended_event" },
              ],
            },
          },
        },
      ]);
    } else if (data.flag == "unattended") {
      var result = await Models.user_register_event.aggregate([
        {
          $match: {
            event_id: data.event_id,
          },
        },
        {
          $group: {
            _id: "$attend_event",
            events: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "events.event_id",
            foreignField: "event_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "events.user_id",
            foreignField: "user_id",
            as: "users",
          },
        },
        {
          $project: {
            attend_event: {
              $cond: [
                { $eq: ["$_id", true] },
                {
                  $map: {
                    input: "$events",
                    as: "event",
                    in: {
                      $mergeObjects: [
                        "$$event",
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$users",
                                cond: {
                                  $eq: ["$$this.user_id", "$$event.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        { result: "$result" },
                      ],
                    },
                  },
                },
                [],
              ],
            },
            unattended_event: {
              $cond: [
                { $eq: ["$_id", false] },
                {
                  $map: {
                    input: "$events",
                    as: "event",
                    in: {
                      $mergeObjects: [
                        "$$event",
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$users",
                                cond: {
                                  $eq: ["$$this.user_id", "$$event.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        { result: "$result" },
                      ],
                    },
                  },
                },
                [],
              ],
            },
          },
        },
        {
          $project: {
            unattended_event: 1,
            total_count: {
              $add: [
                { $size: "$attend_event" },
                { $size: "$unattended_event" },
              ],
            },
          },
        },
      ]);
    } else if (data.flag == "refunded") {
      var result = await Models.user_register_event.aggregate([
        {
          $match: {
            event_id: data.event_id,
          },
        },
        {
          $group: {
            _id: "$refund_status",
            events: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "events.event_id",
            foreignField: "event_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "events.user_id",
            foreignField: "user_id",
            as: "users",
          },
        },
        {
          $project: {
            refunded_event: {
              $cond: [
                { $eq: ["$_id", true] },
                {
                  $map: {
                    input: "$events",
                    as: "event",
                    in: {
                      $mergeObjects: [
                        "$$event",
                        {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$users",
                                cond: {
                                  $eq: ["$$this.user_id", "$$event.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                        { result: "$result" },
                      ],
                    },
                  },
                },
                [],
              ],
            },
          },
        },
        {
          $project: {
            refunded_event: 1,
          },
        },
      ]);
    }
    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: result[0],
      message: "list",
    };
    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "add faq error ---->  ," + e);
  }
};

module.exports = {
  create,
  get_list,
  view_event,
  update_event,
  get_list_for_mobile,
  event_attendance_add,
  view_event_for_mobile,
  addFaq,
  eventConsumerList,
  getEventFAQ,
  pastEventAttendanceList,
};
