const shopifypipeline = require('express').Router();
const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');
const appSystem = require("../../system/core/appSystem");
const appSystemObj = new appSystem();
shopifypipeline.post('/', async (req, res) => {

    try {
        const postData = req.body;
        userLogger.info(__filename, "header Shopify " + JSON.stringify(postData, null, 4));
        userLogger.info(__filename, "header Shopify " + JSON.stringify(res.locals.shopify.session, null, 4));
        console.log("res",res);
        const authData = await appSystemObj.getShopInfo(res.locals.shopify.session);
        let data = postData;
        // data["auth"] = authData;
        switch (postData.action) {
            case "command":
                userLogger.info(__filename, `Calling command function(callingCommand(data) data = ${JSON.stringify(data, null, 4)}`);
                userLogger.info(__filename, `Calling command data = ${JSON.stringify(authData)}`);
                data = await callingCommand(data, authData, res.locals.shopify.session);
                break;
            default:
                userLogger.error(__filename, `Action not found  ${JSON.stringify(postData)}`);
                res.status(200).json({ "statusCode": 0, "status": "warnning", "message": "please check action command", "data": data });
                break;
        }
        res.status(200).json({ "statusCode": 1, "status": "success", "message": "success", "data": data });
    } catch (error) {
        res.status(200).json({ "statusCode": 0, "status": "erroe", "message": "faile by generate exception", "data": error });
    }
});

const callingCommand = async (data, authData, session) => {
    try {
        userLogger.info(__filename, `In function(callingCommand(data) action = ${data.action}`);
        userLogger.info(__filename, `In function(callingCommand(data) command = ${data.command}`);
        const commands = data.command;

        let fullData = [];
        for (let key in commands) {
            userLogger.info(__filename, `In function(callingCommand(data) path = ${config.basePath + configModule[commands[key]["agent"]]}`);
            console.log("Default ", config.basePath + configModule[commands[key]["agent"]]);
            const agent = require(config.basePath + configModule[commands[key]["agent"]]);
            const agentObj = new agent();
            console.log("before", data);
            data = await agentObj.process(data, authData, session);
            console.log("DATA  ", data);
            if (data.response.code != 1) {
                userLogger.error(__filename, `Error on Agent ${commands[key]["agent"]}  ${data.action}`);
                //throw new Error(`${data.response.message}`);
                return data.response;
            }
        }
        console.log("after", data);
        if (data.response.code === 1) {
            userLogger.error(__filename, `afterIn function(callingCommand(data) data = ${JSON.stringify(data)}`);
            return data;
        } else {
            return data;
        }
    } catch (error) {
        userLogger.error(__filename, `afterIn function(callingCommand(data) Error = ${error.stack}`)
    }

}

module.exports = shopifypipeline;