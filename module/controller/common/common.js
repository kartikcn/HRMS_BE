const commonFunction = require("../../services/commonFunctions");
class common {
    constructor() {
        console.log('common controller');
    }
    async process(data, authData) {
        try {
            console.log('cdcdcdcdcd')
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data);
                return result;
            }
        } catch(e){
            console.log(e)
        }
    }

    async refreshToken(data) {
        try {
            let response = await commonFunction.refreshToken(data);
            return response;
        } catch(e) {
            console.log(e)
        }
    }
}

module.exports = common;