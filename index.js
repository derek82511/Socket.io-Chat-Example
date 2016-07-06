let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	let message = {
		name: 'system',
		content: 'Welcome ' + socket.id
	};

	io.emit('chat', message);

	socket.on('chat', function(msg){
		io.emit('chat', msg);
	});

	socket.on('disconnect', function(){
		let message = {
			name: 'system',
			content: socket.id + ' disconnect'
		};

		io.emit('chat', message);
	});
});

http.listen(app.get('port'), function(){
	console.log('App is running on port', app.get('port'));
});