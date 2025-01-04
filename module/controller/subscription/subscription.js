const subscriptionService = require("../../services/subscriptionService");

class create {
    constructor() {
        console.log(' ----->  create subscription');
    }
    async process(data, authData) {
      try {
        if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
          var function_name = data['command'][0]['function'];
          let result = await this[function_name](data, authData);
          return result;
        } else {
          let response = await subscriptionService.create(data, authData);
          return response;
        }
      } catch(e){
        console.log(e)
      }
    }

    async get_list(data, authData) {
      try {
        let response = await subscriptionService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async get_list_mobile(data, authData) {
      try {
        let response = await subscriptionService.get_list_mobile(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;