const { userLogger } = require('../../../loggerFile');
const config = require("../../../config.json");
const userService = require("../../services/user");

class verifyOtp {
    constructor() {
        console.log('faq');
    }
    async process(data, authData) {
        let response = await userService.verifyOtp(data);
        return response;
    }
}
module.exports = verifyOtp;