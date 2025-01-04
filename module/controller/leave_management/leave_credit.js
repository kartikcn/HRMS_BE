const creaditLeaveService = require("../../services/creditLeaveService");

class leave_credit {
  constructor() {
    console.log(" -----> leave credit create");
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
      let response = await creaditLeaveService.create(data, authData);
      return response;
    }
  }
  async get_credit_list(data, authData) {
    let response = await creaditLeaveService.get_credit_list(data, authData);
    return response;
  }
}
module.exports = leave_credit;
