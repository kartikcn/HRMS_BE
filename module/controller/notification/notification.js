const notificationService = require("../../services/notificationService");
const commonFunctions = require("../../services/commonFunctions");
const cron = require("node-cron");
const { sendPushNotification } = require("../../../firebaseHandler");


class notification {
    constructor() {
        console.log(' ----->  create notes');
    }


    async process(data, authData) {
        if(data['command'][0]['function'] != "" && data['command'][0]['function'] != null && typeof(this[data['command'][0]['function']]) === 'function') {
            var function_name = data['command'][0]['function'];
            let result = await this[function_name](data, authData);
            return result;
        } else {
        // Define the cron job outside the try-catch block
            cron.schedule('*/1 * * * *', async function () {
                try {
                    console.log('inside cron');
                    userLogger.info(__filename, 'Start processing paymentReminderCron ' + JSON.stringify(data, null, 4));
                    const currentDate = new Date();
                    const fiveDaysLater = new Date();
                    fiveDaysLater.setDate(currentDate.getDate() + 5);
                    const formattedCurrentDate = await commonFunctions.formatDate(currentDate);
                    const formattedFiveDaysLater = await commonFunctions.formatDate(fiveDaysLater);
                    // Function to format date as dd-mm-yyyy


                    const result = await Models.payment_detail.aggregate([
                        {
                            $match: {
                                type: "Subscription",
                                expiry_date: { $ne: null }  // Ensures expiry_date is not null
                            }
                        },
                        {
                            $addFields: {
                                expiryDateConverted: {
                                    $dateFromString: {
                                        dateString: "$expiry_date",
                                        format: "%d-%m-%Y",
                                        onError: null,  // Set to null if conversion fails
                                        onNull: null   // Set to null if the field is null
                                    }
                                }
                            }
                        },
                        {
                            $match: {
                                expiryDateConverted: { $ne: null }  // Ensures converted expiry date is not null
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $gte: [
                                                "$expiryDateConverted",
                                                {
                                                    $dateFromString: {
                                                        dateString: formattedCurrentDate,
                                                        format: "%d-%m-%Y"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            $lte: [
                                                "$expiryDateConverted",
                                                {
                                                    $dateFromString: {
                                                        dateString: formattedFiveDaysLater,
                                                        format: "%d-%m-%Y"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "user_id",
                                as: "userdata"
                            }
                        },
                        {
                            $unwind: {
                                path: "$userdata",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ]);
                    console.log(result, "resulrr"); // Log the result of the aggregation
                    if (result.length > 0) {
                        for(var i=0;i<result.length;i++) {
                            const paymentReminderMessage = 'Your subsciption is going to end soon on '+result[i]['expiry_date']+' !. ';
                        // var token = "f0xTX3nsTiWuN3ClIJrijo:APA91bH9Z89ePYBgaZYA3DkDbKMsdP2ET_XwgiK-fLNoejB80MokySo2DUD8vxRHRNYKQUZh3_4HV6oGLjb70sVR9y0KvntjfSmzWjW8f3TpUJ0zURaxxrNGlVjSWLjrzIMM6-r5BYao";
                            var token = result[i]['userdata']['device_token'];
                            var title = "Subcription End"
                            var notifyResponse = await sendPushNotification(paymentReminderMessage, token, title);
                            var notificationData = {
                                user_id: result[i]['user_id'],
                                message: paymentReminderMessage,
                                type: "Subscription"
                            }
                            console.log(notifyResponse, "notifyResponse")
                            if(notifyResponse) {
                                var saved_data = await new Models.notificationLog(notificationData).save();
                                userLogger.info(__filename, 'Error sending notification: ---->>,' + saved_data);
                               // return saved_data;
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                    userLogger.info(__filename, 'Error sending notification: ---->>,' + e);
                }
            });
        }
    }

    async list(data, authData) {
        try {
          let response = await notificationService.list(data, authData);
          return response;
        } catch(e) {
          console.log(e)
        }
    }
  
}

module.exports = notification;
