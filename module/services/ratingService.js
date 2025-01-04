
const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded.is_active == false || decoded.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }

    if (decoded.usertype_in == true) {

      let course_data = await Models.course.findOne({course_id: data.course_id}).exec()

      if (course_data == null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Wrong course_id.",
        }
      }else{

        delete data["flag"]
        delete data["action"]
        delete data["command"]
        delete data["course_id"]

        let record = await Models.course.findOneAndUpdate(
            { _id: new ObjectId(course_data._id) },
            { $set: data },
            { new: true });

        if (record.length !== null) {
          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            data: record,
            message: "Rating added.",
          }
        }else{
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Rating not added.",
          }
        }
      }

      return data;
    }else{
       data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }    
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

    if (decoded.is_active == false || decoded.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "You are not admin!!"
      }
      return data;
    }

    let course_data = await Models.course.findOne({course_id: data.course_id}).exec();

    if (course_data !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: course_data,
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

module.exports = {
    create,
    get_list,
};
