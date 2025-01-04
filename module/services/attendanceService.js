const Auth = require("../middleware/auth");
const moment = require("moment");
const Mongoose = require("mongoose");
const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);
    console.log("Received data:", decoded);

    // Validate user conditions
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

    // Get today's date range
    const startOfToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setUTCHours(23, 59, 59, 999));

    // Find the latest attendance record for today
    const latestAttendance = await Models.Attendance.findOne({
      user_id: decoded._id,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .sort({ createdAt: -1 })
      .exec();

    // Handle login/logout based on requested status
    if (data.status === "logged_in") {
      // Check if user is already logged in
      if (
        latestAttendance &&
        latestAttendance.status === "logged_in" &&
        !latestAttendance.logout_time
      ) {
        data.response = {
          status: 200,
          message: "Already logged in.",
        };
        return data;
      }

      // Create new login record
      const newAttendance = new Models.Attendance({
        user_id: decoded._id,
        login_time: new Date(),
        status: "logged_in",
      });
      await newAttendance.save();

      data.response = {
        status: 200,
        message: "Successfully logged in.",
      };
    } else if (data.status === "logged_out") {
      // Check if there's an active session to log out from
      if (
        !latestAttendance ||
        latestAttendance.status === "logged_out" ||
        latestAttendance.logout_time
      ) {
        data.response = {
          status: 200,
          message: "No active session to log out from.",
        };
        return data;
      }

      // Update the current session with logout time
      latestAttendance.logout_time = new Date();
      latestAttendance.status = "logged_out";
      await latestAttendance.save();

      data.response = {
        status: 200,
        message: "Successfully logged out.",
      };
    } else {
      data.response = {
        status: 400,
        message: "Invalid status provided.",
      };
    }

    return data;
  } catch (error) {
    console.error("Error while handling attendance:", error);
    data.response = {
      status: 0,
      message: "Something went wrong",
      error: error.message,
    };
    return data;
  }
};
function formatTotalHours(totalHours) {
  // Split the decimal into hours and minutes
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  // Create a formatted string
  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} hr`;
  } else if (minutes > 0) {
    return `${minutes} min`;
  } else {
    return "0 min";
  }
}
const get_attendance_list_id = async (data, authData) => {
  try {
    userLogger.info(
      __filename,
      "attendance_list process request ----> " + JSON.stringify(data)
    );

    const decoded = Auth.decodeToken(authData);
    if (!decoded.usertype_in || !decoded.is_active || decoded.deleted_date) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    const userId = new Mongoose.Types.ObjectId(decoded._id);

    // Define today's date range (UTC)
    const startOfToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setUTCHours(23, 59, 59, 999));

    const attendanceList = await Models.Attendance.find({
      user_id: userId,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    }).sort({ createdAt: 1 }); // Sort by creation time ascending

    if (attendanceList.length > 0) {
      const firstLogin = attendanceList[0].login_time;

      // Find the most recent login and logout
      let recentLogin = null;
      let lastLogout = null;
      let totalHours = 0;

      // Create an Indian time zone formatter
      const indianTimeZone = "Asia/Kolkata";

      // Calculate total hours considering multiple login-logout pairs
      for (let i = 0; i < attendanceList.length; i++) {
        if (attendanceList[i].status === "logged_in") {
          recentLogin = attendanceList[i].login_time;
        }

        if (attendanceList[i].logout_time) {
          lastLogout = attendanceList[i].logout_time;

          // Calculate hours for this session in Indian time zone
          const loginTime = new Date(
            attendanceList[i].login_time
          ).toLocaleString("en-US", { timeZone: indianTimeZone });
          const logoutTime = new Date(
            attendanceList[i].logout_time
          ).toLocaleString("en-US", { timeZone: indianTimeZone });

          const loginTimeObj = new Date(loginTime);
          const logoutTimeObj = new Date(logoutTime);

          if (loginTimeObj && logoutTimeObj && loginTimeObj < logoutTimeObj) {
            totalHours += (logoutTimeObj - loginTimeObj) / (1000 * 3600);
          }
        }
      }

      // If there's a recent login without logout, add time until now
      if (recentLogin && !lastLogout) {
        const loginTime = new Date(recentLogin).toLocaleString("en-US", {
          timeZone: indianTimeZone,
        });
        const currentTime = new Date().toLocaleString("en-US", {
          timeZone: indianTimeZone,
        });

        const loginTimeObj = new Date(loginTime);
        const currentTimeObj = new Date(currentTime);

        totalHours += (currentTimeObj - loginTimeObj) / (1000 * 3600);
      }

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: {
          firstLogin: firstLogin,
          recentLogin: recentLogin,
          lastLogout: lastLogout,
          totalHours: formatTotalHours(Number(totalHours.toFixed(2))),
        },
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No attendance data found.",
      };
    }

    userLogger.info(
      __filename,
      "attendance_list process response ----> " + JSON.stringify(data)
    );
    return data;
  } catch (error) {
    userLogger.error(__filename, "attendance_list catch block ----> " + error);
    console.error("Error in attendance_list:", error);

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error.message || error,
    };
    return data;
  }
};
const get_user_status_list = async (data, authData) => {
  try {
    userLogger.info(
      __filename,
      "user_status_list process request ----> " + JSON.stringify(data)
    );

    const decoded = Auth.decodeToken(authData);
    if (!decoded.usertype_in || !decoded.is_active || decoded.deleted_date) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    // Define today's date range (UTC)
    const startOfToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setUTCHours(23, 59, 59, 999));

    const allUsers = await Models.user.find({ is_active: true }).exec();

    // First, get the latest attendance record for each user
    const latestAttendances = await Models.Attendance.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$user_id",
          latestRecord: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const combinedData = allUsers.map((user) => {
      const attendance = latestAttendances.find(
        (att) => att._id.toString() === user._id.toString()
      );

      let online_status = false;
      let latestLoginTime = null;
      let latestLogoutTime = null;

      if (attendance && attendance.latestRecord) {
        const record = attendance.latestRecord;
        latestLoginTime = record.login_time;
        latestLogoutTime = record.logout_time;

        // User is online if their latest record has status 'logged_in' and no logout_time
        online_status = record.status === "logged_in" && !record.logout_time;
      }

      return {
        user_id: user._id,
        first_name: user.first_name,
        email: user.email,
        mobile: user.mobile_no,
        online_status,
        latestLoginTime,
        latestLogoutTime,
        employee_type: user.employee_type,
      };
    });

    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: combinedData,
      message: "User status list retrieved successfully.",
    };

    userLogger.info(
      __filename,
      "user_status_list process response ----> " + JSON.stringify(data.response)
    );
    return data;
  } catch (error) {
    userLogger.error(__filename, "user_status_list catch block ----> " + error);
    console.error("Error in user_status_list:", error);

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error.message || error,
    };
    return data;
  }
};
// controllers/attendanceController.js
// const getUserCalendarData = async (data, authData) => {
//   try {
//     userLogger.info(
//       __filename,
//       "user calendar data process request ----> " + JSON.stringify(data)
//     );

//     // Decode the authentication token
//     const decoded = Auth.decodeToken(authData);
//     if (!decoded.usertype_in || !decoded.is_active || decoded.deleted_date) {
//       data.response = {
//         status: 0,
//         result: STATUS.ERROR,
//         message: "Invalid user!",
//       };
//       return data;
//     }

//     const userId = new Mongoose.Types.ObjectId(decoded._id);

//     // Get the start and end of the month
//     const today = new Date();
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//     // Fetch attendance records for the month with corrected aggregation
//     const attendanceRecords = await Models.Attendance.aggregate([
//       {
//         $match: {
//           user_id: userId,
//           createdAt: {
//             $gte: startOfMonth,
//             $lte: endOfMonth,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           },
//           firstLogin: { $min: "$login_time" },
//           lastLogout: { $max: "$logout_time" },
//           totalHours: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $ne: ["$login_time", null] },
//                     { $ne: ["$logout_time", null] },
//                   ],
//                 },
//                 {
//                   $divide: [
//                     { $subtract: ["$logout_time", "$login_time"] },
//                     3600000, // Convert milliseconds to hours
//                   ],
//                 },
//                 0,
//               ],
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           checkIn: {
//             $dateToString: {
//               format: "%H:%M",
//               date: "$firstLogin",
//               timezone: "UTC",
//             },
//           },
//           checkOut: {
//             $dateToString: {
//               format: "%H:%M",
//               date: "$lastLogout",
//               timezone: "UTC",
//             },
//           },
//           totalHours: { $round: ["$totalHours", 2] },
//         },
//       },
//       {
//         $sort: { date: 1 },
//       },
//     ]);

//     // Fetch holidays for the month
//     const holidays = await Models.holidayCreate.find();

//     // Format holidays
//     const formattedHolidays = holidays.map((holiday) => ({
//       date: holiday.holiday_date.toISOString().split("T")[0],
//       name: holiday.holiday_name,
//       type: holiday.is_compulsory,
//     }));

//     data.response = {
//       status: 200,
//       result: STATUS.SUCCESS,
//       data: {
//         attendance: attendanceRecords,
//         holidays: formattedHolidays,
//       },
//       message: "Calendar data found successfully",
//     };

//     userLogger.info(
//       __filename,
//       "user calendar data process response ----> " + JSON.stringify(data)
//     );
//     return data;
//   } catch (error) {
//     userLogger.error(
//       __filename,
//       "user calendar data catch block ----> " + error
//     );
//     console.error("Error in user calendar data:", error);

//     data.response = {
//       status: 0,
//       result: STATUS.ERROR,
//       message: "Something went wrong",
//       error: error.message || error,
//     };
//     return data;
//   }
// };
const validateDates = (from_date, to_date) => {
  const start = moment(from_date, "YYYY-MM-DD", true);
  const end = moment(to_date, "YYYY-MM-DD", true);

  if (!start.isValid() || !end.isValid()) {
    throw new Error("Invalid date format. Use 'YYYY-MM-DD'.");
  }

  if (end.isBefore(start)) {
    throw new Error("'to_date' cannot be earlier than 'from_date'.");
  }
};

const getUserCalendarData = async (data, authData) => {
  try {
    userLogger.info(
      __filename,
      "user calendar data process request ----> " + JSON.stringify(data)
    );

    // Decode the authentication token
    const decoded = Auth.decodeToken(authData);
    if (!decoded.usertype_in || !decoded.is_active || decoded.deleted_date) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    const userId = new Mongoose.Types.ObjectId(decoded._id);

    // Get the start and end of the month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfYesterday = new Date(today); // Exclude current date
    endOfYesterday.setDate(today.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Fetch attendance records for the month with corrected aggregation
    const attendanceRecords = await Models.Attendance.aggregate([
      {
        $match: {
          user_id: userId,
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfYesterday,
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          firstLogin: { $min: "$login_time" },
          lastLogout: { $max: "$logout_time" },
          totalHours: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$login_time", null] },
                    { $ne: ["$logout_time", null] },
                  ],
                },
                {
                  $divide: [
                    { $subtract: ["$logout_time", "$login_time"] },
                    3600000, // Convert milliseconds to hours
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      {
        $match: {
          totalHours: { $gte: 8 }, // Only include days with 8 or more hours
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          checkIn: {
            $dateToString: {
              format: "%H:%M",
              date: "$firstLogin",
              timezone: "UTC",
            },
          },
          checkOut: {
            $dateToString: {
              format: "%H:%M",
              date: "$lastLogout",
              timezone: "UTC",
            },
          },
          totalHours: { $round: ["$totalHours", 2] },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Fetch holidays for the month
    const holidays = await Models.holidayCreate.find();

    // Format holidays
    const formattedHolidays = holidays.map((holiday) => ({
      date: holiday.holiday_date.toISOString().split("T")[0],
      name: holiday.holiday_name,
      type: holiday.is_compulsory,
    }));

    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: {
        attendance: attendanceRecords,
        holidays: formattedHolidays,
      },
      message: "Calendar data found successfully",
    };

    userLogger.info(
      __filename,
      "user calendar data process response ----> " + JSON.stringify(data)
    );
    return data;
  } catch (error) {
    userLogger.error(
      __filename,
      "user calendar data catch block ----> " + error
    );
    console.error("Error in user calendar data:", error);

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error.message || error,
    };
    return data;
  }
};
const get_user_attendance_report = async (data, authData) => {
  try {
    userLogger.info(
      __filename,
      "user_status_list process request ----> " + JSON.stringify(data)
    );

    const decoded = Auth.decodeToken(authData);
    if (!decoded.usertype_in || !decoded.is_active || decoded.deleted_date) {
      return {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
    }

    const {
      from_date,
      to_date,
      employee_id = null,
      export_to_excel = false,
    } = data;

    if (!from_date || !to_date) {
      return {
        status: 400,
        result: STATUS.ERROR,
        message: "Start and end dates are required.",
      };
    }

    try {
      validateDates(from_date, to_date);
    } catch (error) {
      return {
        status: 400,
        result: STATUS.ERROR,
        message: error.message,
      };
    }

    const startDate = moment(from_date).startOf("day").toDate();
    const endDate = moment(to_date).endOf("day").toDate();

    const currentDate = new Date();

    const userMatchConditions = employee_id
      ? { _id: new Mongoose.Types.ObjectId(employee_id) }
      : {};

    const attendanceReportPipeline = [
      {
        $match: {
          ...userMatchConditions,
          $expr: {
            $and: [
              { $gte: ["$createdAt", startDate] },
              { $lte: ["$createdAt", endDate] },
            ],
          },
        },
      },

      {
        $lookup: {
          from: "attendances",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $gte: ["$login_time", startDate] },
                    { $lte: ["$login_time", endDate] },
                  ],
                },
              },
            },
          ],
          as: "attendanceRecords",
        },
      },
      {
        $lookup: {
          from: "leaveapplications",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$status", "approved"] },
                    {
                      $or: [
                        {
                          $and: [
                            { $gte: ["$from_date", startDate] },
                            { $lte: ["$from_date", endDate] },
                          ],
                        },
                        {
                          $and: [
                            { $gte: ["$to_date", startDate] },
                            { $lte: ["$to_date", endDate] },
                          ],
                        },
                        {
                          $and: [
                            { $lte: ["$from_date", startDate] },
                            { $gte: ["$to_date", endDate] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "leaveData",
        },
      },
      {
        $lookup: {
          from: "holidaycreates",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ["$holiday_date", startDate] },
                    { $lte: ["$holiday_date", endDate] },
                  ],
                },
              },
            },
          ],
          as: "holidays",
        },
      },
      {
        $addFields: {
          totalDays: {
            $dateDiff: {
              startDate: startDate,
              endDate: endDate,
              unit: "day",
            },
          },
          dateStats: {
            $map: {
              input: {
                $range: [
                  1,
                  {
                    $add: [
                      {
                        $dateDiff: {
                          startDate: startDate, // Use directly as Date
                          endDate: endDate, // Use directly as Date
                          unit: "day",
                        },
                      },
                      1,
                    ],
                  },
                ],
              },
              as: "dayIndex",
              in: {
                date: {
                  $dateAdd: {
                    startDate: startDate, // Use directly as Date
                    unit: "day",
                    amount: "$$dayIndex",
                  },
                },
                status: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $dateAdd: {
                            startDate: startDate, // Use directly as Date
                            unit: "day",
                            amount: "$$dayIndex",
                          },
                        },
                        currentDate,
                      ],
                    },
                    then: null, // Leave blank for upcoming days
                    else: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: [
                                {
                                  $dayOfWeek: {
                                    $dateAdd: {
                                      startDate: startDate, // Use directly as Date
                                      unit: "day",
                                      amount: "$$dayIndex",
                                    },
                                  },
                                },
                                1, // Weekly Off (e.g., Sunday)
                              ],
                            },
                            then: "Weekly Off",
                          },
                          {
                            case: {
                              $anyElementTrue: {
                                $ifNull: [
                                  {
                                    $map: {
                                      input: { $ifNull: ["$holidays", []] },
                                      as: "holiday",
                                      in: {
                                        $eq: [
                                          {
                                            $dateToString: {
                                              format: "%Y-%m-%d",
                                              date: "$$holiday.holiday_date",
                                            },
                                          },
                                          {
                                            $dateToString: {
                                              format: "%Y-%m-%d",
                                              date: {
                                                $dateAdd: {
                                                  startDate: startDate,
                                                  unit: "day",
                                                  amount: "$$dayIndex",
                                                },
                                              },
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  [],
                                ],
                              },
                            },
                            then: "Holiday",
                          },
                          {
                            case: {
                              $anyElementTrue: {
                                $ifNull: [
                                  {
                                    $map: {
                                      input: { $ifNull: ["$leaveData", []] },
                                      as: "leave",
                                      in: {
                                        $and: [
                                          {
                                            $lte: [
                                              "$$leave.from_date",
                                              {
                                                $dateAdd: {
                                                  startDate: startDate,
                                                  unit: "day",
                                                  amount: "$$dayIndex",
                                                },
                                              },
                                            ],
                                          },
                                          {
                                            $gte: [
                                              "$$leave.to_date",
                                              {
                                                $dateAdd: {
                                                  startDate: startDate,
                                                  unit: "day",
                                                  amount: "$$dayIndex",
                                                },
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  [],
                                ],
                              },
                            },
                            then: "Leave",
                          },
                          {
                            case: {
                              $anyElementTrue: {
                                $ifNull: [
                                  {
                                    $map: {
                                      input: {
                                        $ifNull: ["$attendanceRecords", []],
                                      },
                                      as: "record",
                                      in: {
                                        $and: [
                                          {
                                            $ne: ["$$record.login_time", null],
                                          },
                                          {
                                            $and: [
                                              {
                                                $gte: [
                                                  "$$record.login_time",
                                                  {
                                                    $dateAdd: {
                                                      startDate: startDate,
                                                      unit: "day",
                                                      amount: "$$dayIndex",
                                                    },
                                                  },
                                                ],
                                              },
                                              {
                                                $lt: [
                                                  "$$record.login_time",
                                                  {
                                                    $dateAdd: {
                                                      startDate: startDate,
                                                      unit: "day",
                                                      amount: {
                                                        $add: ["$$dayIndex", 1],
                                                      },
                                                    },
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    },
                                  },
                                  [],
                                ],
                              },
                            },
                            then: "Present",
                          },
                        ],
                        default: "Absent",
                      },
                    },
                  },
                },
              },
            },
          },

          weeklyOffCount: {
            $size: {
              $filter: {
                input: {
                  $map: {
                    input: {
                      $range: [
                        0,
                        {
                          $add: [
                            {
                              $dateDiff: {
                                startDate: startDate,
                                endDate: endDate,
                                unit: "day",
                              },
                            },
                            1,
                          ],
                        },
                      ],
                    },
                    as: "dayOffset",
                    in: {
                      $dateAdd: {
                        startDate: startDate,
                        unit: "day",
                        amount: "$$dayOffset",
                      },
                    },
                  },
                },
                as: "date",
                cond: {
                  $and: [
                    { $eq: [{ $dayOfWeek: "$$date" }, 1] },
                    { $lte: ["$$date", "$$NOW"] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          employee_id: "$_id",
          employee_name: { $concat: ["$first_name"] },
          employee_type: "$employee_type",
          summary_stats: {
            total_days: {
              $size: "$dateStats",
            },
            total_weekly_offs: "$weeklyOffCount",
            total_working_days: {
              $subtract: [
                {
                  $size: "$dateStats",
                },
                {
                  $add: [
                    "$weeklyOffCount",
                    { $size: { $ifNull: ["$holidays", []] } },
                    { $size: { $ifNull: ["$leaveData", []] } },
                  ],
                },
              ],
            },
            total_present: {
              $size: {
                $filter: {
                  input: "$dateStats",
                  as: "stat",
                  cond: { $eq: ["$$stat.status", "Present"] },
                },
              },
            },
            total_absent: {
              $size: {
                $filter: {
                  input: "$dateStats",
                  as: "stat",
                  cond: { $eq: ["$$stat.status", "Absent"] },
                },
              },
            },
            total_leave: { $size: { $ifNull: ["$leaveData", []] } },
            total_holiday: { $size: { $ifNull: ["$holidays", []] } },
          },

          dateStats: 1,
        },
      },
    ];

    const attendanceReports = await Models.user.aggregate(
      attendanceReportPipeline
    );

    return {
      status: 200,
      result: STATUS.SUCCESS,
      data: attendanceReports,
      message: "Attendance report generated successfully.",
    };
  } catch (error) {
    userLogger.error("Attendance report generation error", error);
    return {
      status: 500,
      result: STATUS.ERROR,
      message: "Failed to generate attendance report.",
      error: error.message,
    };
  }
};

module.exports = {
  create,
  get_attendance_list_id,
  get_user_status_list,
  getUserCalendarData,
  get_user_attendance_report,
};
