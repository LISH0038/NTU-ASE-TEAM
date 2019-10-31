var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Canvas = require('canvas');

var classRouter = require('./routes/class');
var recognitionRouter = require('./routes/recognition');
var registerRouter = require('./routes/register');
var recordRouter = require('./routes/record');
var getRecDataRouter = require('./routes/getRecData');
var reportRouter = require('./routes/report');
var bodyParser = require('body-parser');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/generateRecData', getRecDataRouter);
app.use('/index', classRouter);
app.use('/recognition', recognitionRouter);
app.use('/register', registerRouter);
app.use('/report', reportRouter);
app.use('/record', recordRouter);

module.exports = app;
