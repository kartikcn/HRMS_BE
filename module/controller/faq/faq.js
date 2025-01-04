 const faqService = require("../../services/faqService");

class create {
    constructor() {
        console.log(' ----->  create notes');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await faqService.create(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
      try {
        let response = await faqService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async contact_us(data, authData) {
      try {
        let response = await faqService.contact_us(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;