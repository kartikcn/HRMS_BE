const { encrypt, decrypt } = require('../../crypto/EcryAndDcry');

const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const { mysql } = require('../../system/database/mysql/mysqlConnection');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');
const fs = require('fs');
const { resolve } = require('path');
// file.use(fileUpload());
class appSystem {
    constructor() { }
    async getShopInfo(header) {
        userLogger.info(__filename, "shopdoamin " + JSON.stringify(header?.shop, null, 4));
        let select = "SELECT * FROM `qq_shop` WHERE `shop`=? and isDeleted=?";
        const pool = null;
        const params = [header?.shop, "1"];
        return new Promise(async (resolve) => { resolve(await mysql.getSelectQueryData(select, params, pool)); }).then((row) => { return row[0]; });


    }

    async getShopInfoByValue(shop) {
        userLogger.info(__filename, "shopdoamin " + JSON.stringify(shop, null, 4));
        let select = "SELECT * FROM `shopify_sessions` WHERE `shop`=? ";
        const pool = null;
        const params = [shop];
        return new Promise(async (resolve) => { resolve(await mysql.getSelectQueryData(select, params, pool)); }).then((row) => { return row[0]; });


    }

}

module.exports = appSystem;