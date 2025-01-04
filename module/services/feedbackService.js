const fs = require("fs");
const path = require('path');
const tpl = require('node-tpl');
const mail = require('../../system/mailer/mail');
const prjConfig = require("../../config.json");

const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    delete data["command"]
    delete data["action"]

    let record = await Models.feedback(data).save();

    if (record.feed_type == "feedback") {

      var user_data = await Models.user.findOne({user_id: record.user_id}).exec()
      var course_data = await Models.course.findOne({course_id: record.course_id}).exec()

      var tplContent = tpl.fetch(__dirname+"/../../system/template/course_feedback.tpl", "utf-8");
      tplContent = tplContent.replace("${user_name}", user_data.first_name);
      tplContent = tplContent.replace("${user_email}", user_data.email);
      tplContent = tplContent.replace("${user_feedback}", record.description);

      const mailObj = new mail();
      const mailResponse = await mailObj.sendMail({
          from: user_data.email,
          to: prjConfig.MAIL.USER,
          subject: `Feedback on ` + course_data.course_title,
          html: tplContent,
      });
      console.log("mailResponse    ------>  ", mailResponse)
    }

    if (record.length !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data stored.",
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        data: record,
        message: "Data not stored.",
      }
    }

    return data;
    
  } catch (error) {
    console.log("error        ----------->  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const get_list = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    var skip = data.limit*(data.page_no-1)
    var limit = data.limit

    delete data["action"]
    delete data["command"]
    delete data["page_no"]
    delete data["limit"]
    delete data["filter"]

    var record = await Models.feedback.aggregate([
      {
        '$match': data
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$lookup': {
          'from': 'courses', 
          'localField': 'course_id', 
          'foreignField': 'course_id', 
          'as': 'course_data'
        }
      }, {
        '$unwind': {
          'path': '$course_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      }, {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$skip': skip
      }, {
        '$limit': limit
      }
    ]);

    var total = await Models.feedback.aggregate([
      {
        '$match': data
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$lookup': {
          'from': 'courses', 
          'localField': 'course_id', 
          'foreignField': 'course_id', 
          'as': 'course_data'
        }
      }, {
        '$unwind': {
          'path': '$course_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      }, {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      }
    ]);

    var devident = total.length/limit
    var pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length !== 0) {
      data.response = {
          status: 200,
          total_data: total.length,
          total_pages: pages,
          data_count: record.length,
          data: record,
          message: "List fetched successfully"
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      }
    }

    return data;
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

const get_list_for_admin = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    delete data["action"]
    delete data["command"]
    delete data["page_no"]
    delete data["limit"]
    delete data["filter"]

    var support_record = await Models.feedback.aggregate([
      {
        '$match': {
          'course_id': data.course_id,
          'feed_type': 'support'
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$lookup': {
          'from': 'courses', 
          'localField': 'course_id', 
          'foreignField': 'course_id', 
          'as': 'course_data'
        }
      }, {
        '$unwind': {
          'path': '$course_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      }, {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      }
    ]);

    var feedback_record = await Models.feedback.aggregate([
      {
        '$match': {
          'course_id': data.course_id,
          'feed_type': 'feedback'
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$lookup': {
          'from': 'courses', 
          'localField': 'course_id', 
          'foreignField': 'course_id', 
          'as': 'course_data'
        }
      }, {
        '$unwind': {
          'path': '$course_data', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      }, {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      }
    ]);

    console.log("  support_record     -------->   ", support_record.length)
    console.log("  feedback_record     -------->   ", feedback_record.length)

    data.response = {
        status: 200,
        support_record: support_record,
        feedback_record: feedback_record,
        message: "List fetched successfully"
    }

    return data;
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

module.exports = {
    create,
    get_list,
    get_list_for_admin,
};
