const tastListService = require("../../services/taskListService");
class task_list {
  constructor() {
    console.log("-------> Task List Creation");
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
      let response = await tastListService.create(data, authData);
      return response;
    }
  }
  async deleteTask(data, authData) {
    let response = await tastListService.deleteTask(data, authData);
    return response;
  }
  async updateTask(data, authData) {
    let response = await tastListService.updateTask(data, authData);
    return response;
  }
  async getTask(data, authData) {
    let response = await tastListService.getTask(data, authData);
    return response;
  }
  async getLogs(data, authData) {
    let response = await tastListService.getLogs(data, authData);
    return response;
  }
}
module.exports = task_list;
