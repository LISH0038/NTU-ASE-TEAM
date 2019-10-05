var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var courseRouter = require('./routes/course');
var recognitionRouter = require('./routes/recognition');
var registerRouter = require('./routes/register');
var recordRouter = require('./routes/record');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/index', courseRouter);
app.use('/recognition', recognitionRouter);
app.use('/register', registerRouter);
app.use('/record', recordRouter);

module.exports = app;
