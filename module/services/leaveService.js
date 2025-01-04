const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];

    let saved_data = await Models.leaveCreate(data).save();

    if (saved_data != null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: saved_data,
        message: "Data stored successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not stored.",
      };
    }

    return data;
  } catch (error) {
    console.log("error  invoice ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

// const get_list = async (data, authData) => {
//   try {

//     const decoded = Auth.decodeToken(authData);

//     if (decoded ?. usertype_in === false && decoded ?. is_active === false && decoded ?. deleted_date !== null) {
//         data.response = {
//             status: 0,
//             message: "You are not valid user!!"
//         }
//         return data;
//     }

//     delete data["action"]
//     delete data["command"]

//     var record = await Models.menu.aggregate([
//         {
//           '$match': data
//         },
//         {
//           '$lookup': {
//             'from': 'sub_menus',
//             'localField': 'menu_id',
//             'foreignField': 'menu_id',
//             'as': 'submenu'
//           }
//         }
//     ]);

//     var submenu;
//     var submenuChild;

//     for (var i = 0; i < record.length; i++) {
//           record[i].is_add = false;
//           record[i].is_view = false;
//           record[i].is_delete = false;
//           record[i].is_edit = false;
//       if (record[i].submenu.length !== 0) {
//          submenu = record[i].submenu
//         console.log(submenu, "sub menu data")
//          for (var j = 0; j < submenu.length; j++) {
//           submenu[j].is_add = false;
//           submenu[j].is_view = false;
//           submenu[j].is_delete = false;
//           submenu[j].is_edit = false;
//             submenuChild = await Models.child_menu.find({menu_id: submenu[j].menu_id, sub_menu_id: submenu[j].sub_menu_id}).exec()

//             submenu[j].submenuChild = submenuChild
//           }

//       }
//     }

//     if (record.length > 0) {
//       data.response = {
//         status: 200,
//         result: STATUS.SUCCESS,
//         data: record,
//         message: "Data found.",
//       }
//     }else{
//       data.response = {
//           status: 0,
//           result: STATUS.ERROR,
//           message: "Data not found."
//       }
//     }
//     return data;
//   } catch (error) {
//     console.log("error  invoice ------------>  ", error)
//       data.response = {
//           status: 0,
//           result: STATUS.ERROR,
//           message: "Something is wrong",
//           error: error
//       }
//       return data;
//   }
// }
const leave_create_list = async function (data, authData) {
  try {
    userLogger.info(
      __filename,
      "leave_create_list process request ----> ," + JSON.stringify(data)
    );

    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in === false ||
      decoded.is_active === false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    const skip = data.limit * (data.page_no - 1);
    const limit = data.limit;
    const filters = data.filter || {};

    // Build the filter object
    let filterData = {};

    // Handle 'all' search
    if (filters.all) {
      filterData.$or = [
        { leave_name: { $regex: filters.all, $options: "i" } },
        { leave_code: { $regex: filters.all, $options: "i" } },
      ];
    }

    // Handle specific field searches if they exist
    if (filters.leave_name) {
      filterData.leave_name = { $regex: filters.leave_name, $options: "i" };
    }
    if (filters.leave_code) {
      filterData.leave_code = { $regex: filters.leave_code, $options: "i" };
    }

    // Query with the constructed filter
    const leave_list = await Models.leaveCreate
      .find(filterData)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total_records = await Models.leaveCreate.countDocuments(filterData);
    const total_pages = Math.ceil(total_records / limit);

    if (leave_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_records: total_records,
        total_pages: total_pages,
        data: leave_list,
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No leave data found.",
      };
    }

    userLogger.info(
      __filename,
      "leave_create_list process response ----> ," + JSON.stringify(data)
    );
    return data;
  } catch (error) {
    userLogger.info(
      __filename,
      "leave_create_list catch block ----> ," + error
    );
    console.log("Error:", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};
const deleteData = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    // Validate user
    if (
      decoded?.usertype_in === false &&
      decoded?.is_active === false &&
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    // Validate input
    if (!data.id) {
      data.response = {
        status: 400,
        message: "Invalid request. ID is required to delete data.",
      };
      return data;
    }

    // Delete the document
    const deletedData = await Models.leaveCreate.findByIdAndDelete(data.id);

    // Check if data was found and deleted
    if (deletedData) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Data deleted successfully.",
        data: deletedData,
      };
    } else {
      data.response = {
        status: 404,
        result: STATUS.ERROR,
        message: "Data not found or already deleted.",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in delete route:", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong while deleting the data.",
      error: error.message || error,
    };
    return data;
  }
};

module.exports = {
  create,
  leave_create_list,
  deleteData,
};
