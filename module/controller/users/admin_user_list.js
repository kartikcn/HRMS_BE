const userService = require("../../services/user");

class admin_user_list {
    constructor() {
        console.log(' ----->  admin_user_list');
    }
    async process(data, authData) {
        let response = await userService.admin_user_list(data, authData);
        return response;
    }
}
module.exports = admin_user_list;