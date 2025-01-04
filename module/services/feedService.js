const commonFunction = require("../services/commonFunctions");

const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var saved_data = await new Models.post(data).save()

    var badge_data = await commonFunction.badge_allocation({
        user_id: saved_data.user_id
    })

    if (saved_data !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Data stored successfully.",
      }
    }else{
      data.response = {
          status: 200,
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

const post_list = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    var limit = data.limit
    var skip = data.limit*(data.page_no-1)
    var filter = data.filter

    if (filter !== null && filter.user_id !== undefined) {
      var matchData = {
        'is_deleted': false,
        'user_id': filter.user_id
      }
    }else{
      var matchData = {
        'is_deleted': false,
        '$or': [
          { 'shared_by_user_id': null },
          {
            '$and': [
              {
                'user_id': data.user_id
              },
              {
                'shared_by_user_id': {
                  '$ne': null
                }
              }
            ]
          }
        ]
      }
    }

    delete data["action"]
    delete data["command"]

    var record = await Models.post.aggregate([
      {
        '$match': matchData
      },
      {
        '$sort': {
          'createdAt': -1
        }
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
          'from': 'likes', 
          'localField': 'post_id', 
          'foreignField': 'post_id', 
          'as': 'post_like_data'
        }
      },
      {
        '$lookup': {
          'from': 'comments', 
          'localField': 'post_id', 
          'foreignField': 'post_id', 
          'as': 'post_comment_data'
        }
      },
      {
        '$addFields': {
          'like_count': {
            '$size': '$post_like_data'
          }
        }
      },
      {
        '$addFields': {
          'comment_count': {
            '$size': '$post_comment_data'
          }
        }
      },
      {
        '$lookup': {
          'as': 'post_user_like',
          'from': 'likes',
          'let':{'post_id':'$post_id', 'user_id': data.user_id},
          'pipeline':[
            {
              '$match':{
                  '$and':[
                    {'$expr':{'$eq':['$post_id','$$post_id']}},
                    {'$expr':{'$eq':['$user_id','$$user_id']}}
                  ]
              }
            }
          ]
        }
      },
      {
        '$unwind': {
            'path': "$user_data",
            'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
            'path': "$post_user_like",
            'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'shared_by_user_id', 
          'foreignField': 'user_id', 
          'as': 'shared_by_user_data'
        }
      },
      {
        '$unwind': {
          'path': '$shared_by_user_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      }
    ]);

    for (var i = 0; i < record.length; i++) {

      if (record[i].post_user_like == undefined || record[i].post_user_like.like_status == undefined || record[i].post_user_like.like_status == false) {
        record[i].post_user_like = false
      }else{
        record[i].post_user_like = true
      }

      if (record[i].repost_id !== undefined && record[i].repost_id !== null) {
        record[i].repost_data = {}

        var repost_data = await Models.post.findOne({post_id: record[i].repost_id}).exec()
        var user_data = await Models.user.findOne({user_id: repost_data.user_id}).exec()

        var repost_data = {
          repost_data: repost_data,
          user_data: user_data,
          message: repost_data?.is_deleted == true ? "This post is deleted by owner.": null
        }
        record[i].repost_data = repost_data
      }else{
        record[i].repost_data = null
      }
    }

    var total = await Models.post.aggregate([
      {
        '$match': matchData
      },
      {
        '$sort': {
          'createdAt': -1
        }
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      },
    ]);

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
          status: 0,
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

const add_likes = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);
    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]
    var saved_data= null;

    var record = await Models.like.findOne({post_id: data.post_id, user_id: data.user_id}).exec()

    if (record == null) {
      saved_data = await Models.like(data).save()
    }else{
      const result = await Models.like.deleteOne({ _id: record._id }).exec();
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: {
            post_like_data: []
          },
          message: "Data stored successfully.",
      }
      return data;
    }

    if (saved_data !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Data stored successfully.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Already liked this post.",
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

const add_comment = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var saved_data = await Models.comment(data).save()

    if (saved_data !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Data stored successfully.",
      }
    }else{
      data.response = {
          status: 200,
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

const comment_list = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    var limit = data.limit
    var skip = data.limit*(data.page_no-1)

    delete data["action"]
    delete data["command"]
    delete data["page_no"]
    delete data["limit"]

    var record = await Models.comment.aggregate([
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

    var total = await Models.comment.aggregate([
      {
        '$match': data
      }
    ]);

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
          status: 0,
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

const view_profile = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var record = await Models.user.aggregate([
      {
        '$match': data
      },
      {
        '$lookup': {
          'from': 'certificates', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'certificates_data'
        }
      },
      {
        '$addFields': {
          'certificate_count': {
            '$size': '$certificates_data'
          }
        }
      },
      {
        '$lookup': {
          'from': 'activity_badges', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'badge_data'
        }
      },
      {
        '$addFields': {
          'badge_count': {
            '$size': '$badge_data'
          }
        }
      },
      {
        '$lookup': {
          'from': 'posts', 
          'localField': 'user_id', 
          'foreignField': 'user_id', 
          'as': 'post_data'
        }
      }
    ]);

    var post_data = record[0].post_data

    var post_images = []

    for (let record of post_data) {
      if (record.is_deleted !== undefined && record.is_deleted !== true) {
        if (record.repost_id !== null) {
          let repost_data = await Models.post.findOne({post_id: record.repost_id}).exec()
          post_images = post_images.concat(repost_data?.images)
        }else{
          post_images = post_images.concat(record?.images)
        }
      }
    }

    record[0].post_images = post_images

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
          status: 0,
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

const add_report_post = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var saved_data = await Models.report_post(data).save()

    if (saved_data !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Data stored successfully.",
      }
    }else{
      data.response = {
          status: 200,
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

const get_repost_details = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var record = await Models.post.aggregate([
      {
        '$match': {
          'post_id': data.repost_id
        }
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
        '$unwind': {
            'path': "$user_data",
            'preserveNullAndEmptyArrays': true
        }
      },
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record[0],
        message: "Data found.",
      }
    }else{
      data.response = {
          status: 0,
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

const connect_user = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    let record = await Models.connect.findOne(data).exec()

    if (record !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Already connected to this user.",
      }

      return data;
    }

    var final_arr = []
    var user_id_1 = data.user_id
    var user_id_2 = data.c_user_id

    var chat_value = await generateRandomString(6);

    var input_1 = {
      user_id: user_id_1,
      c_user_id: user_id_2,
      chat_value: chat_value
    }

    var input_2 = {
      user_id: user_id_2,
      c_user_id: user_id_1,
      chat_value: chat_value 
    }

    var saved_data_1 = await Models.connect(input_1).save()
    var saved_data_2 = await Models.connect(input_2).save()

    final_arr.push(saved_data_1)
    final_arr.push(saved_data_2)

    var badge_data = await commonFunction.badge_allocation({
        user_id: data.user_id
    })

    if (final_arr.length !== 0) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: final_arr,
          message: "Data stored successfully.",
      }
    }else{
      data.response = {
          status: 200,
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

const connect_user_list = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    var limit = data.limit
    var skip = data.limit*(data.page_no-1)
    var filter = data.filter

    delete data["action"]
    delete data["command"]
    delete data["page_no"]
    delete data["limit"]
    delete data["filter"]

    if (Object.keys(filter).length !== 0) {
      filter.user_name = {
          '$regex': new RegExp(filter.user_name),
          '$options': 'i'
      }
    }

    var record = await Models.connect.aggregate([
      {
        '$match': data
      },
      {
        '$sort': {
          'createdAt': -1
        }
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'c_user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      },
      {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$project': {
          'user_id': 1, 
          'c_user_id': 1, 
          'chat_value': 1, 
          'connected': 1, 
          'is_deleted': 1, 
          'createdAt': 1, 
          'updatedAt': 1, 
          'connect_id': 1, 
          'user_name': '$user_data.first_name', 
          'user_email': '$user_data.email', 
          'user_prof_role': '$user_data.user_prof_role', 
          'user_data': 1
        }
      },
      {
        '$match': filter
      },
      {
        '$skip': skip
      },
      {
        '$limit': limit
      }
    ]);

    var total = await Models.connect.aggregate([
      {
        '$match': data
      },
      {
        '$sort': {
          'createdAt': -1
        }
      },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'c_user_id', 
          'foreignField': 'user_id', 
          'as': 'user_data'
        }
      },
      {
        '$unwind': {
          'path': '$user_data', 
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$project': {
          'user_id': 1, 
          'c_user_id': 1, 
          'chat_value': 1, 
          'connected': 1, 
          'is_deleted': 1, 
          'createdAt': 1, 
          'updatedAt': 1, 
          'connect_id': 1, 
          'user_name': {
            '$concat': [
              '$user_data.first_name', ' ', '$user_data.last_name'
            ]
          }, 
          'user_email': '$user_data.email', 
          'user_prof_role': '$user_data.user_prof_role', 
          'user_data': 1
        }
      },
      {
        '$match': filter
      }
    ]);

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
          status: 0,
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

const send_message_to_user = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var saved_data = await Models.post(data).save()

    if (saved_data !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Data stored successfully.",
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

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }
    return randomString;
}

const user_list_for_admin = async function (data, authData) {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded.usertype_in == false || decoded.is_active == false || decoded.deleted_date !== null) {
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Invalid user!"
            }
            return data;
        }

        let skip = data.limit * (data.page_no - 1)
        let limit = data.limit
        let filter = data.filter

        delete data["action"]
        delete data["command"]
        delete data["filter"]
        delete data["page_no"]
        delete data["limit"]

        if (filter.first_name !== undefined) {
            filter.first_name = {
                '$regex': new RegExp(filter.first_name),
                '$options': 'i'
            }
        }

        if (filter.email !== undefined) {
            filter.email = {
                '$regex': new RegExp(filter.email),
                '$options': 'i'
            }
        }

        if (filter.subcription !== undefined) {
            filter.subcription = {
                '$regex': new RegExp(filter.subcription),
                '$options': 'i'
            }
        }

        if (filter.city !== undefined) {
            filter.city = {
                '$regex': new RegExp(filter.city),
                '$options': 'i'
            }
        }

        if (filter.all !== undefined) {

            filter =  {
              '$or': [
                {
                  'first_name': {
                      '$regex': new RegExp(filter.all),
                      '$options': 'i'
                  }
                },
                {
                  'email': {
                      '$regex': new RegExp(filter.all),
                      '$options': 'i'
                  }
                },
                {
                  'subcription': {
                      '$regex': new RegExp(filter.all),
                      '$options': 'i'
                  }
                },
                {
                  'city': {
                      '$regex': new RegExp(filter.all),
                      '$options': 'i'
                  }
                }
              ]
            }
        }

        var user_list = await Models.post.aggregate([
          {
            '$match': {
              'is_deleted': false
            }
          },
          {
            '$group': {
              '_id': '$user_id', 
              'data': {
                '$push': '$$ROOT'
              }
            }
          },
          {
            '$addFields': {
              'user_id': '$_id'
            }
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
            '$unwind': {
              'path': '$user_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$project': {
              'first_name': '$user_data.first_name', 
              'email': '$user_data.email', 
              'is_subscribe': '$user_data.is_subscribe', 
              'subcription': {
                '$cond': {
                  'if': {
                    '$eq': ['$user_data.is_subscribe', true]
                  }, 
                  'then': 'Paid', 
                  'else': 'Unpaid'
                }
              }, 
              'createdAt': '$user_data.createdAt', 
              'city': '$user_data.city',
              'user_id': '$user_data.user_id'
            }
          },
          {
            '$sort': {
              'createdAt': -1
            }
          },
          {
            '$match': filter
          },
          {
            '$skip': skip
          },
          {
            '$limit': limit
          }
        ]).exec();

        var total = await Models.post.aggregate([
          {
            '$match': {
              'is_deleted': false
            }
          },
          {
            '$group': {
              '_id': '$user_id', 
              'data': {
                '$push': '$$ROOT'
              }
            }
          },
          {
            '$addFields': {
              'user_id': '$_id'
            }
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
            '$unwind': {
              'path': '$user_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$project': {
              'first_name': '$user_data.first_name', 
              'email': '$user_data.email', 
              'is_subscribe': '$user_data.is_subscribe', 
              'susbciption': {
                '$cond': {
                  'if': {
                    '$eq': [
                      '$is_subscribe', true
                    ]
                  }, 
                  'then': 'Paid', 
                  'else': 'Unpaid'
                }
              }, 
              'createdAt': '$user_data.createdAt', 
              'city': '$user_data.city'
            }
          },
          {
            '$sort': {
              'createdAt': -1
            }
          },
          {
            '$match': filter
          }
        ]).exec();

        let devident = total.length/limit
        let pages;

        if (devident > parseInt(devident)) {
          pages = parseInt(devident) + 1
        }else{
          pages = devident
        }

        if (user_list.length > 0) {
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                total_user: total.length,
                total_pages: pages,
                user_count: user_list.length,
                data: user_list,
                message: "Data found."
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
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
};

const view_user_post_admin = async function (data, authData) {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded.usertype_in == false || decoded.is_active == false || decoded.deleted_date !== null) {
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Invalid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        var user_data = await Models.user.aggregate([
          {
            '$match': data
          },
          {
            '$lookup': {
              'as': 'post_data',
              'from': 'posts',
              'let':{'user_id':'$user_id', 'is_deleted': false},
              'pipeline':[
                {
                  '$match':{
                      '$and':[
                        {'$expr':{'$eq':['$user_id','$$user_id']}},
                        {'$expr':{'$eq':['$is_deleted','$$is_deleted']}}
                      ]
                  }
                }
              ]
            }
          }
        ]).exec();

        if (user_data.length > 0) {
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: user_data[0],
                message: "Data found."
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
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
};

const delete_user_post_admin = async function (data, authData) {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded.is_active == false || decoded.deleted_date !== null) {
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Invalid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        let post_data = await Models.post.findOne({ post_id: data.post_id}).exec();

        if (post_data !== null) {
          let res_data = await Models.post.findOneAndUpdate(
                { post_id: data.post_id },
                { $set: {
                          is_deleted: data.is_deleted,
                        }
                },
                { new: true });

          data.response = {
              status: 200,
              result: STATUS.SUCCESS,
              data: res_data,
              message: "Post data deleted.",
          }
        }else{
          data.response = {
              status: 0,
              result: STATUS.ERROR,
              message: "Date not available.",
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
};

const user_account_delete = async function (data, authData) {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded.is_active == false || decoded.deleted_date !== null) {
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Invalid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        let user_data = await Models.user.findOne({ user_id: data.user_id}).exec();

        if (user_data !== null) {
          let res_data = await Models.user.findOneAndUpdate(
                { user_id: user_data.user_id },
                { $set: {
                          deleted_by: user_data._id,
                          deleted_date: new Date()
                        }
                },
                { new: true });

          data.response = {
              status: 200,
              result: STATUS.SUCCESS,
              data: res_data,
              message: "User account is deleted.",
          }
        }else{
          data.response = {
              status: 0,
              result: STATUS.ERROR,
              message: "Date not available.",
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
};

const check_connect_user = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);
    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    let record = await Models.connect.findOne(data).exec()

    if (record !== null) {
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Already connected to this user.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User id not connected.",
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
    post_list,
    add_likes,
    add_comment,
    comment_list,
    view_profile,
    add_report_post,
    get_repost_details,
    connect_user,
    connect_user_list,
    send_message_to_user,
    user_list_for_admin,
    view_user_post_admin,
    delete_user_post_admin,
    user_account_delete,
    check_connect_user,
};
