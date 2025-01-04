const commonFunctions = require("../../services/commonFunctions");

class file_upload {
    constructor() {
        console.log(' ----->  create file url');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await commonFunctions.file_upload(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }
}
module.exports = file_upload;