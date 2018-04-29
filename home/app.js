const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const lessMiddleware = require('less-middleware');
const session = require('express-session');
const busboy = require('connect-busboy');

const c = require('./includes/config');
const f = require('./includes/functions');
const db = require('./includes/db');
const fm = require('./includes/file-manager');

const index = require('./routes/index');
const projects = require('./routes/projects');
const skills = require('./routes/skills');
const life = require('./routes/life');
const collections = require('./routes/collections');
const users = require('./routes/users');
const uploads = require('./routes/uploads');

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
app.use(busboy());
app.use(session({
  secret: c.auth.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/projects', projects);
app.use('/skills', skills);
// app.use('/life', life);
// app.use('/collections', collections);
app.use('/users', users);
app.use('/uploads', uploads);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404);
  
  if (req.xhr) {
    res.json({
      err: {
        msg: 'Not found.'
      }
    });
  } else {
    res.render('404', f.data({
      title: '#404',
      url: req.url
    }, req));
  }
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  console.error('An error has occured', err.message, err);
  
  if (req.xhr) {
    res.json({
      err: {
        msg: err.message,
        fields: err.fields
      }
    });
  } else {
    res.render('error', f.data({
      title: 'Error',
      msg: err.message,
      status: err.status ? err.status : 500,
      err: req.app.get('env') === 'development' ? err : {}
    }, req));
  }
});

if (c.env === 'development') {
  app.use(require('connect-livereload')({
    port: 35729
  }));
}

module.exports = app;