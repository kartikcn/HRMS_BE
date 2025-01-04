const userService = require("../../services/user");

class mobile_user_list {
    constructor() {
        console.log(' ----->  mobile_user_list');
    }
    async process(data, authData) {
        let response = await userService.mobile_user_list(data, authData);
        return response;
    }
}
module.exports = mobile_user_list;