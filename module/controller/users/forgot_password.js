const userService = require("../../services/user");

class forgot_password {
    constructor() {
        console.log(' ----->  forgot_password');
    }
    async process(data, authData) {
        let response = await userService.forgot_password(data);
        return response;
    }
}
module.exports = forgot_password;