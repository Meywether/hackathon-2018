const events = require('./events');

let _data = {
	persons: [],
	lightInside: [],
	temeratureInside: []
};

function addPerson(data) {
	let lastPerson = {
		currPersons: 0
	};

	if(_data.persons.length > 0) {
		lastPerson = _data.persons[_data.persons.length - 1];
	}

	const newPerson = {
		value: data.payload,
		currPersons: Math.max(lastPerson.currPersons, 0) + data.payload,
		timestamp: data.timestamp
	};

	_data.persons.push(newPerson);

	events.emit('person', newPerson);
}

function addLightInside(data) {
	_data.lightInside.push(data);
	events.emit('lightInside', data);
}

function addTemperatureInside(data) {
	_data.temeratureInside.push(data);
	events.emit('temperatureInside', data);
}

function getAll() {
	return _data;
}

module.exports = {
	addPerson,
	addLightInside,
	addTemperatureInside,
	getAll
};
