
'use strict';

/**
 * @description application logger
 */

//dependencies
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');


const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            level: process.env.LOGGER_CONSOLE_LEVEL || 'debug',
            color: true
        }),
        new (winston.transports.DailyRotateFile)({
            filename: `app-%DATE%.log`,
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true,
            level: process.env.LOGGER_FILE_LEVEL || 'info',
            dirname: path.join(__dirname, '..', '..', 'logs')
        })
    ]
});

// export the logger
module.exports = logger;
