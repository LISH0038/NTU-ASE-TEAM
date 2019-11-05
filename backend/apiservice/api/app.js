let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let Canvas = require('canvas');

let classRouter = require('./routes/class');
let recognitionRouter = require('./routes/recognition');
let registerRouter = require('./routes/register');
let recordRouter = require('./routes/record');
let getRecDataRouter = require('./routes/getRecData');
let reportRouter = require('./routes/report');
let bodyParser = require('body-parser');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


let cors = require('cors');
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
