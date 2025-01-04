const userService = require("../../services/user");

class user_profile {
    constructor() {
        console.log(' ----->  user_profile');
    }
    async process(data, authData) {
        let response = await userService.user_profile(data, authData);
        return response;
    }
}
module.exports = user_profile;