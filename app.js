const config = require('./config');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http, { path: config.ContextPath + '/socket.io' });
const redis = require('socket.io-redis');

const instanceId = (process.env.NODE_APP_INSTANCE) ? parseInt(process.env.NODE_APP_INSTANCE) : 0;

app.set('port', 3000 + instanceId);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const router = express.Router();

//static content
router.use('/public', express.static(path.join(__dirname, 'public')));

//api
router.post('/send', (req, res, next) => {
    let message = {
        name: 'system',
        content: 'this is a test'
    };
    io.to(req.body.socketId).emit('chat', message);

    res.send();
});

//page
router.use((req, res, next) => {
    res.locals.contextPath = config.ContextPath;
    next();
});
router.get('/', function(req, res) {
    res.render('index');
});

//serve for contextPath
app.use(config.ContextPath, router);


io.adapter(redis({ host: 'localhost', port: 6379 }));

io.on('connection', function(socket) {
    let message = {
        name: 'system',
        content: 'Welcome ' + socket.id
    };

    io.emit('chat', message);

    socket.on('chat', function(msg) {
        io.emit('chat', msg);
    });

    socket.on('disconnect', function() {
        let message = {
            name: 'system',
            content: socket.id + ' disconnect'
        };

        io.emit('chat', message);
    });
});

http.listen(app.get('port'), function() {
    console.log('App is running on port', app.get('port'));
});
