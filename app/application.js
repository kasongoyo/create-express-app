
'use strict';

//dependencies
const path = require('path');
require('dotenv').config(); // init dotenv 
const mkdir = require('mkdir-p');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressWinston = require('express-winston');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ForbiddenError } = require('@casl/ability')
const createError = require('http-errors');

//build logs directory if does not exists
mkdir.sync(path.join(__dirname, '..', 'logs'));


// create an express application
const app = express();

//setup winston application logger
const winston = require(path.join(__dirname, 'config', 'winston'));

//setup application mongoose instance
require(path.join(__dirname, 'config', 'mongoose'));


// load all models recursively
require('require-all')({
    dirname: __dirname,
    filter: /(.+_model)\.js$/,
    excludeDirs: /^\.(git|svn|md)$/
});

// setup public directories
app.use(express.static(path.join(__dirname, '..', 'public')));

// middleware to enable cors
app.use(cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'x-xsrf_token'],
    credentials: true
}));

// middleware to parse text/plain request 
app.use(bodyParser.text());
// middleware to parse application/json request 
app.use(bodyParser.json());
// middleware to parse query string
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(methodOverride('_method'));

// middleware to parse cookie
app.use(cookieParser());

// app http request logger
app.use(expressWinston.logger({
    winstonInstance: winston
}));

// app errors pipeline logger
app.use(expressWinston.errorLogger({
    winstonInstance: winston
}));

// load all routers recursively
require('require-all')({
    dirname: __dirname,
    filter: /(.+_router)\.js$/,
    excludeDirs: /^\.(git|svn|md)$/,
    resolve: function (router) {
        app.use('/api', router);
    }
});

// catch 404 and forward to error handler
app.use('/*', function (request, response, next) {
    const error = createError(404, 'Not Found');
    next(error);
});



/**
 * @callback errorHandlerCallback
 * error handlers
 * @param {Object} error - Error throwed 
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {errorHandlerCallback} next - Callback never used in this function but it's important
 * to remain for expressjs to recognize this function as error middleware. 
 * Note:
 * If you remove the callback among function parameters then this function will never get executed
 * when an error is throwing. 
 */
function errorHandler(error, req, res, next) { //eslint-disable-line  no-unused-vars
    winston.error(error); // print error into console and error log
    const { message, statusCode } = error;

    if (error instanceof ForbiddenError) {
        res.status(403).json({ message });
        return;
    }
    res.status(statusCode || 500);
    res.json({ message });
}

// handle error
app.use(errorHandler);


//export express application
module.exports = app;

