var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var classRouter = require('./routes/class');
var recognitionRouter = require('./routes/recognition');
var registerRouter = require('./routes/register');
var recordRouter = require('./routes/record');

var app = express();

var cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/index', classRouter);
app.use('/recognition', recognitionRouter);
app.use('/register', registerRouter);
app.use('/record', recordRouter);

module.exports = app;
