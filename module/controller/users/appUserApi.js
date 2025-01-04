const userService = require("../../services/user");

class appUserApi {
    constructor() {
        console.log(' ----->  app user');
    }
    async process(data, authData) {
        if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
            var function_name = data['command'][0]['function'];
            let result = await this[function_name](data, authData);
            return result;
        } else {
            let response = await userService.abc(data, authData);
            return response;
        }
    }

    async user_mobile_update (data, authData) {
        let response = await userService.user_mobile_update(data, authData);
        return response;
    }

    async user_app_mobile_signup (data, authData) {
        let response = await userService.user_app_mobile_signup(data, authData);
        return response;
    }

    async user_app_mobile_login (data, authData) {
        let response = await userService.user_app_mobile_login(data, authData);
        return response;
    }

    async user_get_mobile_data (data, authData) {
        let response = await userService.user_get_mobile_data(data, authData);
        return response;
    }

}
module.exports = appUserApi;