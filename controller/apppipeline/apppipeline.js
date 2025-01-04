const express = require("express");

const app = express();
const apppipeline = require("express").Router();
const { userLogger } = require("../../loggerFile");
//const __filename = module.filename.split('/').slice(-1);
const configModule = require("../../module/configModule");
const prjConfig = require("../../config.json");
const { jwtToken } = require("../../system/jwt/jwt");
const appSystem = require("../../system/core/appSystem");
const appSystemObj = new appSystem();
const path = require("path");
global.Config = require("config");
global.Models = require("../../module/model");
const {
  DEFAULT_USER_IMAGE,
  ROLES,
  USER_STATUS,
  ACTIVATED_BY,
  STATUS,
} = require("../../constants");
global.DEFAULT_USER_IMAGE = DEFAULT_USER_IMAGE;
global.ROLES = ROLES;
global.USER_STATUS = USER_STATUS;
global.STATUS = STATUS;
global.ACTIVATED_BY = ACTIVATED_BY;
const Fs = require("fs");

const commonFunctions = require("../../module/services/commonFunctions");

apppipeline.post("/", async (req, res) => {
  try {
    if (req.body.action == undefined) {
      record = await commonFunctions.payment_details_store(req);
      data = record.response;

      res.status(200).json({
        statusCode: 1,
        status: "success",
        message: "success",
        data: data,
      });
    }

    const postData = req.body;
    // const headers = req.headers.host;
    // // console.log(headers, "header ---- >>>")
    // //const hostOrigin = req.protocol + '://' + req.get('host');
    // const hostOrigin = headers;
    // postData['hostOrigin'] = hostOrigin
    // const authData = await appSystemObj.getShopInfo(req.headers);
    const authData = req?.headers.authorization;
    let data = postData;
    console.log("lololo", data);
    // data["auth"] = authData;
    switch (postData.action) {
      case "command":
        userLogger.error(
          __filename,
          `Calling command function(callingCommand(data) data = ${JSON.stringify(
            data,
            null,
            4
          )}`
        );
        userLogger.error(
          __filename,
          `Calling command data = ${JSON.stringify(authData)}`
        );
        data = await callingCommand(data, authData);
        break;
      case "formcommand":
        userLogger.error(
          __filename,
          `Calling command function(callingCommand(data) data = ${JSON.stringify(
            data,
            null,
            4
          )}`
        );
        userLogger.error(
          __filename,
          `Calling command data = ${JSON.stringify(authData)}`
        );
        data = await commonFunctions.file_upload(req);
        data = data.response;
        console.log(data);
        break;
      default:
        userLogger.error(
          __filename,
          `Action not found  ${JSON.stringify(postData)}`
        );
        res.status(200).json({
          statusCode: 0,
          status: "warnning",
          message: "please check action command",
          data: data,
        });
        break;
    }

    res.status(200).json({
      statusCode: 1,
      status: "success",
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(200).json({
      statusCode: 0,
      status: "erroe",
      message: "faile by generate exception",
      data: error.stack,
    });
  }
});

const callingCommand = async (data, authData) => {
  userLogger.error(
    __filename,
    `In function(callingCommand(data) action = ${data.action}`
  );
  userLogger.error(
    __filename,
    `In function(callingCommand(data) command = ${data.command}`
  );
  console.log("calling cammand", data);
  const commands = data.command;
  let fullData = [];
  for (let key in commands) {
    console.log("Default ", "../../" + configModule[commands[key]["agent"]]);
    const agent = require("../../" + configModule[commands[key]["agent"]]);
    const agentObj = new agent();
    console.log("agent baba", agentObj);
    data = await agentObj.process(data, authData);
    console.log("agent + data", data);
    //console.log(JSON.stringify(data)+'data inside pipeline');
    if (data.response && data.response.code != 1) {
      userLogger.error(
        __filename,
        `Error on Agent ${commands[key]["agent"]}  ${data.action}`
      );
      //throw new Error(`${data.response.message}`);
      return data.response;
    }
  }
  if (data.response && data.response.code === 1) {
    userLogger.error(
      __filename,
      `afterIn function(callingCommand(data) data = ${JSON.stringify(data)}`
    );
    return data;
  } else {
    return data;
  }
};
module.exports = apppipeline;
