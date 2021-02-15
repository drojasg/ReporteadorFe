const app = require('./app'),
    debug = require('debug')('myapp:server'),
    http = require('http'),
    express = require('express'),
    path = require('path'),
    publicDir = path.join(__dirname, '../../dist'),
    port = normalizePort(process.env.PORT || 9000),
    sendFile = path.join(__dirname, '../../dist/index.html')
;

/**
* Implementacion de los css y js de materialize
*/
app.use('/public', express.static(path.join(__dirname, '../../public')));
app.use('/materializeIcons', express.static(path.join(__dirname, '../../node_modules/material-icons/iconfont/')));
app.use('/cleverLibrary', express.static(path.join(__dirname, '../../node_modules/clever-component-library/build/')));
app.set('port', port);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));
    app.get('*', (req, res) => {
        res.sendFile(sendFile);
    });
} else {
    const webpack = require('webpack');
    const config = require('../../webpack.config.js');
    const compiler = webpack(config);
    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const middleware = webpackMiddleware(compiler);

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
    app.get('*', (req, res) => {
        res.write(middleware.fileSystem.readFileSync(sendFile));
        res.end();
    });
}

/**
* Create HTTP server.
*/
var server = http.createServer(app);

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
* Normalize a port into a number, string, or false.
*/
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
* Event listener for HTTP server "error" event.
*/
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
* Event listener for HTTP server "listening" event.
*/
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
