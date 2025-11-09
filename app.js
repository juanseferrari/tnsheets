var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv/config')

const esRouter = require('./src/routes/es-routes');
const apiRouter = require('./src/routes/api-routes');
const dashboardRouter = require('./src/routes/dashboard-routes');

const langService = require('./src/services/lang-service');

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Host-based routing for dashboard.sheetscentral.com
app.use((req, res, next) => {
  const host = req.hostname;
  if (host === 'dashboard.sheetscentral.com') {
    return dashboardRouter(req, res, next);
  }
  next();
});

app.use('/', esRouter);
app.use('/api/', apiRouter);

// Middleware to handle JavaScript files in the 'public/js' folder
app.use('/js', (req, res, next) => {
  // Check if the request URL starts with '/js'
  if (req.originalUrl.startsWith('/js')) {
    // If it does, skip the error handling middleware and serve the JavaScript file directly
    return next();
  }
  // If not, continue to the next middleware (your existing error-handling middleware)
  next();
});

app.use(async (req, res, next) => {
  let navbar_data = { active: false, name: '', logo_url: '' }
  let lang_object = await langService.language(req.query.lang)
  let google_user = ""
  let google_user_id = ""

  let message = "Esta página no existe."
  res.status(404).render("menus/error-page", { message,navbar_data, lang_object, google_user,google_user_id })
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 5001)
console.log("Server is running on port " + 5001)
module.exports = app;
