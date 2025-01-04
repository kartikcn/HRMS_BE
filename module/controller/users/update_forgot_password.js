const userService = require("../../services/user");

class update_forgot_password {
    constructor() {
        console.log(' ----->  update_forgot_password');
    }
    async process(data, authData) {
        let response = await userService.update_forgot_password(data);
        return response;
    }
}
module.exports = update_forgot_password;