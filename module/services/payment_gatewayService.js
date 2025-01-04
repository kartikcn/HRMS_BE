const Razorpay = require("razorpay");
const shortid = require("shortid");
const crypto = require("crypto");
const prjConfig = require("../../config.json");
const invoice = require("../services/invoiceService")
const transaction_filter = require("../services/filterService")

const razorpay = new Razorpay({
  key_id: prjConfig.payment_gateway.key_id,
  key_secret: prjConfig.payment_gateway.key_secret,
});


const create = async (data, authData) => {
  try {

    userLogger.info(__filename, 'Payment_gateway create process request ---->  ,' + data);

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    const payment_capture = prjConfig.payment_gateway.payment_capture;
    const amount = data.amount * 100;
    const currency = data.currency;
    const options = {
      amount,
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    const response = await razorpay.orders.create(options);

    const log_data = await Models.payment_detail_log.create({
        razorpay_order_id: response?.id,
        user_id: data?.user_id
    });

    data.response = response

    userLogger.info(__filename, 'Payment_gateway create process response ---->  ,' + data);
    return data;

  } catch (error) {

      userLogger.info(__filename, 'Payment_gateway create catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const update = async (data, authData) => {
  try {

    userLogger.info(__filename, 'Payment_gateway update request ---->  ,' + data);

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }
    console.log("data  update  --------------->  ", data)

    var courseedition_id = data.courseedition_id

    delete data["action"]
    delete data["command"]
    delete data["courseedition_id"]

    if (data.apple_data !== undefined && data.apple_data !== null) {
      console.log("              ------------>   Present apple_data")
      data.razorpay_payment_status = "authorized"
      var record = await Models.payment_detail(data).save();

      var log_up = await Models.payment_detail_log({
          type: data.type,
          amount: data.paid_amount,
          razorpay_payment_id: record.razorpay_payment_id,
          user_id: data.user_id,
          apple_data: data.apple_data
      }).save();
    }else{
      console.log("              ------------>   Absent  apple_data")
      var log_up = await Models.payment_detail_log.findOneAndUpdate(
            { razorpay_order_id: data.razorpay_order_id },
            { $set: {
                        type: data.type,
                        amount: data.paid_amount,
                        razorpay_payment_id: data.razorpay_payment_id,
                        user_id: data.user_id
                    }
            },
            { new: true });

      var record = await Models.payment_detail.findOneAndUpdate(
            { razorpay_payment_id: data.razorpay_payment_id },
            { $set: data },
            { new: true });
    }

    if (data.type == "Course") {
      var community_data = await Models.community.findOne({course_id: courseedition_id}).exec()

      let community_purchased = await new Models.user_purchase_community({
          paid_amount: data.paid_amount,
          user_id: data.user_id,
          course_id: data.course_id,
          courseedition_id: courseedition_id,
          community_id: community_data.community_id,
          payment_detail_id: record._id
      }).save()
    }


    if (data.type == "Subscription") {
      let up_user = await Models.user.findOneAndUpdate(
            { user_id: data.user_id },
            { $set: {is_subscribe: true} },
            { new: true });
    }

    let invoice_send = await invoice.create(record);

    console.log("invoice_send    ---------->  ", invoice_send)

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data updated.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something went wrong.",
      }
    }

    userLogger.info(__filename, 'Payment_gateway update response ---->  ,' + data);
    return data;

  } catch (error) {
      console.log("error          ------------>  ", error)
      userLogger.info(__filename, 'Payment_gateway update catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const transaction_list = async (data, authData) => {
  try {
    userLogger.info(__filename, 'transaction_list request ---->  ,' + data);

    if (Object.keys(data.filter).length !== 0) {
      console.log("data filter    --------->  ", data.filter)
      let record = await transaction_filter.transaction_filter(data, authData);
      return record;
    }

    const decoded = Auth.decodeToken(authData);
    if (decoded?.usertype_in === false || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    var limit = data.limit
    var createdAt = data.createdAt
    var skip = data.limit*(data.page_no-1)
    delete data["action"]
    delete data["command"]
    delete data["limit"]
    delete data["page_no"]
    delete data["createdAt"]
    delete data["filter"]
    delete data["flag"]

    data.user_id = {
      '$ne': null
    }

    const record = await Models.payment_detail.aggregate([
      {
        '$match': data
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'user_id',
          'foreignField': 'user_id',
          'as': 'user_data'
        }
      },{
          '$unwind': {
              'path': "$user_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'course_id',
          'foreignField': 'course_id',
          'as': 'course_data'
        }
      },{
          '$unwind': {
              'path': "$course_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'subscriptions',
          'localField': "subscription_id",
          'foreignField': "_id",
          'as': 'subscription_data'
        }
      },{
          '$unwind': {
              'path': "$subscription_data",
              'preserveNullAndEmptyArrays': true
          }
      },
      {
        '$lookup': {
          'from': "events",
          'localField': "event_id",
          'foreignField': "event_id",
          'as': "event_data",
        },
      },
      {
        '$unwind': {
          'path': "$event_data",
          'preserveNullAndEmptyArrays': true,
        },
      },  
      {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$skip': skip
      }, {
        '$limit': limit
      }, {
          '$project': {
              '_id': 1,
              'courseedition_id': 1,
              'course_name': '$course_data.course_title',
              'user_name':'$user_data.first_name',
              'paid_amount': {'$toString': '$paid_amount'},
              'name':'$subscription_data.name',
              'description':'$subscription_data.description',
              'createdAt': 1,
              'invoice_no': 1,
              'type': 1,
              'event_name':"$event_data.name"
          }
      }
    ]);

    var total = await Models.payment_detail.aggregate([
      {
        '$match': data
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'user_id',
          'foreignField': 'user_id',
          'as': 'user_data'
        }
      },{
          '$unwind': {
              'path': "$user_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'course_id',
          'foreignField': 'course_id',
          'as': 'course_data'
        }
      },{
          '$unwind': {
              'path': "$course_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'subscriptions',
          'localField': "subscription_id",
          'foreignField': "_id",
          'as': 'subscription_data'
        }
      },{
          '$unwind': {
              'path': "$subscription_data",
              'preserveNullAndEmptyArrays': true
          }
      },
      {
        '$lookup': {
          'from': "events",
          'localField': "event_id",
          'foreignField': "event_id",
          'as': "event_data",
        },
      },
      {
        '$unwind': {
          'path': "$event_data",
          'preserveNullAndEmptyArrays': true,
        },
      }, 
      {
        '$sort': {
          'createdAt': -1
        }
      }, {
          '$project': {
              '_id': 1,
              'courseedition_id': 1,
              'course_name': '$course_data.course_title',
              'user_name':'$user_data.first_name',
              'paid_amount': 1,
              'name':'$subscription_data.name',
              'description':'$subscription_data.description',
              'createdAt': 1,
              'invoice_no': 1,
              'type': 1,
              'event_name':"$event_data.name"
          }
      }
    ]);

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data updated.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something went wrong.",
      }
    }
    userLogger.info(__filename, 'transaction_list response ---->  ,' + data);
    return data;
  } catch (error) {
      console.log("error          ------------>  ", error)
      userLogger.info(__filename, 'transaction_list catch block ---->  ,' + error);
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const event_payment_update = async (data, authData) => {
  try {

    userLogger.info(__filename, 'Payment_gateway update request ---->  ,' + data);

    const decoded = Auth.decodeToken(authData);
    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    delete data["action"]
    delete data["command"]

    let user_register_event_data = await Models.user_register_event.find({event_id: data.event_id}).exec()
    var serial_no = user_register_event_data.length + 1
    var paddedNumber = String(serial_no).padStart(5, '0');
    var event_booking_id = "TAJ/" + data.event_id + "/" + paddedNumber
    data.event_booking_id = event_booking_id


    if (data.apple_data !== undefined && data.apple_data !== null) {
      console.log("              ------------>   Present apple_data")
      data.razorpay_payment_status = "authorized"
      var record = await Models.payment_detail(data).save();

      var log_up = await Models.payment_detail_log({
          type: data.type,
          amount: data.paid_amount,
          razorpay_payment_id: record.razorpay_payment_id,
          user_id: data.user_id,
          apple_data: data.apple_data
      }).save();
    }else{
      console.log("              ------------>   Absent  apple_data")
      let log_up = await Models.payment_detail_log.findOneAndUpdate(
            { razorpay_order_id: data.razorpay_order_id },
            { $set: {
                        type: data.type,
                        amount: data.paid_amount,
                        razorpay_payment_id: data.razorpay_payment_id,
                        user_id: data.user_id
                    }
            },
            { new: true });

      let record = await Models.payment_detail.findOneAndUpdate(
            { razorpay_payment_id: data.razorpay_payment_id },
            { $set: data },
            { new: true });
    }

    let user_registered = await new Models.user_register_event({
        paid_amount: data.paid_amount,
        user_id: data.user_id,
        event_id: data.event_id,
        event_booking_id: event_booking_id,
        payment_detail_id: record._id
    }).save()

    let invoice_send = await invoice.event_invoice_create(record);

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data updated.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something went wrong.",
      }
    }

    userLogger.info(__filename, 'Payment_gateway update response ---->  ,' + data);
    return data;

  } catch (error) {
      console.log("error          ------------>  ", error)
      userLogger.info(__filename, 'Payment_gateway update catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const community_payment_update = async (data, authData) => {
  try {

    userLogger.info(__filename, 'Payment_gateway update request ---->  ,' + data);

    const decoded = Auth.decodeToken(authData);
    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    delete data["action"]
    delete data["command"]

    let log_up = await Models.payment_detail_log.findOneAndUpdate(
            { razorpay_order_id: data.razorpay_order_id },
            { $set: {
                        type: data.type,
                        amount: data.paid_amount,
                        razorpay_payment_id: data.razorpay_payment_id,
                        user_id: data.user_id
                    }
            },
            { new: true });

    let record = await Models.payment_detail.findOneAndUpdate(
            { razorpay_payment_id: data.razorpay_payment_id },
            { $set: data },
            { new: true });

    let community_purchased = await new Models.user_purchase_community({
        paid_amount: data.paid_amount,
        user_id: data.user_id,
        community_id: data.community_id,
        payment_detail_id: record._id
    }).save()

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data updated.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something went wrong.",
      }
    }

    userLogger.info(__filename, 'Payment_gateway update response ---->  ,' + data);
    return data;

  } catch (error) {
      console.log("error          ------------>  ", error)
      userLogger.info(__filename, 'Payment_gateway update catch block ---->  ,' + error);

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
    update,
    transaction_list,
    event_payment_update,
    community_payment_update,
};
