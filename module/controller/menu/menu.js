const menuService = require("../../services/menuService");

class create {
    constructor() {
        console.log(' ----->  create menu');
    }
    async process(data, authData) {
      try {
        if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
            var function_name = data['command'][0]['function'];
            let result = await this[function_name](data, authData);
            return result;
        } else {
            let response = await menuService.create(data, authData);
            return response;
        }
      } catch(e){
          console.log(e)
      }
    }

    async sub_menu_create(data, authData) {
      try {
        let response = await menuService.sub_menu_create(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async child_menu_create(data, authData) {
      try {
        let response = await menuService.child_menu_create(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async get_list(data, authData) {
      try {
        let response = await menuService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;