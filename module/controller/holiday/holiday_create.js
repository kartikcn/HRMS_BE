const holidayService = require("../../services/holidayService");

class holiday_create {
  constructor() {
    console.log(" -----> holiday create");
  }
  async process(data, authData) {
    if (
      data["command"][0]["function"] != "" &&
      typeof this[data["command"][0]["function"]] === "function"
    ) {
      var function_name = data["command"][0]["function"];
      let result = await this[function_name](data, authData);
      return result;
    } else {
      let response = await holidayService.create(data, authData);
      return response;
    }
  }
  async get_holiday_list(data, authData) {
    let response = await holidayService.get_holiday_list(data, authData);
    return response;
  }
  async update_holiday_list(data, authData) {
    let response = await holidayService.update_holiday_list(data, authData);
    return response;
  }
  async delete_holiday_by_id(data, authData) {
    let response = await holidayService.delete_holiday_by_id(data, authData);
    return response;
  }
}
module.exports = holiday_create;
