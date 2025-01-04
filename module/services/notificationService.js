const commonFunctions = require("../services/commonFunctions");


async function formatDateToISOString(date) {
    return date.toISOString();
  }


const list = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in === true && decoded ?. is_active === false && decoded ?. deleted_date == null) {
            data.response = {
                status: 0,
                message: "You are not valid user!!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]
        delete data["filter"]
        delete data["limit"]
        delete data["page_no"]
        //const currentDate = new Date();
        const currentDate = new Date();
        const tenDaysAgo = new Date(currentDate.getTime());
        tenDaysAgo.setDate(currentDate.getDate() - 10);

        // Calculate the current date plus 2 days
        const futureDate = new Date(currentDate.getTime());
        futureDate.setDate(currentDate.getDate() + 2);

        // Format the dates using the custom function
        const formattedCurrentDate = await formatDateToISOString(futureDate);
        const formattedTenDaysAgo = await formatDateToISOString(tenDaysAgo);

        // Use the formatted dates in the MongoDB query
        var record = await Models.notificationLog.aggregate([
        {
            $match: {
              $or: [
                    {
                      type: 'Course', 
                      title: 'New Course'
                    },
                    {
                      user_id: data.user_id,
                      createdAt: {
                          $gte: new Date(formattedTenDaysAgo), 
                          $lte: new Date(formattedCurrentDate)
                      }
                    },
                    {
                      type: 'Event', 
                      title: 'New Event'
                    },
              ]
            }
        },
        {
            $sort: {
            createdAt: -1
            }
        },
        {
          $lookup: {
            from: 'events', 
            localField: 'event_id', 
            foreignField: 'event_id', 
            as: 'event_data'
          }
        },
        {
          $unwind: {
            path: '$event_data', 
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'courses', 
            localField: 'course_id', 
            foreignField: 'course_id', 
            as: 'course_data'
          }
        },
        {
          $unwind: {
            path: '$course_data', 
            preserveNullAndEmptyArrays: true
          }
        }
        ]);
        console.log(record)
        if (record !== null) {
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: record,
                message: "Data updated."
            }
        } else {
            data.response = {
                status: 200,
                result: STATUS.ERROR,
                message: "Data not found."
            }
        }

        return data;
    } catch (error) {
        console.log(error, "error");
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}
module.exports = {
    list
}