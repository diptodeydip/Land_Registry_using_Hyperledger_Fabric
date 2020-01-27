var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var hbs = require('express-handlebars');
var exphbs  = require('express-handlebars');

//we have to install this specific validator version using this command -> npm i express-validator@5.3.1
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var bodyParser     =   require("body-parser");
var indexRouter = require('./routes/index');
var assetRouter = require('./routes/asset');
var requestRouter = require('./routes/request');
var adminRouter = require('./routes/admin');
var notificationRouter = require('./routes/notification');

var app = express();

// view engine setup
var hbs = exphbs.create({
  extname: 'hbs' ,
  defaultLayout: 'layout' ,
  layoutsDir: __dirname + '/views/layouts/' ,
  helpers: {
    if_eq: function(a, b, opts) {
      if (a == b) {
          return opts.fn(this);
      } else {
          return opts.inverse(this);
      }
      },

    joinPath: function(a , b){
      return a+b ;
    },

    print: function (a){
      return a;
    }

  }
});

app.engine('hbs',hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: 'max' , saveUninitialized: false , resave: false}));

app.use('/user', indexRouter);
app.use('/asset', assetRouter);
app.use('/request', requestRouter);
app.use('/admin', adminRouter);
app.use('/notification', notificationRouter);

//Image Url match korar jnno ei portion 
  app.use('/admin/ViewAsset', express.static('public/asset'));
  app.use('/admin', express.static('public/asset'));
  app.use('/asset', express.static('public/asset'));
  app.use('/user', express.static('public/user'));
  // app.use('/request', express.static('public/request'));
  app.use('/asset/ViewAsset', express.static('public/asset'));

//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
