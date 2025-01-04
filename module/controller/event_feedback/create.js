const event_feedbackService = require("../../services/event_feedbackService");

class create {
    constructor() {
        console.log(' ----->  create event');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await event_feedbackService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
      try {
        let response = await event_feedbackService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async view_eventfeedback(data, authData) {
      try {
        let response = await event_feedbackService.view_eventfeedback(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;