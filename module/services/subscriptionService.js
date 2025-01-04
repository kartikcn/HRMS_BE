
const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in == false || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }

    userLogger.info(__filename, 'Subscription create process request ---->  ,' + data);

    delete data["action"]
    delete data["command"]

    let record = await Models.subscription(data).save();

    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data saved."
      }
    }else{
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Something is wrong"
      }
    }

    userLogger.info(__filename, 'Subscription create process response ---->  ,' + data);

    return data;
  } catch (error) {

    userLogger.info(__filename, 'Subscription create catch block ---->  ,' + data);

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
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }

    let record = await Models.subscription.find({}).exec()

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found."
      }
    }else{
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found."
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

const get_list_mobile = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);
    if (decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }

    var final_arr = []

    var record = await Models.subscription.find({}).exec()

    var payment_data = await Models.payment_detail.aggregate([
      {
        '$match': {
          'user_id': data.user_id,
          'type': 'Subscription',
          'payment_status': 'active'
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }
    ]).exec();

    var subscription_ids = await payment_data.map(item => item.subscription_id.toString())

    for (var i = 0; i < record.length; i++) {
      if (subscription_ids.includes(record[i].id)) {
        var is_subscribe = true
      }else{
        var is_subscribe = false
      }

      if (subscription_ids[0] == record[i].id) {
        var user_subsc_active = true
      }else{
        var user_subsc_active = false
      }

      final_arr.push({
        _id: record[i]._id,
        name: record[i].name,
        description: record[i].description,
        image: record[i].image,
        payment_type: record[i].payment_type,
        button_name: record[i].button_name,
        amount: record[i].amount,
        subscription_type: record[i].subscription_type,
        is_deleted: record[i].is_delete,
        created_by: record[i].created_by,
        modified_by: record[i].modified_by,
        deleted_by: record[i].deleted_by,
        deletedAt: record[i].deletedAt,
        createdAt: record[i].createdAt,
        updatedAt: record[i].updatedAt,
        __v: record[i].__v,
        id: record[i].id,
        is_subscribe: is_subscribe,
        user_subsc_active: user_subsc_active
      })
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: final_arr,
        message: "Data found."
      }
    }else{
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found."
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
    get_list_mobile,
};
