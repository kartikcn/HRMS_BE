const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
const yourDate = new Date();
let fileName = `./logs/Application_${yourDate.toISOString().split('T')[0]}`
var __filename = module.filename.split('/').slice(-1);

const userLogger = createLogger({
    level: 'info',
    format: combine(
        label({ label: __filename }),
        timestamp(),
        myFormat
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: `${fileName}.log` })
    ]
});
module.exports = userLogger;

/*
Log lables
0: error 
1: warn
2: info
3: verbose
4: debug
5: silly
*/