const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const lessMiddleware = require('less-middleware');
const session = require('express-session');

const c = require('./includes/config');
const db = require('./includes/db');
const fm = require('./includes/file-manager');

const index = require('./routes/index');
const projects = require('./routes/projects');
const life = require('./routes/life');
const collections = require('./routes/collections');
const users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(db);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: c.auth.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/projects', projects);
app.use('/life', life);
app.use('/collections', collections);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect('/404');
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

if (c.env === 'development') {
  app.use(require('connect-livereload')({
    port: 35729
  }));
}

module.exports = app;