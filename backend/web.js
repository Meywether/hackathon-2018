const express = require('express');
const path = require('path');
const storage = require('./storage');
const events = require('./events');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

////////////////////////////////////////////////////////////////////

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static(path.resolve(__dirname, 'public')));

app.route('/api')
	.get(getApiWelcomeMessage);

app.route('/api/persons')
	.get(getPersons)
	.post(addPerson);

app.route('/api/temperature')
	.get(getTemperature)
	.post(setTemperature);

app.route('/api/light')
	.get(getLight)
	.post(setLight);

app.route('/api/panic')
	.post(doPanic);

http.listen(3001, (err) => {
	if(err){
		return console.log('Cannot start http server', err);
	}
	console.log('HTTP Server Listening...');
});

////////////////////////////////////////////////////////////////////

events.on('insert', onInsert);
events.on('log', onLog);
events.on('accidentAlert', onAccidentAlert);

////////////////////////////////////////////////////////////////////

function getApiWelcomeMessage(req, res) {
	return res.send('We are awesome');
}

function getPersons(req, res) {
	const amount = req.query.amount || 15;
	return res.json(storage.getPersons(amount));
}

function getTemperature(req, res) {
	return res.json(storage.getTemperature());
}

function getLight(req, res) {
	return res.json(storage.getLight());
}

function addPerson(req, res) {
	const timestamp = Date.now();

	if(!req.body.value){
		return res.status(400).send('Missing value');
	}

	storage.addPerson({
		payload:req.body.value > 0 ? 1 : -1,
		timestamp
	});

	events.emit('log', {
		from: 'WEBUI',
		message: {
			addPerson: req.body.value
		}
	});

	return res.send('OK');
}

function setTemperature(req, res) {
	const timestamp = Date.now();

	if(!req.body.value){
		return res.status(400).send('Missing value');
	}

	storage.addTemperature({
		value: req.body.value,
		timestamp
	});

	events.emit('log', {
		from: 'WEBUI',
		message: {
			temperature: req.body.value
		}
	});

	return res.send('OK');
}

function setLight(req, res) {
	const timestamp = Date.now();

	if(!req.body.value){
		return res.status(400).send('Missing value');
	}

	storage.addTemperature({
		payload: req.body.value,
		timestamp
	});

	events.emit('log', {
		from: 'WEBUI',
		message: {
			light: req.body.value
		}
	});

	return res.send('OK');
}

function doPanic(req, res) {
	events.emit('accidentAlert', 'PANIC');

	return res.send('OK');
}

////////////////////////////////////////////////////////////////////

function onInsert(data) {
	io.sockets.emit(data.type, data.data);
}

function onLog(payload) {
	io.sockets.emit('log', payload);
}

function onAccidentAlert() {
	io.sockets.emit('PANIC');
}
