const leaveService = require("../../services/leaveService");
class create {
  constructor() {
    console.log(" ----->  create leave");
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
        let response = await leaveService.create(data, authData);
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  }
  // async update_leave_create(data,authData){
  //   try{
  //      let response = await leaveService.update_leave_create(data,authData);
  //      return response
  //   }catch(e){
  //     console.log(e)
  //   }
  // }
  // async get_list(data, authData) {
  //   try {
  //     let response = await leaveService.get_list(data, authData);
  //     return response;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}
module.exports = create;
