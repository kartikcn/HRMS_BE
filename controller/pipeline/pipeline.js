const express = require('express');
const { userLogger } = require('../../loggerFile');
const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');

const pipeline = express.Router();

pipeline.post('/', async (req, res) => {
  try {
    const postData = req.body;
    const authData = await jwtToken.getTokenData(req);

    let data = postData;

    switch (postData.action) {
      case "command":
        userLogger.error(__filename, `Calling command function(callingCommand(data) data = ${JSON.stringify(postData)}`);
        userLogger.error(__filename, `Calling command data = ${JSON.stringify(authData)}`);
        data = await callingCommand(data, authData);
        break;
      default:
        userLogger.error(__filename, `Action not found ${JSON.stringify(postData)}`);
        return res.status(200).json({ "statusCode": 0, "status": "warnning", "message": "please check action command", "data": data });
    }

    return res.status(200).json({ "statusCode": 1, "status": "success", "message": "success", "data": data });
  } catch (error) {
    return res.status(200).json({ "statusCode": 0, "status": "error", "message": "failed due to exceptions", "data": error });
  }
});

const callingCommand = async (data, authData) => {
  userLogger.error(__filename, `In function(callingCommand(data) action = ${data.action}`);
  userLogger.error(__filename, `In function(callingCommand(data) command = ${data.command}`);

  const commands = data.command;
  const promises = [];

  for (const key in commands) {
    const agent = require(config.basePath + configModule[commands[key]["agent"]]);
    const agentObj = new agent();
    promises.push(agentObj.process(data, authData));
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
};

module.exports = pipeline;
