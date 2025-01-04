const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const config = require('./config.json');

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

class LoggerFile {
    constructor() {}

    createLoggerInstance(level, filename) {
        const yourDate = new Date();
        const fileName = `./logs/Application_${yourDate.toISOString().split('T')[0]}`;

        return createLogger({
            level,
            format: combine(
                label({ label: filename }),
                timestamp(),
                myFormat
            ),
            transports: [
                new transports.File({ filename: `${fileName}.log` })
            ]
        });
    }

    async log(level, filename, info) {
        if (config?.log) {
            const logger = this.createLoggerInstance(level, filename);
            logger.log({
                level,
                message: info,
                label: filename
            });
        }
    }

    async info(filename, info) {
        await this.log('info', filename, info);
    }

    async error(filename, info) {
        await this.log('error', filename, info);
    }

    async warn(filename, info) {
        await this.log('warn', filename, info);
    }

    async verbose(filename, info) {
        await this.log('verbose', filename, info);
    }

    async debug(filename, info) {
        await this.log('debug', filename, info);
    }

    async silly(filename, info) {
        await this.log('silly', filename, info);
    }

    async createLog(filename, info, type) {
        switch (type) {
            case "info":
                await this.info(filename, info);
                break;
            case "error":
                await this.error(filename, info);
                break;
            case "warn":
                await this.warn(filename, info);
                break;
            case "verbose":
                await this.verbose(filename, info);
                break;
            case "debug":
                await this.debug(filename, info);
                break;
            case "silly":
                await this.silly(filename, info);
                break;
            default:
                break;
        }
    }
}

module.exports = { userLogger: new LoggerFile() };
