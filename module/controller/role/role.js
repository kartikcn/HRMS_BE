 const roleService = require("../../services/roleService");

class create {
    constructor() {
        console.log(' ----->  create roles');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && data['command'][0]['function'] != null && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await roleService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async list(data, authData) {
      try {
        let response = await roleService.list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async view(data, authData) {
      try {
        let response = await roleService.view(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;