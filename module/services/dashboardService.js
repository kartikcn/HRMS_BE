const dashboardData = async (data, authData) => {
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
    let timeframe = data.timeframe;
    const currentDate = new Date();
    if (timeframe === "monthly") {
      // Calculate start and end dates for the current month

      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      var dataMatch = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else if (timeframe === "yearly") {
      const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

      // Fetch data for the current year
      var dataMatch = {
        $gte: firstDayOfYear,
        $lte: lastDayOfYear,
      };
    } else if (timeframe === "halfYearly") {
      // Calculate start and end dates for the current half-year
      const currentMonth = currentDate.getMonth();
      let firstDayOfHalfYear, lastDayOfHalfYear, halfYearName;

      if (currentMonth < 6) {
        // First half of the year
        firstDayOfHalfYear = new Date(currentDate.getFullYear(), 0, 1);
        lastDayOfHalfYear = new Date(currentDate.getFullYear(), 5, 30);
        halfYearName = `${new Date(firstDayOfHalfYear).toLocaleString(
          "default",
          { month: "short" }
        )}-${new Date(lastDayOfHalfYear).toLocaleString("default", {
          month: "short",
        })}`;
      } else {
        // Second half of the year
        firstDayOfHalfYear = new Date(currentDate.getFullYear(), 6, 1);
        lastDayOfHalfYear = new Date(currentDate.getFullYear(), 11, 31);
        halfYearName = `${new Date(firstDayOfHalfYear).toLocaleString(
          "default",
          { month: "short" }
        )}-${new Date(lastDayOfHalfYear).toLocaleString("default", {
          month: "short",
        })}`;
      }

      // Fetch data for the current half-year
      var dataMatch = {
        $gte: firstDayOfHalfYear,
        $lte: lastDayOfHalfYear,
      };
    } else if (timeframe === "quarterly") {
      // Calculate start and end dates for the current quarter
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      let firstDayOfQuarter, lastDayOfQuarter;

      if (currentMonth < 3) {
        // First quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 0, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 2, 31);
      } else if (currentMonth < 6) {
        // Second quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 3, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 5, 30);
      } else if (currentMonth < 9) {
        // Third quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 6, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 8, 30);
      } else {
        // Fourth quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 9, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 11, 31);
      }
      var dataMatch = {
        $gte: firstDayOfQuarter,
        $lte: lastDayOfQuarter,
      };
    }

    delete data["action"];
    delete data["command"];
    const communityCount = await Models.community.aggregate([
      {
        $match: {
          community_type: {
            $in: ["Paid", "Free"],
          },
          createdAt: dataMatch,
        },
      },
      {
        $group: {
          _id: "$community_type",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);
    // {
    //   $match: {
    //     start_month: data.month,
    //     start_year: data.year
    //   }
    // },
    const eventCount = await Models.event.aggregate([
      {
        $addFields: {
          start_date_converted: {
            $dateFromString: {
              dateString: "$start_date",
            },
          },
          end_date_converted: {
            $dateFromString: {
              dateString: "$end_date",
            },
          },
        },
      },
      {
        $addFields: {
          start_month: { $month: "$start_date_converted" },
          start_year: { $year: "$start_date_converted" },
        },
      },
      {
        $addFields: {
          start_month: { $month: "$end_date_converted" },
          start_year: { $year: "$end_date_converted" },
        },
      },

      {
        $addFields: {
          start: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S",
              date: "$start_date_converted",
            },
          },
          eend: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S",
              date: "$start_date_converted",
            },
          },
        },
      },
      {
        $addFields: {
          estart: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S",
              date: "$end_date_converted",
            },
          },
          end: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S",
              date: "$end_date_converted",
            },
          },
        },
      },
      {
        $project: {
          title: "$name",
          start: "$start_date",
          end: "$end_date",
          description: "$description",
          event_id: 1,
        },
      },
      {
        $sort: { start: 1 },
      },
    ]);

    const userCount = await Models.user.aggregate([
      {
        $match: {
          usertype_in: false,
          is_subscribe: {
            $in: [true, false],
          },
          createdAt: dataMatch,
        },
      },
      {
        $group: {
          _id: "$is_subscribe",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);

    const eventData = await Models.payment_detail.aggregate([
      {
        $match: {
          type: "Event",
          createdAt: dataMatch,
        },
      },
      {
        $group: {
          _id: "",
          event_amount: {
            $sum: "$paid_amount",
          },
        },
      },
    ]);

    const refund_event_amount = await Models.user_register_event.aggregate([
      {
        $match: {
          createdAt: dataMatch,
          refund_status: true,
        },
      },
      {
        $group: {
          _id: "",
          refund_event_amount: {
            $sum: "$paid_amount",
          },
        },
      },
    ]);

    const courseData = await Models.payment_detail.aggregate([
      {
        $match: {
          type: "Course",
          createdAt: dataMatch,
        },
      },
      {
        $group: {
          _id: "",
          course_amount: {
            $sum: "$paid_amount",
          },
        },
      },
    ]);

    const subscriptionData = await Models.payment_detail.aggregate([
      {
        $match: {
          type: "Subscription",
          createdAt: dataMatch,
        },
      },
      {
        $group: {
          _id: "",
          subscription_amount: {
            $sum: "$paid_amount",
          },
        },
      },
    ]);

    var total_event_amount = 0;
    var total_course_amount = 0;
    var total_subscription_amount = 0;

    if (
      refund_event_amount.length == 0 ||
      refund_event_amount[0].refund_event_amount == null
    ) {
      var total_refund_event_amount = 0;
    } else {
      var total_refund_event_amount =
        refund_event_amount[0].refund_event_amount;
    }

    if (
      eventData[0]?.event_amount !== undefined &&
      eventData[0]?.event_amount !== null
    ) {
      total_event_amount =
        eventData[0]?.event_amount - total_refund_event_amount;
    }

    if (
      courseData[0]?.course_amount !== undefined &&
      courseData[0]?.course_amount !== null
    ) {
      total_course_amount = courseData[0]?.course_amount;
    }

    if (
      subscriptionData[0]?.subscription_amount !== undefined &&
      subscriptionData[0]?.subscription_amount !== null
    ) {
      total_subscription_amount = subscriptionData[0]?.subscription_amount;
    }

    var total_revenue =
      total_event_amount + total_course_amount + total_subscription_amount;

    const result = {
      communityCount: communityCount,
      userCount: userCount,
      eventCount: eventCount,
      total_event_amount: total_event_amount,
      total_course_amount: total_course_amount,
      total_subscription_amount: total_subscription_amount,
      total_revenue: total_revenue,
    };
    data.response = {
      status: 200,
      result: "STATUS.SUCCESS",
      message: "Fetched successfully",
      data: result,
    };
    return data;
  } catch (e) {
    userLogger.info(__filename, "dashboard data ---->  ," + data);
    console.log(e);
    data.response = {
      status: 0,
      result: "STATUS.ERROR",
      message: "Something is wrong",
      error: e,
    };
    return data;
  }
};

const convertToCsv = async (data, timeframe) => {
  let csv = "";

  if (timeframe === "monthly") {
    // Group data by weeks for monthly timeframe
    const groupedByWeek = groupDataByWeek(data);

    // Convert each group (week) to CSV format
    groupedByWeek.forEach((weekData, index) => {
      // Add week header
      csv += `Week ${index + 1}\n`;

      // Add headers
      csv += Object.keys(weekData[0]).join(",") + "\n";

      // Add rows
      weekData.forEach((item) => {
        csv += Object.values(item).join(",") + "\n";
      });

      // Add newline between weeks
      csv += "\n";
    });
  } else if (timeframe === "yearly") {
    // Group data by months for yearly timeframe
    const groupedByMonth = groupDataByMonth(data);

    // Convert each group (month) to CSV format
    groupedByMonth.forEach((monthData, index) => {
      // Add month header
      csv += `${new Date(monthData[0].start_date).toLocaleString("default", {
        month: "long",
      })}\n`;

      // Add headers
      csv += Object.keys(monthData[0]).join(",") + "\n";

      // Add rows
      monthData.forEach((item) => {
        csv += Object.values(item).join(",") + "\n";
      });

      // Add newline between months
      csv += "\n";
    });
  } else if (timeframe === "halfYearly") {
    // Group data by half-yearly
    const groupedByHalfYear = groupDataByHalfYear(data);

    // Convert each group (half-year) to CSV format
    groupedByHalfYear.forEach((halfYearData, index) => {
      const timePeriod = index === 0 ? "Jan-Jun" : "Jul-Dec";
      csv += `Half Year ${index + 1} (${timePeriod})\n`;

      // Add headers
      csv += Object.keys(halfYearData[0]).join(",") + "\n";

      // Add rows
      halfYearData.forEach((item) => {
        csv += Object.values(item).join(",") + "\n";
      });

      // Add newline between half-years
      csv += "\n";
    });
  } else if (timeframe === "quarterly") {
    // Group data by quarterly
    const groupedByQuarter = groupDataByQuarter(data);
    console.log("group group ", groupDataByQuarter);

    // Define quarter names
    const quarterNames = ["Q1", "Q2", "Q3", "Q4"];

    // Convert each group (quarter) to CSV format
    groupedByQuarter.forEach((quarterData, index) => {
      // Calculate the quarter index
      const quarterIndex =
        Math.floor(new Date(quarterData[0].start_date).getMonth() / 3) + 1;
      console.log(quarterIndex, "quarterIndex");

      // Determine the time period based on the quarter index
      const timePeriod =
        quarterIndex === 1
          ? "Jan-Mar"
          : quarterIndex === 2
          ? "Apr-Jun"
          : quarterIndex === 3
          ? "Jul-Sep"
          : "Oct-Dec";
      console.log("time period", timePeriod);

      // Construct the quarter label
      const quarterLabel = `${quarterNames[quarterIndex - 1]} (${timePeriod})`;

      // Add quarter header
      csv += `${quarterLabel}\n`;

      // Add headers
      csv += Object.keys(quarterData[0]).join(",") + "\n";

      // Add rows
      quarterData.forEach((item) => {
        csv += Object.values(item).join(",") + "\n";
      });

      // Add newline between quarters
      csv += "\n";
    });
  }
  return csv;
};

const exportToCsv = async (data, authData) => {
  try {
    // const decoded = Auth.decodeToken(authData);
    // if (decoded?.usertype_in === false || decoded?.is_active == false || decoded?.deleted_date !== null) {
    //     data.response = {
    //         status: 0,
    //         message: "You are not valid user!"
    //     }
    //     return data;
    // }
    const timeframe = data.timeframe; // Assuming you're passing 'timeframe' as a query parameter ('monthly' or 'yearly')

    let datas;
    if (timeframe === "monthly") {
      // Calculate start and end dates for the current month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Fetch data for the current month
      datas = await Models.event
        .find({
          start_date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        })
        .lean();
    } else if (timeframe === "yearly") {
      // Calculate start and end dates for the current year
      const currentDate = new Date();
      const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

      // Fetch data for the current year
      datas = await Models.event
        .find({
          start_date: {
            $gte: firstDayOfYear,
            $lte: lastDayOfYear,
          },
        })
        .lean();
    } else if (timeframe === "halfYearly") {
      // Calculate start and end dates for the current half-year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      let firstDayOfHalfYear, lastDayOfHalfYear, halfYearName;

      if (currentMonth < 6) {
        // First half of the year
        firstDayOfHalfYear = new Date(currentDate.getFullYear(), 0, 1);
        lastDayOfHalfYear = new Date(currentDate.getFullYear(), 5, 30);
        halfYearName = `${new Date(firstDayOfHalfYear).toLocaleString(
          "default",
          { month: "short" }
        )}-${new Date(lastDayOfHalfYear).toLocaleString("default", {
          month: "short",
        })}`;
      } else {
        // Second half of the year
        firstDayOfHalfYear = new Date(currentDate.getFullYear(), 6, 1);
        lastDayOfHalfYear = new Date(currentDate.getFullYear(), 11, 31);
        halfYearName = `${new Date(firstDayOfHalfYear).toLocaleString(
          "default",
          { month: "short" }
        )}-${new Date(lastDayOfHalfYear).toLocaleString("default", {
          month: "short",
        })}`;
      }
      console.log(firstDayOfHalfYear.toISOString(), "firstDayOfHalfYear");
      // Fetch data for the current half-year
      datas = await Models.event
        .find({
          start_date: {
            $gte: firstDayOfHalfYear.toISOString(),
            $lte: lastDayOfHalfYear.toISOString(),
          },
        })
        .lean();
    } else if (timeframe === "quarterly") {
      // Calculate start and end dates for the current quarter
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      let firstDayOfQuarter, lastDayOfQuarter;

      if (currentMonth < 3) {
        // First quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 0, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 2, 31);
      } else if (currentMonth < 6) {
        // Second quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 3, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 5, 30);
      } else if (currentMonth < 9) {
        // Third quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 6, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 8, 30);
      } else {
        // Fourth quarter of the year
        firstDayOfQuarter = new Date(currentDate.getFullYear(), 9, 1);
        lastDayOfQuarter = new Date(currentDate.getFullYear(), 11, 31);
      }

      // Fetch data for the current quarter
      datas = await Models.event
        .find({
          start_date: {
            $gte: firstDayOfQuarter,
            $lte: lastDayOfQuarter,
          },
        })
        .lean();
    } else {
      throw new Error("Invalid timeframe");
    }

    // Convert data to CSV format
    const csvData = await convertToCsv(datas, timeframe);
    console.log(csvData, "csvData");
    data.response = {
      status: 200,
      message: "!",
      data: csvData,
    };
    return data;
    // // Set response header to indicate CSV file download
    // res.setHeader('Content-Type', 'text/xlss');
    // res.setHeader('Content-Disposition', 'attachment; filename="data.xlss"');

    // // Pipe CSV data to response
    // res.send(csvData);
  } catch (e) {
    console.log(e);
  }
};

function groupDataByHalfYear(data) {
  const groupedData = [];
  let currentHalfYear = [];
  let currentMonth = -1;

  // Sort data by start_date date
  data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Iterate over each item and group them by half-year
  data.forEach((item) => {
    const start_date = new Date(item.start_date);
    const month = start_date.getMonth();

    // If it's the first item or it belongs to the same half-year, add it to the current half-year group
    if (
      currentMonth === -1 ||
      Math.floor(currentMonth / 6) === Math.floor(month / 6)
    ) {
      currentHalfYear.push(item);
    } else {
      // If a new half-year begins, start a new group
      groupedData.push(currentHalfYear);
      currentHalfYear = [item];
    }

    currentMonth = month;
  });

  // Push the last half-year's data
  if (currentHalfYear.length > 0) {
    groupedData.push(currentHalfYear);
  }

  return groupedData;
}

// Helper function to group data by quarter (3 months)
function groupDataByQuarter(data) {
  const groupedData = [];
  let currentQuarter = [];
  let currentMonth = -1;

  console.log("dataaaaa", data);

  // Sort data by start_date date
  data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Iterate over each item and group them by quarter
  data.forEach((item) => {
    const start_date = new Date(item.start_date);
    const month = start_date.getMonth();
    console.log("month from group quareter", month);

    // If it's the first item or it belongs to the same quarter, add it to the current quarter group
    if (
      currentMonth === -1 ||
      Math.floor(currentMonth / 3) === Math.floor(month / 3)
    ) {
      currentQuarter.push(item);
    } else {
      // If a new quarter begins, start a new group
      groupedData.push(currentQuarter);
      currentQuarter = [item];
    }

    currentMonth = month;
    console.log("current monthss", currentMonth);
    console.log("curerent quater", currentQuarter);
  });

  // Push the last quarter's data
  if (currentQuarter.length > 0) {
    groupedData.push(currentQuarter);
  }
  console.log("groupppp", groupedData);
  return groupedData;
}

// Helper function to group data by weeks
function groupDataByWeek(data) {
  const groupedData = [];
  let currentWeek = [];
  let currentWeekNumber = -1;

  // Sort data by start_date date
  data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Iterate over each item and group them by week
  data.forEach((item) => {
    const start_date = new Date(item.start_date);
    const weekNumber = getISOWeek(start_date);

    if (weekNumber !== currentWeekNumber) {
      // If a new week begins, start a new group
      if (currentWeek.length > 0) {
        groupedData.push(currentWeek);
      }
      currentWeek = [item];
      currentWeekNumber = weekNumber;
    } else {
      // If the item belongs to the current week, add it to the current group
      currentWeek.push(item);
    }
  });

  // Push the last week's data
  if (currentWeek.length > 0) {
    groupedData.push(currentWeek);
  }

  return groupedData;
}

// Helper function to group data by months
function groupDataByMonth(data) {
  const groupedData = [];
  let currentMonth = [];
  let currentMonthNumber = -1;

  // Sort data by start_date date
  data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Iterate over each item and group them by month
  data.forEach((item) => {
    const start_date = new Date(item.start_date);
    const monthNumber = start_date.getMonth();

    if (monthNumber !== currentMonthNumber) {
      // If a new month begins, start a new group
      if (currentMonth.length > 0) {
        groupedData.push(currentMonth);
      }
      currentMonth = [item];
      currentMonthNumber = monthNumber;
    } else {
      // If the item belongs to the current month, add it to the current group
      currentMonth.push(item);
    }
  });

  // Push the last month's data
  if (currentMonth.length > 0) {
    groupedData.push(currentMonth);
  }

  return groupedData;
}

// Helper function to get ISO week number from a date
function getISOWeek(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}
module.exports = {
  dashboardData,
  exportToCsv,
};
