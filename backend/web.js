const express = require('express');
const path = require('path');
const storage = require('./storage');
const events = require('./events');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/api', (req, res) => {
	res.send('We are awesome');
});

app.get('/api/all', (req, res) => {
	res.json(storage.getAll());
});

app.get('/api/types', (req, res) => {
	res.json(storage.getTypes());
});

events.on('person', (addedData) => {
	io.sockets.emit('person', addedData);
});

events.on('lightsInside', (data) => {
	io.sockets.emit('lightsInside', data);
});

events.on('temperatureInside', (data) => {
	io.sockets.emit('temperatureInside', data);
});

events.on('log', (payload) => {
	io.sockets.emit('log', payload);
});

events.on('accidentAlert', () => {
	console.log("PANIC");
	io.sockets.emit('PANIC');
});

http.listen(3001, () => {
	console.log('HTTP Server Listening...');
});
