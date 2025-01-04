const Fs = require("fs");
const tpl = require('node-tpl');
const AWS = require('aws-sdk');
const path = require('path');
const mail = require('../../system/mailer/mail');
const prjConfig = require("../../config.json");

const s3 = new AWS.S3({
  accessKeyId: prjConfig.AWS.AccessKey,
  secretAccessKey: prjConfig.AWS.SecretKey
});

const otpverification = async function (data) {
    try {
        var otpInfo = data;
        console.log(JSON.stringify(otpInfo),'otpinfo');
        const otpData = await Models.otp.findOne({ user_email:otpInfo.email, otp_action: otpInfo.otp_action }).exec();
        // Define the target date
       /* const targetDate = new Date(otpData?.createdAt);
        console.log(targetDate+'-->targetDate');
        // Calculate the time difference in milliseconds
        
        console.log(currentTime+'-->currenttime');
        const timeDifference = currentTime - targetDate;

        console.log(timeDifference, "timeDifference");*/


        const currentTime = new Date();
        const date1 = new Date(currentTime);
        const date2 = new Date(otpData?.createdAt);
    
        // Get time zone offset in minutes for IST (Indian Standard Time)
        const istOffset = 330; // IST is UTC+5:30
    
        // Calculate time difference in milliseconds
        const timeDifference = date1 - date2;
    
        // Convert time difference to minutes
        const timeDifferenceMinutes = timeDifference / (60 * 1000);
        console.log( timeDifferenceMinutes );
        // Calculate time difference in IST
//         const timeDifferenceIST = timeDifferenceMinutes + istOffset;
// console.log(timeDifferenceIST);



        // Check if the time difference is greater than or equal to 10 minutes (600,000 milliseconds)
        if (timeDifferenceMinutes > 10) {
            const result = await Models.otp.deleteOne({ _id: otpData?._id }).exec();
            var resp = {
                status: 0,
                result: STATUS.ERROR,
                message: "Please regenerate otp your otp session is expired.",
            }
            data.response = { resp };
            return data;
        } else {
            if (otpData === null) {
                var resp = {
                    result: 'STATUS.ERROR',
                    status: USER_STATUS.IN_ACTIVE,
                    message: "OTP not valid",
                }
                data.response = { resp };
                return data;
            } else {
                if (otpData && otpData?.otp_action === "Consumer Register") {
                    if (otpData?.otp === otpInfo?.otp && otpInfo?.usertype_in == 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (otpData && otpData?.otp_action === "Consumer Login") {
                    if (otpData?.otp === otpInfo?.otp && otpInfo?.usertype_in == 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (otpData && otpData?.otp_action === "Admin Login") {
                    console.log(otpData, "otpData", otpData?.otp_action, "sds", otpData?.otp, "otpData?.otp", otpInfo?.otp)
                    if (otpData?.otp === otpInfo?.otp && otpInfo?.usertype_in == 1) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (otpData && otpData?.otp_action === "Admin forgot otp") {
                    if (otpData?.otp === otpInfo?.otp && otpInfo?.usertype_in == 1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    var resp = {
                        result: STATUS.ERROR,
                        status: USER_STATUS.IN_ACTIVE,
                        message: "User Does Not Exist"
                    }
                    data.response = { resp };
                    return data;
                    
                }
            }
        }
    } catch (err) {
        console.log("create User", err);
        // Handle the error and send an appropriate response
        // ...
        var resp = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: err
        }
        data.response = { resp };
        return data;
    }
};

const refreshToken = async function(data) {
    console.log(data.refreshToken);
    let secretKey = prjConfig.secret;
    console.log(secretKey)
}

const addQuestionnaire = async function (data) {
    const category = data;
   // console.log((category.data[0]))
    const mappedArray = await Promise.all(category.data.map(async (item) => {
        const existingCategory = await Models.category.findOne({ category_name: "PERSONAL FINANCE" });
        console.log(JSON.stringify(item)+'questions')
         if (existingCategory) {
            var quesInfo = {
                category_id: existingCategory.category_id,
                questions: item.questions,
                sequenceNumber:item.sequenceNumber
            };
            let newQuestion = new Models.questionnaire(quesInfo);
            try {
                const saveQuestions = await newQuestion.save();
                console.log(saveQuestions);
                return saveQuestions; // or whatever you want to return
            } catch (error) {
                console.error('Error saving saveQuestions:', error);
                return null; // or handle the error in a way that makes sense for your application
            }
        }
    }));
}

const otp_send = async function (input_data, otp) {
    var otp_data = await Models.otp.findOne({user_email: input_data.email}).exec()
    if (otp_data == null) {
        var otp_record = await new Models.otp({
            otp: otp,
            otp_action: input_data?.otp_action,
            user_email: input_data?.email
        }).save();
    }else{
        var otp_record = await Models.otp.findOneAndUpdate(
          { _id: new ObjectId(otp_data._id) },
          { $set: {
                    otp: otp,
                    otp_action: input_data?.otp_action
                  }
          },
          { new: true });
      }

    return otp_record;
}

const file_upload = async function (data) {
  try {

    var uploaded_data = await s3.upload({
        Bucket: prjConfig.AWS.BucketName,
        Key: data.body.docType + "/" +  Date.now() + "_" + data.files.file.name,
        Body: data.files.file.data,
        ContentType: data.files.file.mimetype
    }).promise();

    if (uploaded_data !== null) {
      data.response = {
        status: 200,
        return: STATUS.SUCCESS,
        data: uploaded_data,
        message: "Data saved."
      }
      return data;
    }else{
      data.response = {
        status: 0,
        return: STATUS.ERROR,
        message: "Something is wrong."
      }
      return data;
    }
  } catch(error) {
    data.response = {
      status: 0,
      return: STATUS.ERROR,
      message: "Something is wrong.",
      error: error
    }
    return data;
  }
}

const payment_details_store = async (data) => {
  try {

    userLogger.info(__filename, 'payment_details_store request ---->  ,' + data);

    var header = data.headers
    var record = data.body.payload.payment.entity

    let log_up = await Models.payment_detail_log.findOneAndUpdate(
            { razorpay_order_id: record.order_id },
            { $set: {
                       razorpay_payment_id: record.id,
                       razorpay_payment_res: record
                    }
            },
            { new: true });

    let saved_data = await new Models.payment_detail({
        paid_amount: record?.amount/100,
        payment_method: record?.method,
        razorpay_payment_id: record?.id,
        razorpay_payment_status: "authorized",
        razorpay_payment_response: record
    }).save();

    data.response = data

    userLogger.info(__filename, 'payment_details_store response ---->  ,' + data);

    return data;

  } catch (error) {

      userLogger.info(__filename, 'payment_details_store catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const badge_allocation = async (data) => {
  try {
    let user_data = await Models.user.findOne({user_id: data.user_id}).exec()
    let post_data = await Models.post.find({user_id: data.user_id}).exec()
    let connect_data = await Models.connect.find({user_id: data.user_id}).exec()
    let certificate_data = await Models.certificate.find({user_id: data.user_id}).exec()
    var badge_cpp_data = await Models.badge_cpp.findOne({user_id: data.user_id}).exec()


    var cpp = user_data.pr_percentage
    var post_count = post_data.length - (badge_cpp_data == null ? 0 : badge_cpp_data.post_count_used)
    var connect_count = connect_data.length - (badge_cpp_data == null ? 0 : badge_cpp_data.connect_count_used)
    var certificate_count = certificate_data.length - (badge_cpp_data == null ? 0 : badge_cpp_data.certificate_count_used)
    var is_subscribe = user_data.is_subscribe

    var record;
    var badge_object = {
        user_id: user_data.user_id,
        badge: "",
        badge_type: "",
        is_subscribe: user_data.is_subscribe
    }

    if (badge_cpp_data !== null && badge_cpp_data.cpp !== null && badge_cpp_data.cpp == 100) {
        cpp = 100
        var new_object = {
            cpp: cpp,
            user_id: data.user_id,
            post_count_used: post_count >= 10 ? badge_cpp_data.post_count_used + 10:badge_cpp_data.post_count_used,
            connect_count_used: connect_count >= 10 ? badge_cpp_data.connect_count_used + 10:badge_cpp_data.connect_count_used,
            certificate_count_used: certificate_count >= 10 ? badge_cpp_data.certificate_count_used + 10:badge_cpp_data.certificate_count_used,
        }
    }else{
        var new_object = {
            cpp: cpp,
            user_id: data.user_id,
            post_count_used: post_count < 10 ? 0:10,
            connect_count_used: connect_count < 10 ? 0:10,
            certificate_count_used: certificate_count < 10 ? 0:10
        }
    }

    console.log(" cpp                -------->  ", cpp)
    console.log(" post_count         -------->  ", post_count)
    console.log(" connect_count      -------->  ", connect_count)
    console.log(" certificate_count  -------->  ", certificate_count)
    console.log(" ")

    if (cpp == 100 && post_count >= 10 && connect_count >= 10 && certificate_count >= 5) {

      if (is_subscribe == true) {
        console.log("         ------->  1 True  Gold")
        badge_object.badge = prjConfig.Badge.golden_badge
        badge_object.badge_type = "Gold"
        record = await Models.activity_badge(badge_object).save();
      }

      if (is_subscribe == false) {
        console.log("         ------->  1 False  Silver")
        badge_object.badge = prjConfig.Badge.silver_badge
        badge_object.badge_type = "Silver"
        record = await Models.activity_badge(badge_object).save();
      }
    } else if ((cpp == 100 && post_count >= 10 && connect_count >= 10) || (cpp == 100 && post_count >= 10 && certificate_count >= 5) || (cpp == 100 && connect_count >= 10 && certificate_count >= 5) || (post_count >= 10 && connect_count >= 10 && certificate_count >= 5)) {

      if (is_subscribe == true) {
        console.log("         ------->  2 True  Gold")
        badge_object.badge = prjConfig.Badge.golden_badge
        badge_object.badge_type = "Gold"
        record = await Models.activity_badge(badge_object).save();
      }

      if (is_subscribe == false) {
        console.log("         ------->  2 False  Silver")
        badge_object.badge = prjConfig.Badge.silver_badge
        badge_object.badge_type = "Silver"
        record = await Models.activity_badge(badge_object).save();
      }
    } else if ((cpp == 100 && post_count >= 10) || (cpp == 100 && connect_count >= 10) || (cpp == 100 && certificate_count >= 5) || (post_count >= 10 && connect_count >= 10) || (post_count >= 10 && certificate_count >= 5) || (connect_count >= 10 && certificate_count >= 5)) {
      console.log("         ------->  3  Silver")
      badge_object.badge = prjConfig.Badge.silver_badge
      badge_object.badge_type = "Silver"
      record = await Models.activity_badge(badge_object).save();
    } else if (cpp == 100 || post_count >= 10 || connect_count >= 10 || certificate_count >= 5) {

      if (badge_cpp_data !== null && badge_cpp_data.cpp !== null && badge_cpp_data.cpp == 100) {
        return 0;
      }
      console.log("         ------->  4  Brown")
      badge_object.badge = prjConfig.Badge.brown_badge
      badge_object.badge_type = "Brown"
      record = await Models.activity_badge(badge_object).save();
    }

    if (badge_cpp_data == null) {
        var saved_record = await new Models.badge_cpp(new_object).save()
    }else{
        var saved_record = await Models.badge_cpp.findOneAndUpdate(
            { badge_cpp_id: badge_cpp_data.badge_cpp_id },
            { $set: new_object },
            { new: true });
    }

    return record;
  } catch (error) {
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

async function formatDate (date)  {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

async function formatDateToISOString(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  // const hours = String(date.getHours()).padStart(2, '0');
  // const minutes = String(date.getMinutes()).padStart(2, '0');
  // const seconds = String(date.getSeconds()).padStart(2, '0');
  // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  const hours = '00';
  const minutes = '00';
  const seconds = '01';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

module.exports = {
    otpverification,
    addQuestionnaire,
    refreshToken,
    otp_send,
    file_upload,
    payment_details_store,
    badge_allocation,
    formatDate,
    formatDateToISOString
}
