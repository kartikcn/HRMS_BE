const leaveApplicationService = require("../../services/leaveApplicationService");
class leave_application {
  constructor() {
    console.log("-------> Leave Application agent");
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
      let response = await leaveApplicationService.create(data, authData);
      return response;
    }
  }
  async get_leave_application(data, authData) {
    let response = await leaveApplicationService.get_leave_application(
      data,
      authData
    );
    return response;
  }
  async update_leave_application(data, authData) {
    let response = await leaveApplicationService.update_leave_application(
      data,
      authData
    );
    return response;
  }
  async get_moderator_application(data, authData) {
    let response = await leaveApplicationService.get_moderator_application(
      data,
      authData
    );
    return response;
  }
}
module.exports = leave_application;
