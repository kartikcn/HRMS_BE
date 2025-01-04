const mysql = require('mysql2');
const { userLogger } = require('../../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const config = require("../../../config.json");
// Create the connection pool. The pool-specific settings are the defaults
class mysqli {
    constructor() {

    }
    getConnectioPool() {
        return mysql.createPool({
            host: config.DB.host,
            user: config.DB.user,
            password: config.DB.password,
            database: config.DB.dbname,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

    }
    async getSelectQueryData(query, params, pool = null) {
        pool = pool || this.getConnectioPool();
        try {
            userLogger.info(__filename, `User Data getSelectQueryData() ${query}` + `${JSON.stringify(params, null, 4)}`);
            const promisePool = pool.promise();
            // query database using promises
            const [rows, fields] = await promisePool.execute(query, params);
            // console.log(rows);
            return rows;
        } catch (error) {
            userLogger.error(__filename, `Error ${query}` + `${JSON.stringify(error.stack, null, 4)}`);
        } finally {
            pool.end();
        }
        return null;
    }
    async setQueryData(query, params, pool = null) {
        pool = pool || this.getConnectioPool();
        try {
            userLogger.info(__filename, `User setQueryData insede ${query}` + `${JSON.stringify(params, null, 4)}`);
            const promisePool = pool.promise();
            // query database using promises
            const [rows, fields] = await promisePool.execute(query, params);
            // console.log("fields", fields);
            return rows;
        } catch (error) {
            userLogger.error(__filename, `Error ${query}` + `${JSON.stringify(error.stack, null, 4)}`);
        } finally {
            pool.end();
        }

        return null;

    }

    async processFilter(params, table) {
        userLogger.info(__filename, `start executing processFilter` + `${JSON.stringify(params, null, 4)}`);
        try {
            if (params?.filter) {
                const filter = params?.filter;
                const filters = filter?.filters;
                let logic = " ";
                return new Promise(async (resolve, reject) => {
                    let where = "";
                    let limit = "";
                    let wflag = false;
                    for (let index in filters) {
                        wflag = true;
                        let value = filters[index];
                        if (index > 0) {
                            logic = filter?.logic;
                        }
                        if (table) {
                            where = where.concat(await this.processFiltersValue(value, logic, table));
                        } else {
                            where = where.concat(await this.processFiltersValue(value, logic));
                        }

                    }
                    if (filter?.sort) {
                        const sort = filter?.sort;
                        // console.log("sort", sort[0].field);
                        if (sort) {
                            for (let index in sort) {
                                if (index == 0) {
                                    let value = sort[index];
                                    where = where.concat(` ORDER BY \`${value?.field}\` ${value?.dir} `);
                                }
                            }

                        }
                        if (filter?.limit || filter?.offset) {
                            limit = limit.concat(` LIMIT ${filter?.offset}, ${filter?.limit} `);
                        }
                        resolve({ code: 1, message: "resolve", rdata: where, rlimit: limit, "where": wflag });
                    } else {
                        reject({ code: 0, message: "reject" });
                    }
                }).then(async (rdata) => { return rdata; }).catch(async (error) => { return error; });
            }
            else {
                userLogger.info(__filename, `Invalid filter format please provide valid filter input`);
                return { code: 0, message: "reject" };
            }
        } catch (error) {
            userLogger.info(__filename, `catch error` + `${JSON.stringify(error, null, 4)}`);
            return { code: 0, message: "reject" };
        }

    }
    async processFiltersValue(filters, logic, tableName = null) {
        let processString = " ";
        const dot = '.';
        if (tableName == null) {
            switch (filters?.operator) {
                case "eq":
                    processString += ` ${logic} ` + `${filters?.field}` + " = " + `\'${filters?.value}\'`;

                    break;
                case "neq":
                    processString += ` ${logic} ` + `${filters?.field}` + " != " + `\'${filters?.value}\'`;
                    break;
                case "contain":
                    processString += ` ${logic} ` + `${filters?.field}` + " LIKE " + `\'%${filters?.value}%\'`;
                    break;
                case "notcontain":
                    processString += ` ${logic} ` + `${filters?.field}` + " NOT LIKE " + `\'%${filters?.value}%\'`;
                    break;
                case "less":
                    processString += ` ${logic} ` + `${filters?.field}` + " < " + `\'${filters?.value}\'`;
                    break;
                case "gret":
                    processString += ` ${logic} ` + `${filters?.field}` + " > " + `\'${filters?.value}\'`;
                    break;
                case "lesseq":
                    processString += ` ${logic} ` + `${filters?.field}` + " <= " + `\'${filters?.value}\'`;
                    break;
                case "greteq":
                    processString += ` ${logic} ` + `${filters?.field}` + " >= " + `\'${filters?.value}\'`;
                    break;
                default:
                    processString += "operator not found";
                    break;
            }
            userLogger.info(__filename, ` processString if` + `${JSON.stringify(processString, null, 4)}`);
        } else {
            var table = filters?.table ? filters?.table : tableName;
            switch (filters?.operator) {

                case "eq":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " = " + `\'${filters?.value}\'`;
                    break;
                case "neq":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " != " + `\'${filters?.value}\'`;
                    break;
                case "contain":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " LIKE " + `\'%${filters?.value}%\'`;
                    break;
                case "notcontain":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " NOT LIKE " + `\'%${filters?.value}%\'`;
                    break;
                case "less":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " < " + `\'${filters?.value}\'`;
                    break;
                case "gret":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " > " + `\'${filters?.value}\'`;
                    break;
                case "lesseq":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " <= " + `\'${filters?.value}\'`;
                    break;
                case "greteq":
                    processString += ` ${logic} ` + `${table}` + `${dot}` + `${filters?.field}` + " >= " + `\'${filters?.value}\'`;
                    break;
                default:
                    processString += "operator not found";
                    break;
            }
            userLogger.info(__filename, ` processString else` + `${JSON.stringify(processString, null, 4)}`);
        }

        return processString;
    }
}
module.exports = { mysql: new mysqli() };