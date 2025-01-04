const userService = require("../../services/user");

class social_media_account {
    constructor() {
        console.log(' ----->  social_media_account');
    }
    async process(data, authData) {
        let response = await userService.social_media_account(data, authData);
        return response;
    }
}
module.exports = social_media_account;