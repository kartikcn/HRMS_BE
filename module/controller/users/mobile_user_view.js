const userService = require("../../services/user");

class mobile_user_view {
    constructor() {
        console.log(' ----->  user_profile');
    }
    async process(data, authData) {
        let response = await userService.mobile_user_view(data, authData);
        return response;
    }
}
module.exports = mobile_user_view;