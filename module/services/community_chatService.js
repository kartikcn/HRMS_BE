const io = require("../../notificationHandler");
const { sendPushNotification } = require("../../firebaseHandler");

const create = async (data, authData) => {
  try {

      const decoded = Auth.decodeToken(authData);
      if (decoded?.usertype_in == true || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
        data.response = {
          status: 0,
          message: "You are not valid user!"
        }
        return data;
      }

      delete data["action"]
      delete data["command"]

      var record;
      var user_data;
      var final_data;

      if (data.type == "media") {

        var media = data.media
        for (var i = 0; i < media.length; i++) {

            record = await Models.community_chat({
              type: data.type,
              user_id: data.user_id,
              community_id: data.community_id,
              media: media[i]
            }).save()

            user_data = await Models.user.findOne({user_id: record.user_id}).exec()
            final_data = {
              _id: record._id,
              type: record.type,
              media: record.media,
              message: record.message,
              user_id: record.user_id,
              activity_id: record.activity_id,
              community_id: record.community_id,
              is_deleted: record.is_deleted,
              createdAt: record.createdAt,
              updatedAt: record.updatedAt,
              community_chat_id: record.community_chat_id,
              user_data: user_data
            }
            io.emit('community_chat', {message: final_data})
        }
      }else{

        record = await Models.community_chat(data).save()
        user_data = await Models.user.findOne({user_id: record.user_id}).exec()
        final_data = {
          _id: record._id,
          type: record.type,
          media: record.media,
          message: record.message,
          user_id: record.user_id,
          activity_id: record.activity_id,
          community_id: record.community_id,
          is_deleted: record.is_deleted,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          community_chat_id: record.community_chat_id,
          user_data: user_data
        }
        io.emit('community_chat', {message: final_data})
      }

      let community_data = await Models.community.findOne({community_id: data.community_id}).exec()

      if (community_data.community_type == "Free") {
        var user_record = await Models.user.aggregate([
          {
            '$match': {
              'deleted_date': null, 
              'usertype_in': false,
              'device_token': {
                '$exists': true
              }
            }
          }, {
            '$project': {
              'device_token': 1
            }
          }
        ]);
      }else{

        let course_data = await Models.course.findOne({courseedition_id: community_data.course_id}).exec()
        var user_record = await Models.payment_detail.aggregate([
          {
            '$match': {
              'course_id': course_data.course_id
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
            '$project': {
              'deleted_date': '$user_data.deleted_date', 
              'usertype_in': '$user_data.usertype_in', 
              'device_token': '$user_data.device_token'
            }
          }, {
            '$match': {
              'deleted_date': null, 
              'usertype_in': false, 
              'device_token': {
                '$exists': true
              }
            }
          }, {
            '$project': {
              'device_token': 1
            }
          }
        ]);
      }

      for (var token_data of user_record) {
        if (token_data.device_token !== undefined && token_data.device_token !== null ) {
          console.log("token_data       ----------->   ", token_data.device_token)
          var title = "Community chat"
          var message = "New message recieved";
          var notif_token = token_data.device_token
          var notifyResponse = await sendPushNotification(message, notif_token, title);
        }
      }

      if (record !== null) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Message send successfully.."
        }
      } else {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Data not found."
        }
      }

      return data;
  } catch (error) {
    console.log("error          --------->   ", error)
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
      if (decoded?.usertype_in == true || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
          data.response = {
              status: 0,
              message: "You are not valid user!"
          }
          return data;
      }

      var skip = data.limit * (data.page_no - 1)
      var limit = data.limit

      delete data["action"]
      delete data["command"]
      delete data["page_no"]
      delete data["limit"]

      var record = await Models.community_chat.aggregate([
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
            'from': 'activities', 
            'localField': 'activity_id', 
            'foreignField': 'activity_id', 
            'as': 'activity_data'
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
            'path': '$activity_data', 
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

      var total = await Models.community_chat.aggregate([
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
            'from': 'activities', 
            'localField': 'activity_id', 
            'foreignField': 'activity_id', 
            'as': 'activity_data'
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
            'path': '$activity_data', 
            'preserveNullAndEmptyArrays': true
          }
        },
      ]);

      for (var i = 0; i < record.length; i++) {
        if (record[i].type !== "text" && record[i].type !== "media") {

          let community_data = await Models.community.findOne({community_id: record[i].community_id}).exec()
          let course_data = await Models.course.findOne({courseedition_id: community_data.course_id}).exec()
          let cat_data = await Models.category.findOne({category_id: course_data.category_id}).exec()

          record[i].community_data = community_data
          record[i].course_data = course_data
          record[i].category_data = cat_data

          if (record[i].type == "Poll") {
            let activity_poll_user_data = await Models.activity_score_user.find({activity_id: record[i].activity_id, activity_type: record[i].type}).exec()
            let activity_poll_data = await Models.activity_poll.findOne({activity_id: record[i].activity_id}).exec()
            let option1_count = await Models.activity_score_user.find({activity_id: record[i].activity_id, poll_answer: activity_poll_data.option1}).exec()
            let option2_count = await Models.activity_score_user.find({activity_id: record[i].activity_id, poll_answer: activity_poll_data.option2}).exec()
            record[i].activity_poll_user_data = activity_poll_user_data
            record[i].activity_poll_data = activity_poll_data
            record[i].option1_count = option1_count.length
            record[i].option2_count = option2_count.length
          }

          if (record[i].type == "Quest") {
            let activity_quest_user_data = await Models.activity_score_user.find({activity_id: record[i].activity_id, activity_type: record[i].type}).exec()
            var quest_answer_data = []
            for (var j = 0; j < activity_quest_user_data.length; j++) {
              let user_data_1 = await Models.user.findOne({user_id: activity_quest_user_data[j].user_id}).exec()
              activity_quest_user_data[j].user_data = user_data_1
              quest_answer_data.push({
                name: user_data_1.first_name,
                image: user_data_1.image,
                createdAt:  activity_quest_user_data[j].createdAt,
                quest_image: activity_quest_user_data[j].quest_image,
              })
            }
            record[i].quest_answer_data = quest_answer_data
          }

          if (record[i].type == "Challenge") {
            let activity_challenge_user_data = await Models.activity_score_user.find({activity_id: record[i].activity_id, activity_type: record[i].type}).exec()
            var challenge_answer_data = []

            for (var j = 0; j < activity_challenge_user_data.length; j++) {
              let user_data_1 = await Models.user.findOne({user_id: activity_challenge_user_data[j].user_id}).exec()
              user_data_1.challenge_earn_score = activity_challenge_user_data[j].challenge_earn_score
              user_data_1.challenge_total_score = activity_challenge_user_data[j].challenge_total_score
              challenge_answer_data.push({
                name: user_data_1.first_name,
                image: user_data_1.image,
                createdAt:  activity_challenge_user_data[j].createdAt,
                challenge_earn_score: activity_challenge_user_data[j].challenge_earn_score,
                challenge_total_score: activity_challenge_user_data[j].challenge_total_score
              })
            }
            record[i].challenge_answer_data = challenge_answer_data
          }
        }

        if (record[i].reply_community_chat_id !== undefined && record[i].reply_community_chat_id !== null) {
          var reply_chat_data = await Models.community_chat.findOne({community_chat_id: record[i].reply_community_chat_id}).exec()
          var reply_user_data = await Models.user.findOne({user_id: reply_chat_data.user_id}).exec()

          var reply_old_data = {
            type: reply_chat_data.type,
            media: reply_chat_data.media,
            message: reply_chat_data.message,
            createdAt: reply_chat_data.createdAt,
            user_name: reply_user_data.first_name,
            community_chat_id: reply_chat_data.community_chat_id
          }
        }else{
          reply_old_data = null
        }

        record[i].reply_old_data = reply_old_data
      }

      var devident = total.length / limit
      var pages;

      if (devident > parseInt(devident)) {
          pages = parseInt(devident) + 1
      } else {
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
      } else {
          data.response = {
              status: 200,
              result: STATUS.ERROR,
              message: "Data not found."
          }
      }

      return data;
  } catch (error) {
    console.log("error    --------->   ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const update_chat = async (data, authData) => {
  try {

      const decoded = Auth.decodeToken(authData);
      if (decoded?.usertype_in == true || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
        data.response = {
          status: 0,
          message: "You are not valid user!"
        }
        return data;
      }

      delete data["action"]
      delete data["command"]

      let record = await Models.community_chat.findOneAndUpdate(
            { community_chat_id: data.community_chat_id },
            { $set: data },
            { new: true })

      let user_data = await Models.user.findOne({user_id: record.user_id}).exec()
      var final_data = {
        _id: record._id,
        type: record.type,
        media: record.media,
        message: record.message,
        user_id: record.user_id,
        activity_id: record.activity_id,
        community_id: record.community_id,
        is_deleted: record.is_deleted,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        community_chat_id: record.community_chat_id,
        user_data: user_data
      }
      io.emit('community_chat', {message: final_data})

      if (record !== null) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Message updated successfully.."
        }
      } else {
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

const delete_chat = async (data, authData) => {
  try {

      const decoded = Auth.decodeToken(authData);
      if (decoded?.usertype_in == true || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
        data.response = {
          status: 0,
          message: "You are not valid user!"
        }
        return data;
      }

      delete data["action"]
      delete data["command"]

      let record = await Models.community_chat.findOneAndUpdate(
            { community_chat_id: data.community_chat_id },
            { $set: data },
            { new: true })

      if (record !== null) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Chat deleted successfully.."
        }
      } else {
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
    update_chat,
    delete_chat,
};
