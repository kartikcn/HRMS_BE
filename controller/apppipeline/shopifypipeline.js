const express = require('express');
const { userLogger } = require('../../loggerFile');
const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');
const appSystem = require("../../system/core/appSystem");
const appSystemObj = new appSystem();

const shopifypipeline = express.Router();

shopifypipeline.post('/', async (req, res) => {
  try {
    const postData = req.body;
    const session = res.locals.shopify.session;

    userLogger.info(__filename, "header Shopify " + JSON.stringify(postData, null, 4));
    userLogger.info(__filename, "header Shopify " + JSON.stringify(session, null, 4));

    const authData = await appSystemObj.getShopInfo(session);
    let data = postData;

    switch (postData.action) {
      case "command":
        userLogger.info(__filename, `Calling command function(callingCommand(data) data = ${JSON.stringify(data, null, 4)}`);
        userLogger.info(__filename, `Calling command data = ${JSON.stringify(authData)}`);
        data = await callingCommand(data, authData, session);
        break;
      default:
        userLogger.error(__filename, `Action not found ${JSON.stringify(postData)}`);
        return res.status(200).json({ "statusCode": 0, "status": "warning", "message": "please check action command", "data": data });
    }

    return res.status(200).json({ "statusCode": 1, "status": "success", "message": "success", "data": data });
  } catch (error) {
    return res.status(200).json({ "statusCode": 0, "status": "error", "message": "failed due to exception", "data": error });
  }
});

const callingCommand = async (data, authData, session) => {
  try {
    userLogger.info(__filename, `In function(callingCommand(data) action = ${data.action}`);
    userLogger.info(__filename, `In function(callingCommand(data) command = ${data.command}`);
    
    const commands = data.command;
    const promises = [];

    for (const key in commands) {
      const agentPath = config.basePath + configModule[commands[key]["agent"]];
      userLogger.info(__filename, `In function(callingCommand(data) path = ${agentPath}`);

      const agent = require(agentPath);
      const agentObj = new agent();

      console.log("before", data);
      const agentResult = await agentObj.process(data, authData, session);
      promises.push(agentResult);

      console.log("DATA  ", agentResult);
      if (agentResult.response.code != 1) {
        userLogger.error(__filename, `Error on Agent ${commands[key]["agent"]} ${data.action}`);
        return agentResult.response;
      }
    }

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.response.code !== 1) {
        userLogger.error(__filename, `Error on Agent ${result.agent} ${data.action}`);
        return result.response;
      }
    }

    userLogger.error(__filename, `afterIn function(callingCommand(data) data = ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    userLogger.error(__filename, `afterIn function(callingCommand(data) Error = ${error.stack}`);
  }
};

module.exports = shopifypipeline;
