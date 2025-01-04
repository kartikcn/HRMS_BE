const { encrypt, decrypt } = require('../../crypto/EcryAndDcry');

const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const { mysql } = require('../../system/database/mysql/mysqlConnection');
const config = require("../../config.json");
const { jwtToken } = require('../../system/jwt/jwt');
const fs = require('fs');
// file.use(fileUpload());
class fileSystem {
    constructor() { }
    async getDataFromTable(tablename, data, coloumString) {
        try {
            let filterWhereQuery = [];
            if (data?.filter) {
                userLogger.info(__filename, 'Start processing filter ' + JSON.stringify(data?.filter, null, 4));
                filterWhereQuery = await mysql.processFilter(data?.filter);
            } else {
                userLogger.info(__filename, 'Start processing without filter ');
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
            }
            userLogger.info(__filename, 'filterWhereQuery ' + JSON.stringify(filterWhereQuery, null, 4));
            if (filterWhereQuery.code === 1) {
                let query = `SELECT ${coloumString} FROM ${tablename}`;
                let queryCount = `SELECT ${coloumString} FROM ${tablename}`;
                userLogger.info(__filename, "filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
                var rdata = "";
                var rlimit = "";
                if (filterWhereQuery?.rdata) {
                    rdata = filterWhereQuery?.rdata;
                    rlimit = filterWhereQuery?.rlimit;
                    if (filterWhereQuery?.where) {
                        query = query + " WHERE  " + rdata + " " + rlimit;
                        queryCount = queryCount + " WHERE " + rdata;
                    } else {
                        query = query + "  " + rdata + " " + rlimit;
                        queryCount = queryCount + "  " + rdata;
                    }
                }
                //const query = "SELECT * FROM qq_section_category WHERE " + filterWhereQuery?.rdata;
                userLogger.info(__filename, "shop querye  " + query);
                const pool = null;
                //pool.promise();
                return new Promise(async (resolve, reject) => {
                    try {
                        // console.log("Default ",__dirname);
                        userLogger.info(__filename, `Query ${query}`);

                        let rows = await mysql.getSelectQueryData(query, [], pool);
                        let rowsCount = await mysql.getSelectQueryData(queryCount, [], pool);
                        console.log("length", Object.keys(rowsCount).length);
                        data.response = { "status": "success", "code": 1, "message": "Lists......", 'rows': rows, "count": Object.keys(rowsCount).length };
                        resolve(data);
                    } catch (error) {
                        data.error = { "status": "failed", "code": 0, "message": `Erro on filter` };
                        reject(data);
                    }
                }).then((data) => {

                    return data;
                }).catch((error) => {

                    return error;
                });
            } else {
                userLogger.info(__filename, "erro on filter filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
            }
        } catch (error) {
            userLogger.info(__filename, 'Error' + JSON.stringify(error, null, 4));
        }

    }

    async getDataFromJoinTable(data, query, table) {
        try {
            let filterWhereQuery = [];
            let queryCount = query;
            if (data?.filter) {
                userLogger.info(__filename, 'Start processing filter ' + JSON.stringify(data?.filter, null, 4));
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
            } else {
                userLogger.info(__filename, 'Start processing without filter ');
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
                // filterWhereQuery.code = 1;
            }
            if (filterWhereQuery.code === 1) {
                //let query = `SELECT ${coloumString} FROM ${tablename}`;
                userLogger.info(__filename, "filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
                var rdata = "";
                if (filterWhereQuery?.rdata) {
                    var rdata = filterWhereQuery?.rdata;
                    if (filterWhereQuery?.where) {
                        query = query + " WHERE  " + rdata;
                    } else {
                        query = query + "  " + rdata;
                    }
                }
                queryCount = query;
                if (filterWhereQuery?.rlimit) {
                    var rlimit = filterWhereQuery?.rlimit;
                    query = query + "  " + rlimit;
                }
                //const query = "SELECT * FROM qq_section_category WHERE " + filterWhereQuery?.rdata;
                userLogger.info(__filename, "shop querye  " + query + rdata);
                const pool = null;
                return new Promise(async (resolve, reject) => {
                    try {
                        // console.log("Default ",__dirname);
                        userLogger.info(__filename, `Query ${query}`);
                        let rowsCount = await mysql.getSelectQueryData(queryCount, [], pool);
                        let rows = await mysql.getSelectQueryData(query, [], pool);
                        console.log("length", Object.keys(rows).length);
                        data.response = { "status": "success", "code": 1, "message": "Lists......", 'rows': rows, "count": Object.keys(rowsCount).length };
                        resolve(data);
                    } catch (error) {
                        data.error = { "status": "failed", "code": 0, "message": `Erro on filter` };
                        reject(data);
                    } finally {

                    }
                }).then((data) => {
                    return data;
                }).catch((error) => {
                    return error;
                });
            } else {
                userLogger.info(__filename, "erro on filter filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
            }
        } catch (error) {
            userLogger.info(__filename, 'Error' + JSON.stringify(error, null, 4));
        }

    }
    async getQueryFromJoinTable(data, query, table) {
        try {
            let filterWhereQuery = [];
            let queryCount = query;
            if (data?.filter) {
                userLogger.info(__filename, 'Start processing filter ' + JSON.stringify(data?.filter, null, 4));
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
            } else {
                userLogger.info(__filename, 'Start processing without filter ');
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
                // filterWhereQuery.code = 1;
            }
            if (filterWhereQuery.code === 1) {
                //let query = `SELECT ${coloumString} FROM ${tablename}`;
                userLogger.info(__filename, "filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
                var rdata = "";
                if (filterWhereQuery?.rdata) {
                    var rdata = filterWhereQuery?.rdata;
                    if (filterWhereQuery?.where) {
                        query = query + " WHERE  " + rdata;
                    } else {
                        query = query + "  " + rdata;
                    }
                }
                queryCount = query;
                if (filterWhereQuery?.rlimit) {
                    var rlimit = filterWhereQuery?.rlimit;
                    query = query + "  " + rlimit;
                }
                //const query = "SELECT * FROM qq_section_category WHERE " + filterWhereQuery?.rdata;
                userLogger.info(__filename, "shop querye  " + query + rdata);

            } else {
                userLogger.info(__filename, "erro on filter filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
            }
        } catch (error) {
            userLogger.info(__filename, 'Error' + JSON.stringify(error, null, 4));
        }
        return query

    }
    async getQueryFromJoinTableExternal(data, query, table, wherse = null) {
        try {
            let filterWhereQuery = [];
            let queryCount = query;
            if (data?.filter) {
                userLogger.info(__filename, 'Start processing filter ' + JSON.stringify(data?.filter, null, 4));
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
            } else {
                userLogger.info(__filename, 'Start processing without filter ');
                filterWhereQuery = await mysql.processFilter(data?.filter, table);
                // filterWhereQuery.code = 1;
            }
            if (filterWhereQuery.code === 1) {
                //let query = `SELECT ${coloumString} FROM ${tablename}`;
                userLogger.info(__filename, "filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
                var rdata = "";
                if (filterWhereQuery?.rdata) {
                    var rdata = filterWhereQuery?.rdata;
                    if (filterWhereQuery?.where && wherse != null) {
                        query = query + " WHERE  " + wherse + " " + rdata;
                    } else if (filterWhereQuery?.where) {
                        query = query + " WHERE  " + rdata;
                    } else {
                        query = query + "  " + rdata;
                    }
                }
                queryCount = query;
                if (filterWhereQuery?.rlimit) {
                    var rlimit = filterWhereQuery?.rlimit;
                    query = query + "  " + rlimit;
                }
                //const query = "SELECT * FROM qq_section_category WHERE " + filterWhereQuery?.rdata;
                userLogger.info(__filename, "shop querye  " + query + rdata);

            } else {
                userLogger.info(__filename, "erro on filter filterWhereQuery" + JSON.stringify(filterWhereQuery, null, 4));
            }
        } catch (error) {
            userLogger.info(__filename, 'Error' + JSON.stringify(error, null, 4));
        }
        return query

    }


    async uploadFile(req) {
        let urls = [];
        try {

            for (let index in req.files.file) {
                userLogger.info(__filename, "uploaded paths " + JSON.stringify(req.files));

                let files = req.files.file[index];
                let flagSingle = false;
                if (index === "name") {
                    files = req.files.file;
                    flagSingle = true;
                }
                urls.push(await this.processUpload(index, req, files));
                if (flagSingle) {
                    console.log("rest");
                    break;
                }
            }
            return urls;
        } catch (error) {
            return error;
        }

    }

    async processUpload(index, req, files) {
        let urls = [];
        return new Promise(async (resolve, reject) => {
            console.log("bypass", req?.body?.bypass);
            let params = [];
            if (!req?.body?.bypass) {
                const authData = await jwtToken.getTokenData(req);
                params = [req?.body?.category, authData.userId, filePermission];
            } else {
                params = [req?.body?.category, 1, 0];
            }
            let filePermission = 0;//0=public 1=protected

            const pool = null;
            let insertQuery = "INSERT INTO `qq_files`( `uuid`, `category` , `createdBy`, `permission`) VALUES (uuid(),?,?,?)";

            let result = await mysql.setQueryData(insertQuery, params, pool);
            if (result) {
                let selectQuery = "SELECT uuid, fileId FROM `qq_files` WHERE fileId=?";
                params = [result.insertId];
                let rows = await mysql.getSelectQueryData(selectQuery, params, pool);
                let uploadPath;
                if (!req?.body?.bypass) {
                    uploadPath = `${config.uploadPath}${authData.uuid}/${rows[0].uuid}/`;
                } else {
                    const iod = "app";
                    uploadPath = `${config.uploadPath}${iod}/${rows[0].uuid}/`;
                }

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, {
                        recursive: true
                    });
                }
                uploadPath = uploadPath + files.name;
                await files.mv(uploadPath, async (err) => {
                    if (err) {
                        throw 'Erro on file transfer ' + err;
                    } else {
                        files.data = [{ path: uploadPath }];
                        //let url = config.baseUrl + "fileview/" + rows[0].uuid + "/" + files.name;
                        let url = "/fileview/" + rows[0].uuid + "/" + files.name;
                        //urls.push({ "uri": encodeURI(url) });
                        files.category = req.body.category;
                        let updateQuery = `UPDATE \`qq_files\` SET \`url\`='${encodeURI(url)}',  \`filename\`='${files.name}',  \`data\`='${JSON.stringify(files)}' WHERE  fileId=? `;
                        await mysql.setQueryData(updateQuery, params, pool);
                        userLogger.info(__filename, "uploaded data " + JSON.stringify(params, null, 4));
                        resolve({ "uri": encodeURI(url), "fileData": files, "uuid": rows[0].uuid, "fileId": rows[0].fileId });
                    }

                });

            }
        }).then((urls) => { return urls; });
    }

    async processUploadFile(files, category, name) {
        let urls = [];
        return new Promise(async (resolve, reject) => {
            let params = [category, 1, 0];
            let filePermission = 0;//0=public 1=protected

            const pool = null;
            let insertQuery = "INSERT INTO `qq_files`( `uuid`, `category` , `createdBy`, `permission`) VALUES (uuid(),?,?,?)";

            let result = await mysql.setQueryData(insertQuery, params, pool);
            if (result) {
                let selectQuery = "SELECT uuid FROM `qq_files` WHERE fileId=?";
                params = [result.insertId];
                let rows = await mysql.getSelectQueryData(selectQuery, params, pool);
                let uploadPath;
                const iod = "app_" + Date.now();
                uploadPath = `${config.uploadPath}${iod}/${rows[0].uuid}/`;

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, {
                        recursive: true
                    });
                }
                uploadPath = uploadPath + name;
                let file={};
                fs.writeFileSync(uploadPath, files);
                file.data = [{ path: uploadPath }];
                let url = config.baseUrl + "fileview/" + rows[0].uuid + "/" + name;
                //urls.push({ "uri": encodeURI(url) });
                file.category = category;
                let updateQuery = `UPDATE \`qq_files\` SET \`url\`='${encodeURI(url)}',  \`filename\`='${name}',  \`data\`='${JSON.stringify(file)}' WHERE  fileId=? `;
                await mysql.setQueryData(updateQuery, params, pool);
                userLogger.info(__filename, "uploaded data " + JSON.stringify(params, null, 4));
                resolve({ "uri": encodeURI(url), "fileData": file, "uuid": rows[0].uuid });
                // await files.mv(uploadPath, async (err) => {
                //     if (err) {
                //         throw 'Erro on file transfer ' + err;
                //     } else {

                //     }

                // });

            }
        }).then((urls) => { return urls; });
    }
}

module.exports = fileSystem;