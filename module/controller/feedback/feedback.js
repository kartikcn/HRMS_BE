 const feedbackService = require("../../services/feedbackService");

class create {
    constructor() {
        console.log(' ----->  create feedback');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await feedbackService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
      try {
        let response = await feedbackService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async get_list_for_admin(data, authData) {
      try {
        let response = await feedbackService.get_list_for_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;