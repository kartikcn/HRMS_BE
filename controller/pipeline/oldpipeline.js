const pipeline = require('express').Router();
const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');

pipeline.post('/', async (req, res) => {
    try {
        const postData = req.bodys;
        const authData = await jwtToken.getTokenData(req);
        let data = postData;
        //data["auth"] = authData;
        switch (postData.action) {
            case "command":
                userLogger.error(__filename,`Calling command function(callingCommand(data) data = ${JSON.stringify(postData)}`);
                userLogger.error(__filename,`Calling command data = ${JSON.stringify(authData)}`);
                data = await callingCommand(data, authData);
                break;
            default:
                userLogger.error(__filename,`Action not found  ${JSON.stringify(postData)}`);
                res.status(200).json({ "statusCode": 0, "status": "warnning", "message": "please check action command", "data": data });
                break;
        }
        res.status(200).json({ "statusCode": 1, "status": "success", "message": "success", "data": data });
    } catch (error) {
        res.status(200).json({ "statusCode": 0, "status": "erroe", "message": "faile by generate exceptions", "data": error });
    }
});

const callingCommand = async (data, authData) => {
    userLogger.error(__filename,`In function(callingCommand(data) action = ${data.action}`);
    userLogger.error(__filename,`In function(callingCommand(data) command = ${data.command}`);
    const commands = data.command;
    let fullData = [];
    for (let key in commands) {
        console.log("Default ", config.basePath + configModule[commands[key]["agent"]]);
        const agent = require(config.basePath + configModule[commands[key]["agent"]]);
        const agentObj = new agent();
        console.log("before", data);
        data = await agentObj.process(data, authData);
        console.log("DATA  ", data);
        if (data.response.code != 1) {
            userLogger.error(__filename,`Error on Agent ${commands[key]["agent"]}  ${data.action}`);
            //throw new Error(`${data.response.message}`);
            return data.response;
        }
    }
    console.log("after", data);
    if (data.response.code === 1) {
        userLogger.error(__filename,`afterIn function(callingCommand(data) data = ${JSON.stringify(data)}`);
        return data;
    } else {
        return data;
    }


}

module.exports = pipeline;
