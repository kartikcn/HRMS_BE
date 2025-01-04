const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    // Validate the user's authentication and permissions
    if (
      !decoded?.usertype_in ||
      !decoded?.is_active ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!",
      };
      return data;
    }

    // Ensure required fields are present, including leaveType
    if (!data.leaveType || !["credit", "debit"].includes(data.leaveType)) {
      data.response = {
        status: 0,
        message: "Invalid leave type provided.",
      };
      return data;
    }

    // Ensure `user_ids` field is present and is an array
    if (!Array.isArray(data.user_id) || data.user_id.length === 0) {
      data.response = {
        status: 0,
        message: "No users selected.",
      };
      return data;
    }

    // Prepare the leave data for bulk insert
    const leaveDataArray = data.user_id.map((userId) => ({
      leave_code: data.leave_code,
      user_id: userId,
      leaveType: data.leaveType,
      assigned_leaves: data.assigned_leaves,
      assigned_by: data.assigned_by,
      assigned_date: data.assigned_date || Date.now(),
    }));

    // Perform bulk insert to create leave records for all selected users
    const saved_data = await Models.creditLeave.insertMany(leaveDataArray);

    // Prepare response based on save result
    if (saved_data && saved_data.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: saved_data,
        message: "Data stored successfully for all selected users.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not stored for any user.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error creating leave record: ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error.message || error,
    };
    return data;
  }
};

// const get_credit_list = async function (data, authData) {
//   try {
//     const decoded = Auth.decodeToken(authData);
//     if (
//       decoded?.usertype_in === false ||
//       decoded?.is_active === false ||
//       decoded?.deleted_date !== null
//     ) {
//       data.response = {
//         status: 0,
//         message: "You are not a valid user!!",
//       };
//       return data;
//     }

//     const skip = data.limit * (data.page_no - 1);
//     const limit = data.limit;
//     const filters = data.filter || {};

//     // Build match stage for filtering
//     let matchStage = {};
//     if (filters.all) {
//       matchStage.$or = [
//         { leave_code: { $regex: filters.all, $options: "i" } },
//         {
//           "userData.first_name": {
//             $regex: filters.all,
//             $options: "i",
//           },
//         },
//       ];
//     }
//     if (filters.leave_code) {
//       matchStage.leave_code = {
//         $regex: filters.leave_code,
//         $options: "i",
//       };
//     }
//     if (filters.employee_name) {
//       matchStage["userData.first_name"] = {
//         $regex: filters.employee_name,
//         $options: "i",
//       };
//     }

//     // Aggregation pipeline
//     const pipeline = [
//       {
//         $lookup: {
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "userData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$userData",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "assigned_by",
//           foreignField: "_id",
//           as: "assignedByData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$assignedByData",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           leave_code: 1,
//           employee_name: {
//             $concat: [
//               "$userData.first_name",
//               " ",
//               { $ifNull: ["$userData.last_name", ""] },
//             ],
//           },
//           number_of_leaves: "$assigned_leaves",
//           created_on: "$assigned_date",
//           assigned_by: {
//             $concat: [
//               "$assignedByData.first_name",
//               " ",
//               { $ifNull: ["$assignedByData.last_name", ""] },
//             ],
//           },
//           email: "$userData.email",
//           leaveType: 1,
//         },
//       },
//       {
//         $match: matchStage,
//       },
//       {
//         $sort: { created_on: -1 },
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [{ $skip: skip }, { $limit: limit }],
//         },
//       },
//     ];

//     const result = await Models.creditLeave.aggregate(pipeline);

//     const credit_list = result[0].data;
//     const total_records = result[0].metadata[0]?.total || 0;
//     const total_pages = Math.ceil(total_records / limit);

//     if (credit_list.length > 0) {
//       data.response = {
//         status: 200,
//         result: STATUS.SUCCESS,
//         total_records: total_records,
//         total_pages: total_pages,
//         message: "Credit leave found.",
//         data: credit_list.map((item) => ({
//           ...item,
//           created_on: new Date(item.created_on).toLocaleString(),
//           number_of_leaves: item.number_of_leaves || 0,
//         })),
//       };
//     } else {
//       data.response = {
//         status: 200,
//         result: STATUS.ERROR,
//         message: "No credit leave found.",
//       };
//     }

//     return data;
//   } catch (error) {
//     console.error("Error in get_credit_list:", error);
//     data.response = {
//       status: 0,
//       result: STATUS.ERROR,
//       message: "Something went wrong",
//       error: error,
//     };
//     return data;
//   }
// };
const get_credit_list = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);
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
    const filters = data.filter || {};

    // Build match stage for filtering
    let matchStage = {};

    // If 'all' filter is present, check against leave_code and first_name
    if (filters.all) {
      matchStage.$or = [
        { leave_code: { $regex: filters.all, $options: "i" } },
        { "userData.first_name": { $regex: filters.all, $options: "i" } },
      ];
    }

    // Apply individual filters if `filters.all` is not provided
    if (!filters.all) {
      if (filters.leave_code) {
        matchStage.leave_code = {
          $regex: filters.leave_code,
          $options: "i",
        };
      }
      if (filters.employee_name) {
        matchStage["userData.first_name"] = {
          $regex: filters.employee_name,
          $options: "i",
        };
      }
    }

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Move the match stage here, right after the first lookup and unwind
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "assigned_by",
          foreignField: "_id",
          as: "assignedByData",
        },
      },
      {
        $unwind: {
          path: "$assignedByData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          leave_code: 1,
          employee_name: {
            $concat: [
              "$userData.first_name",
              " ",
              { $ifNull: ["$userData.last_name", ""] },
            ],
          },
          number_of_leaves: "$assigned_leaves",
          created_on: "$assigned_date",
          assigned_by: {
            $concat: [
              "$assignedByData.first_name",
              " ",
              { $ifNull: ["$assignedByData.last_name", ""] },
            ],
          },
          email: "$userData.email",
          leaveType: 1,
        },
      },
      {
        $sort: { created_on: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    // For debugging, log the match stage and pipeline
    console.log("Match Stage:", JSON.stringify(matchStage, null, 2));
    console.log("Pipeline:", JSON.stringify(pipeline, null, 2));

    const result = await Models.creditLeave.aggregate(pipeline);

    const credit_list = result[0].data || [];
    const total_records = result[0].metadata[0]?.total || 0;
    const total_pages = Math.ceil(total_records / limit);

    if (credit_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_records: total_records,
        total_pages: total_pages,
        message: "Credit leave found.",
        data: credit_list.map((item) => ({
          ...item,
          created_on: new Date(item.created_on).toLocaleString(),
          number_of_leaves: item.number_of_leaves || 0,
        })),
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No credit leave found.",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in get_credit_list:", error);
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
  get_credit_list,
};
