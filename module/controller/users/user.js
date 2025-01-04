const userService = require("../../services/user");
class user {
    constructor() {
        console.log('faq');
    }
    async process(data, authData) {
        let response = await userService.createUser(data);
        return response;
    }
}
module.exports = user;