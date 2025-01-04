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

    let saved_data = await Models.holidayCreate(data).save();

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

const get_holiday_list = async function (data, authData) {
  try {
    // Decode the token to verify the user's authentication
    const decoded = Auth.decodeToken(authData);

    // Check if the user is valid (active and not deleted)
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }
    // Set pagination parameters
    const skip = data.limit * (data.page_no - 1);
    const limit = data.limit;
    const filters = data.filter || {};

    // Define base filter; can add specific conditions if needed
    let filterData = {};

    if (filters.all) {
      const allFilter = filters.all.toLowerCase();
      const searchConditions = [];

      // Text search across multiple fields
      const textFields = ["holiday_name"];
      searchConditions.push(
        ...textFields.map((field) => ({
          [field]: { $regex: allFilter, $options: "i" },
        }))
      );

      // Dynamic boolean mapping for holiday type
      const booleanMappings = {
        m: true, // mandatory
        o: false, // optional
        mandatory: true,
        optional: false,
      };

      // Check if input matches any boolean mapping
      Object.entries(booleanMappings).forEach(([key, value]) => {
        if (key.includes(allFilter)) {
          searchConditions.push({ is_compulsory: value });
        }
      });

      // Partial character matching for holiday type
      const partialTypeMatch = allFilter
        .split("")
        .some((char) => ["m", "o"].includes(char));

      if (partialTypeMatch) {
        searchConditions.push({
          is_compulsory: allFilter.includes("m"),
        });
      }

      filterData.$or = searchConditions;
    }
    // Handle specific field searches if they exist
    if (filters.holiday_name) {
      filterData.holiday_name = { $regex: filters.holiday_name, $options: "i" };
    }
    if (filters.holiday_type) {
      const holidayType = filters.holiday_type.toLowerCase();

      if (holidayType.startsWith("m")) {
        // Match "Mandatory" with partial input
        filterData.is_compulsory = true;
      } else if (holidayType.startsWith("o")) {
        // Match "Optional" with partial input
        filterData.is_compulsory = false;
      }
    }
    // Retrieve all holidays from the 'Holiday' collection
    const holiday_list = await Models.holidayCreate
      .find(filterData)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    // Get total count for pagination
    const total_records = await Models.holidayCreate.countDocuments(filterData);

    // Calculate the number of pages
    const total_pages = Math.ceil(total_records / limit);

    // If there are holidays, return the data
    if (holiday_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_records: total_records,
        total_pages: total_pages,
        message: "Holidays found.",
        data: holiday_list,
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No holidays found.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};
const update_holiday_list = async (data, authData) => {
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
    if (!data.holiday_id) {
      data.response = {
        status: 0,
        message: "Holiday ID is required for update.",
      };
      return data;
    }

    // Update the holiday document in the collection
    const updated_data = await Models.holidayCreate.findByIdAndUpdate(
      data.holiday_id,
      {
        holiday_name: data.holiday_name,
        holiday_date: data.holiday_date,
        is_compulsory: data.is_compulsory,
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
const delete_holiday_by_id = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);

    // Validate the user's credentials and permissions
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

    // Ensure holiday ID is provided in the data
    if (!data.holiday_id) {
      data.response = {
        status: 0,
        message: "Holiday ID is required for deletion.",
      };
      return data;
    }

    // Delete the holiday document from the collection
    const deleted_data = await Models.holidayCreate.findByIdAndDelete(
      data.holiday_id
    );

    // Check if the deletion was successful
    if (deleted_data) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: deleted_data,
        message: "Holiday deleted successfully.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Holiday not found. Deletion failed.",
      };
    }

    return data;
  } catch (error) {
    console.log("Error deleting holiday ------------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something went wrong",
      error: error,
    };
    return data;
  }
};

module.exports = {
  create,
  get_holiday_list,
  update_holiday_list,
  delete_holiday_by_id,
};
