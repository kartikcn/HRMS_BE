 const chat_botService = require("../../services/chat_botService");

class create {
    constructor() {
        console.log(' ----->  create chat_bot');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await chat_botService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async apple_data_add(data, authData) {
      try {
        let response = await chat_botService.apple_data_add(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;