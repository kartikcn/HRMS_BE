const leaveService = require("../../services/leaveService");

class leave_create_list {
  constructor() {
    console.log(" -----> leave create list");
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
      let response = await leaveService.leave_create_list(data, authData);
      return response;
    }
  }
  async deleteData(data, authData) {
    let response = await leaveService.deleteData(data, authData);
    return response;
  }
}
module.exports = leave_create_list;
