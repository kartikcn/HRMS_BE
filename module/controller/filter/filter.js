 const filterService = require("../../services/filterService");

class create {
    constructor() {
        console.log(' ----->  create filter');
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

    async course_filter(data, authData) {
      try {
        let response = await filterService.course_filter(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async transaction_filter(data, authData) {
      try {
        let response = await filterService.transaction_filter(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;