const userService = require("../../services/user");

class resend_otp {
    constructor() {
        console.log(' ----->  resend_otp');
    }
    async process(data, authData) {
        let response = await userService.resend_otp(data);
        return response;
    }
}
module.exports = resend_otp;