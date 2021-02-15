var express = require('express'),
    app = express(),
    path = require('path'),
    publicDir = path.join(__dirname, './public'),
    bodyParser = require('body-parser')
;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
* Routers para peticiones al backend de la aplicacion, mediante en endpoint 'api'
*/
app.use('/api', require('./routers/apiRouter'));
console.log('Mode: ' + process.env.NODE_ENV, 'Port: ' + process.env.PORT);

/**
* Middleware para tratamiento de errores
*/
app.use(function(err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};
   // render the error page
   res.status(err.status || 500);
   //res.render('error');
   res.send('Error  => ' + res.locals.message);
});

module.exports = app;
