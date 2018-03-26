const dgram = require('dgram');
const storage = require('./storage');
const events = require('./events');
const server = dgram.createSocket('udp4');

const wellKnownHosts = {};

server.on('error', (err) => {
	console.log('Error', err);
});

server.on('message', (msg, info) => {
	let data = msg.toString('utf8', 8);

	if (wellKnownHosts.hasOwnProperty(info.address)) {
		info.address = wellKnownHosts[info.address];
	}

	events.emit('log', {from: info.address, message: data});

	try {
		data = JSON.parse(data);
	} catch (err) {
		return console.error("Cannot parse message", data, err);
	}

	console.log(info.address, data);

	const timestamp = Date.now();

	for (let i in data) {
		switch (i) {
			case 'deviceName':
				wellKnownHosts[info.address] = data[i];
				break;
			case 'person':
				storage.addPerson({payload: data[i], timestamp});
				break;
			case 'lightInside':
			case 'LightOutside':
				storage.addLightInside({payload: data[i], timestamp});
				break;
			case 'temperatureInside':
			case 'TemperatureOutside':
				storage.addTemperatureInside({payload: data[i], timestamp});
				break;
			//case 'rotAngleInside':
			//	storage.addAngleInside({payload: data[i], timestamp});
			//	break;
			case 'accidentAlert':
				if(data[i] > 0) {
					events.emit('accidentAlert', 'PANIC');
				}
				break;
			default:
				console.log('Not a legit property');
				break;
		}
	}
});

server.on('listening', () => {
	console.log('UDP Server Listening...');
});

server.bind(3000);
