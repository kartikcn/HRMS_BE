const userService = require("../../services/user");

class user_profile_update {
    constructor() {
        console.log(' ----->  user_profile_update');
    }
    async process(data, authData) {
        let response = await userService.user_profile_update(data, authData);
        return response;
    }
}
module.exports = user_profile_update;