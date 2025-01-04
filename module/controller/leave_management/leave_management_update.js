class create {
  constructor() {
    console.log(" ----->  leave management update");
  }
  async process(data, authData) {
    try {
      if (
        data["command"][0]["function"] != "" &&
        typeof this[data["command"][0]["function"]] === "function"
      ) {
        var function_name = data["command"][0]["function"];
        let result = await this[function_name](data, authData);
        return result;
      } else {
        let response = await update(data, authData);
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

const update = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

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

    // Ensure that the action and command fields are not part of the update
    delete data["action"];
    delete data["command"];

    // Ensure holiday ID is provided in the data
    if (!data.leave_id) {
      data.response = {
        status: 0,
        message: "Leave ID is required for update.",
      };
      return data;
    }

    // Update the holiday document in the collection
    const updated_data = await Models.leaveCreate.findByIdAndUpdate(
      data.leave_id,
      {
        leave_name: data.leave_name,
        leave_code: data.leave_code,
      },
      { new: true } // This option returns the updated document
    );

    // Check if the update was successful
    if (updated_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: updated_data,
        message: "Data updated successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not updated. Holiday ID may not exist.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error updating holiday ------------>  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

module.exports = create;
