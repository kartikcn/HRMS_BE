const mail = require('../../system/mailer/mail');
const prjConfig = require("../../config.json");
const tpl = require('node-tpl');

const create = async (data, authData) => {
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

    var record = await Models.event_feedback(data).save()
    var user_data = await Models.user.findOne({user_id: record.user_id}).exec()
    var event_data = await Models.event.findOne({event_id: record.event_id}).exec()

    var template = tpl.fetch(__dirname + "/../../system/template/event_feedback.tpl");

    template = template.replace("${UserName}", user_data?.first_name);
    template = template.replace("${UserEmail}", user_data?.email);
    template = template.replace("${EventName}", event_data?.name);
    template = template.replace("${Feedback}", data?.message);

    const mailObj = new mail();
    const mailResponse = await mailObj.sendMail({
        from: user_data.email,
        to: prjConfig.MAIL.USER,
        subject: `Event feedback from ` + user_data.first_name,
        html: template
    });

    if (record != null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Data stored successfully."
      }
    }else{
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not stored.",
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

    if (data.flag !== undefined) {
      delete data["flag"]
    }

    if (data.filter !== undefined) {
      delete data["filter"]
    }

    data.is_deleted = false

    var record = await Models.event_feedback.aggregate([
      {
        '$match': data
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      },
      {
        '$lookup': {
          'from': 'events', 
          'localField': 'event_id', 
          'foreignField': 'event_id', 
          'as': 'event_data'
        }
      },
      {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
          'path': '$event_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$sort': {
          'createdAt': -1
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      }
    ]);

    var total = await Models.event_feedback.aggregate([
      {
        '$match': data
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      },
      {
        '$lookup': {
          'from': 'events', 
          'localField': 'event_id', 
          'foreignField': 'event_id', 
          'as': 'event_data'
        }
      },
      {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
          'path': '$event_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$sort': {
          'createdAt': -1
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

const view_eventfeedback = async (data, authData) => {
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

    var record = await Models.event_feedback.findOne(data).exec()

    if (record !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
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

module.exports = {
    create,
    get_list,
    view_eventfeedback,
};
