const userService = require("../../services/user");

class login {
    constructor() {
        console.log(' ----->  login');
    }
    async process(data, authData) {
        let response = await userService.login(data);
        return response;
    }
}
module.exports = login;