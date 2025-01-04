const file = require('express').Router();
const fileUpload = require('express-fileupload');
const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
// const configModule = require('../../module/configModule');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');
const { mysql } = require('../../system/database/mysql/mysqlConnection');
const fileSystem = require('../../system/core/fileSystem');
const fsy = new fileSystem();
var fs = require('fs');
file.use(fileUpload());

file.post('/', async (req, res) => {
    res.send("ok");
});
file.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const urls = await fsy.uploadFile(req);
    if (typeof urls !== 'undefined' && urls.length != 0) {
        res.send({ "status": "success", "code": 1, "message": "file uploaded ....", "data": urls });
    }
    else {
        res.send({ "status": "failed", "code": 0, "message": "file not uploaded ....", "error": urls });
    }
});
file.post('/view', async (req, res) => {
    res.send("ok");
});


module.exports = file;