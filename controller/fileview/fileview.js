const fileview = require('express').Router();
const fileUpload = require('express-fileupload');
const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');

const { mysql } = require('../../system/database/mysql/mysqlConnection');


var fs = require('fs');
const e = require('express');


fileview.use(fileUpload());

fileview.post('/', async (req, res) => {
    res.send("ok");
});
fileview.delete('/:uuid', async (req, res) => {

    const pool = null;
    try {
        let selectQuery = "SELECT * FROM `qq_files` WHERE `uuid`= ? ";
        const params = [req.params.uuid];
        let rows = await mysql.getSelectQueryData(selectQuery, params, pool);
        const path = rows[0]?.data?.data[0]?.path;

        if (rows[0]?.permission === 1) {
            const authData = await jwtToken.getTokenData(req);
            if (authData) {
                if (fs.existsSync(path)) {
                    // Delete the file
                    let selectQuery = "DELETE FROM `qq_files` WHERE `uuid`= ? ";
                    console.log(selectQuery);
                    await mysql.getSelectQueryData(selectQuery, params, pool);
                    fs.unlink(path, (error) => {
                        if (error) {
                            console.error('Error deleting the file:', error);
                        } else {
                            console.log('File deleted successfully.');
                            res.status(200).json({ "statusCode": 1, "status": "success", "message": "file deleted" });
                        }
                    });
                } else {
                    console.log('File does not exist.');
                }

            } else {
                res.status(200).json({ "statusCode": 0, "status": "permission error", "message": "Permission required" });
            }

        } else {

            if (fs.existsSync(path)) {
                // Delete the file
                let selectQuery = "DELETE FROM `qq_files` WHERE `uuid`= ? ";
                console.log(selectQuery);
                await mysql.getSelectQueryData(selectQuery, params, pool);
                fs.unlink(path, (error) => {
                    if (error) {
                        console.error('Error deleting the file:', error);
                        res.status(200).json({ "statusCode": 0, "status": "permission error", "message": "Permission required" });
                    } else {
                        console.log('File deleted successfully.');
                        res.status(200).json({ "statusCode": 1, "status": "success", "message": "file deleted" });
                    }
                });
            } else {
                console.log('File does not exist.');
                res.status(200).json({ "statusCode": 0, "status": "permission error", "message": "Permission required" });
            }
        }

    } catch (error) {
        userLogger.info(__filename, 'catch addSectionVersion ' + JSON.stringify(error.stack, null, 4));
    } finally {

    }

});
fileview.get('/:uuid/:filename', async (req, res) => {

    const pool = null;
    try {
        let selectQuery = "SELECT * FROM `qq_files` WHERE `uuid`= ? and `filename`=?";
        const params = [req.params.uuid, req.params.filename];
        let rows = await mysql.getSelectQueryData(selectQuery, params, pool);
        const path = rows[0]?.data?.data[0]?.path;

        if (rows[0]?.permission === 1) {
            const authData = await jwtToken.getTokenData(req);
            if (authData) {
                res.download(path, function (err) {
                    if (err) {
                        console.log(err);
                    }
                })
            } else {
                res.status(200).json({ "statusCode": 0, "status": "permission error", "message": "Permission required" });
            }

        } else {

            res.download(path, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }

    } catch (error) {
        userLogger.info(__filename, 'catch addSectionVersion ' + JSON.stringify(error.stack, null, 4));
    } finally {

    }

});




module.exports = fileview;