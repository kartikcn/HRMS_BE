const _ = require("underscore.string");

const create = async (data, authData) => {

  userLogger.info(__filename, 'Note create process request ---->  ,' + data);

  try {  

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true) {
      data.response = {
          status: 0,
          message: "Invalid user!"
      }
      return data;
    }

    if (decoded?.is_active == false) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is de_activated.",
      }
      return data;
    }

    if (decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is deleted.",
      }
      return data;
    }

    if (data.note_type == undefined || _.isBlank(data.note_type)) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Please add node_type.",
      }

      return data;
    }

    if (_.isBlank(data.title) || _.isBlank(data.description) || _.isBlank(data.user_id)) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Some field are missing.",
      }

      return data;
    }

    if (data.note_type == "general") {
      console.log("General   ------------->  ")
      let res_data = await new Models.note({
          title: data?.title,
          description: data?.description,
          note_type: data?.note_type,
          user_id: data?.user_id,
          created_by: data?.user_id,
      }).save();

      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: res_data,
          message: "General Note data stored.",
      }

      userLogger.info(__filename, 'Note create process response ---->  ,' + data);

      return data;
    }

    if (data.note_type == "course") {

      if (_.isBlank(data.course_id) || _.isBlank(data.module_id)) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Some field are missing.",
        }

        return data;
      }else{
        console.log("Course   ------------->  ")
        let res_data = await new Models.note({
            title: data?.title,
            description: data?.description,
            note_type: data?.note_type,
            course_id: data?.course_id,
            module_id: data?.module_id,
            user_id: data?.user_id,
            created_by: data?.user_id,
        }).save();

        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            data: res_data,
            message: "Course Note data stored.",
        }
        userLogger.info(__filename, 'Note create process response ---->  ,' + data);
        return data;
      }
    }
  } catch (error) {

      userLogger.info(__filename, 'Note create catch block ---->  ,' + error);

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
  userLogger.info(__filename, 'Note list process request ---->  ,' + data);

  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true) {
      data.response = {
          status: 0,
          message: "Invalid user!"
      }
      return data;
    }

    if (decoded?.is_active == false) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is de_activated.",
      }
      return data;
    }

    if (decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is deleted.",
      }
      return data;
    }

    var record = await Models.note.aggregate([
        {
          '$sort': {
            'createdAt': data.createdAt
          }
        }, {
          '$match': {
            'is_deleted': data.is_deleted,
            'user_id': new ObjectId(data.user_id)
          }
        }
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data not found.",
      }
    }

    userLogger.info(__filename, 'Note list process response ---->  ,' + data);
    return data;
  } catch (error) {
      userLogger.info(__filename, 'Note list catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const view_note = async (data, authData) => {
  userLogger.info(__filename, 'Note view process request ---->  ,' + data);

  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true) {
      data.response = {
          status: 0,
          message: "Invalid user!"
      }
      return data;
    }

    if (decoded?.is_active == false) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is de_activated.",
      }
      return data;
    }

    if (decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is deleted.",
      }
      return data;
    }

    var record = await Models.note.aggregate([
        {
          '$match': {
            '_id': new ObjectId(data._id)
          }
        }
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data not found.",
      }
    }

    userLogger.info(__filename, 'Note view process response ---->  ,' + data);
    return data;
  } catch (error) {
      userLogger.info(__filename, 'Note view catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const update_note = async (data, authData) => {
  userLogger.info(__filename, 'Note update process request ---->  ,' + data);
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true) {
      data.response = {
          status: 0,
          message: "Invalid user!"
      }
      return data;
    }

    if (decoded?.is_active == false) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is de_activated.",
      }
      return data;
    }

    if (decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is deleted.",
      }
      return data;
    }

    if (data.note_type == undefined || _.isBlank(data.note_type)) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Please add node_type.",
      }

      return data;
    }

    if (_.isBlank(data.title) || _.isBlank(data.description) || _.isBlank(data.user_id)) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Some field are missing.",
      }

      return data;
    }

    if (data.note_type == "general") {
      console.log("General   ------------->  ")
      let res_data = await Models.note.findOneAndUpdate(
            { _id: new ObjectId(data._id) },
            { $set: {
                      title: data?.title,
                      description: data?.description,
                      note_type: data?.note_type,
                      user_id: data?.user_id,
                      modified_by: data?.user_id
                    }
            },
            { new: true });

      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: res_data,
          message: "General Note data updated.",
      }

      userLogger.info(__filename, 'Note update process response ---->  ,' + data);

      return data;
    }

    if (data.note_type == "course") {

      if (_.isBlank(data.course_id) || _.isBlank(data.module_id)) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Some field are missing.",
        }

        return data;
      }else{
        console.log("Course   ------------->  ")

        let res_data = await Models.note.findOneAndUpdate(
            { _id: new ObjectId(data._id) },
            { $set: {
                      title: data?.title,
                      description: data?.description,
                      note_type: data?.note_type,
                      course_id: data?.course_id,
                      module_id: data?.module_id,
                      user_id: data?.user_id,
                      modified_by: data?.user_id
                    }
            },
            { new: true });

        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            data: res_data,
            message: "Course Note data updated.",
        }
        userLogger.info(__filename, 'Note update process response ---->  ,' + data);
        return data;
      }
    }
  } catch (error) {

      userLogger.info(__filename, 'Note update catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const delete_note = async (data, authData) => {
  userLogger.info(__filename, 'Note delete process request ---->  ,' + data);
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true) {
      data.response = {
          status: 0,
          message: "Invalid user!"
      }
      return data;
    }

    if (decoded?.is_active == false) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is de_activated.",
      }
      return data;
    }

    if (decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "User is deleted.",
      }
      return data;
    }

    console.log("delete_note   ------------>   ", data)

    let record = await Models.note.findOne({ _id: data._id}).exec();

    if (record !== null) {
      let res_data = await Models.note.findOneAndUpdate(
            { _id: new ObjectId(data._id) },
            { $set: {
                      is_deleted: data.is_deleted,
                      deleted_by: record?.user_id,
                      deletedAt: new Date()
                    }
            },
            { new: true });

      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: res_data,
          message: "Note data deleted.",
      }
    }else{
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Date not available.",
      }
    }

    userLogger.info(__filename, 'Note delete process response ---->  ,' + data);
    return data;
  } catch (error) {

      userLogger.info(__filename, 'Note delete catch block ---->  ,' + error);

      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const search_note = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded?.usertype_in === true || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    var title = {
                  '$regex': new RegExp(data.title),
                  '$options': 'i'
                }

    var record = await Models.note.aggregate([
      {
        '$match': {
          'user_id': new ObjectId(data.user_id), 
          'title': title,
          'is_deleted': data.is_deleted
        }
      }
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found.",
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
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
    view_note,
    update_note,
    delete_note,
    search_note,
};
