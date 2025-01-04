const mail = require('../../system/mailer/mail');
const prjConfig = require("../../config.json");

const create = async (data) => {
  try {

    let record = await Models.faq.insertMany(data.data);

    if (record.length !== 0) {
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

    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    var record = await Models.faq.aggregate([
        {
          '$sort': {
            'createdAt': data.createdAt
          }
        }
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        count: record.length,
        data: record,
        message: "Data found.",
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

const contact_us = async (data, authData) => {
  try {

    let record = await Models.contact_us(data).save();

    let user_data = await Models.user.findOne({user_id: data.user_id}).exec()

    const mailObj = new mail();

    const mailResponse = await mailObj.sendMail({
        from: user_data.email,
        to: prjConfig.MAIL.SENDER_EMAIL,
        subject: `Contact us query from ` + user_data.first_name,
        html: "name : " + user_data.first_name + "<br><br> Email : " + user_data.email + "<br><br> Query : " + data.query
    });

    if (record !== null) {
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
    contact_us,
};
