 const community_chatService = require("../../services/community_chatService");

class create {
    constructor() {
        console.log(' ----->  create community');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await community_chatService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
        try {
          let response = await community_chatService.get_list(data, authData);
          return response;
        } catch(e) {
          console.log(e)
        }
    }

    async update_chat(data, authData) {
        try {
          let response = await community_chatService.update_chat(data, authData);
          return response;
        } catch(e) {
          console.log(e)
        }
    }

    async delete_chat(data, authData) {
        try {
          let response = await community_chatService.delete_chat(data, authData);
          return response;
        } catch(e) {
          console.log(e)
        }
    }

}
module.exports = create;