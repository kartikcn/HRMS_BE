const noteService = require("../../services/noteService");

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
                let response = await noteService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
      try {
        let response = await noteService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async view_note(data, authData) {
      try {
        let response = await noteService.view_note(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async update_note(data, authData) {
      try {
        let response = await noteService.update_note(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async delete_note(data, authData) {
      try {
        let response = await noteService.delete_note(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async search_note(data, authData) {
      try {
        let response = await noteService.search_note(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;