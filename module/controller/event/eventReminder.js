const eventService = require("../../services/eventService");
const cron = require("node-cron");
const commonFunctions = require("../../services/commonFunctions");
const mail = require('../../../system/mailer/mail');
const prjConfig = require("../../../config.json");
const tpl = require('node-tpl');
class eventReminder {
    constructor() {
        console.log(' ----->  create event');
    }
    async process(data, authData) {
        if (data['command'][0]['function'] != "" && data['command'][0]['function'] != null && typeof(this[data['command'][0]['function']]) === 'function') {
            var function_name = data['command'][0]['function'];
            let result = await this[function_name](data, authData);
            return result;
        } else {
            cron.schedule('*/1 * * * *', async function () {
                try {
                    console.log('inside cron');
                    userLogger.info(__filename, 'Start processing paymentReminderCron ' + JSON.stringify(data, null, 4));
                    const currentDate = new Date();
                    const SevenDaysAgo = new Date(currentDate.getTime());
                    SevenDaysAgo.setDate(currentDate.getDate() + 7);
                    const formattedCurrentDate = await commonFunctions.formatDateToISOString(currentDate);
                    const formattedSevenDaysAgo = await commonFunctions.formatDateToISOString(SevenDaysAgo);
                    // Function to format date as dd-mm-yyyy


                    const result = await Models.event.aggregate([
                        {
                            $match: {
                                start_date: {
                                    $gte: formattedCurrentDate,
                                    $lte: formattedSevenDaysAgo
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "payment_details",
                                localField: "event_id",
                                foreignField: "event_id",
                                as: "userdata"
                            }
                        },
                        {
                            $unwind: {
                                path: "$userdata",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $group: {
                                _id: {
                                    event_id: "$event_id"

                                },
                                type: {
                                    $first: "$type"
                                },
                                name: {
                                    $first: "$name"
                                },
                                seat: {
                                    $first: "$seat"
                                },
                                image: {
                                    $first: "$image"
                                },
                                amount: {
                                    $first: "$amount"
                                },
                                description: {
                                    $first: "$description"
                                },
                                start_date: {
                                    $first: "$start_date"
                                },
                                end_date: {
                                    $first: "$end_date"
                                },
                                join_link: {
                                    $first: "$join_link"
                                },
                                address: {
                                    $first: "$address"
                                },
                                status: {
                                    $first: "$status"
                                },
                                created_by: {
                                    $first: "$created_by"
                                },
                                modified_by: {
                                    $first: "$modified_by"
                                },
                                deleted_by: {
                                    $first: "$deleted_by"
                                },
                                deleted_date: {
                                    $first: "$deleted_date"
                                },
                                createdAt: {
                                    $first: "$createdAt"
                                },
                                updatedAt: {
                                    $first: "$updatedAt"
                                },
                                __v: {
                                    $first: "$__v"
                                },
                                uniqueUserIds: {
                                    $addToSet: "$userdata.user_id"
                                }
                            }
                        }, {
                            $lookup: {
                                from: "users",
                                localField: "uniqueUserIds",
                                foreignField: "user_id",
                                as: "userDetails"
                            }
                        }, {
                            $project: {
                                _id: 0,
                                event_id: "$_id.event_id",
                                type: 1,
                                name: 1,
                                seat: 1,
                                image: 1,
                                amount: 1,
                                description: 1,
                                start_date: 1,
                                end_date: 1,
                                join_link: 1,
                                address: 1,
                                status: 1,
                                created_by: 1,
                                modified_by: 1,
                                deleted_by: 1,
                                deleted_date: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                __v: 1,
                                userdata: "$uniqueUserIds",
                                userDetails: 1
                            }
                        }
                    ]);
                    console.log(result, "resulrr");
                    if (result.length > 0) {
                        console.log('djsnd');
                        for (var i = 0; i < result.length; i++) {
                            
                            if (result[i]['userDetails'].length > 0) {
                                for (var j = 0; j < result[i]['userDetails'].length; j++) {
                                    console.log('cxcbxncbnx')
                                    const mailObj = new mail();
                                    console.log(mailObj, "inside mail");
                                    var template = tpl.fetch(__dirname + "/../../../system/template/event_reminder.tpl");

                                    template = template.replace("${EventName}", result[i]['name']);
                                    template = template.replace("${EventBookingID}", result[i]['event_booking_id']);
                                    template = template.replace("${EventDate}", result[i]['start_date']);
                                    template = template.replace("${EventType}", result[i]['type']);
                                    template = template.replace("${joiningLink}", result[i]['join_link']);
                                    template = template.replace("${RecipientName}", result[i]['userDetails'][j]['first_name']);
                                    
                                    console.log(result[i]['userDetails'][j]['email'], "enail")
                                    const mailResponse = await mailObj.sendMail({
                                            from: `${
                                            prjConfig.MAIL.SENDER_NAME
                                        } <${
                                            prjConfig.MAIL.SENDER_EMAIL
                                        }>`,
                                        to: result[i]['userDetails'][j]['email'],
                                        subject: `Event Reminder - Tajurba`,
                                        html: template
                                    });
                                }
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
}
module.exports = eventReminder;
