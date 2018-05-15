const events = require('./events');

const _data = {
	persons: [],
	light: [],
	temperature: []
};

function addPerson(data) {
	let lastPerson = {
		currPersons: 0
	};

	if (_data.persons.length > 0) {
		lastPerson = _data.persons[_data.persons.length - 1];
	}

	const newPerson = {
		value: data.payload,
		currPersons: Math.max(lastPerson.currPersons + data.payload, 0),
		timestamp: data.timestamp
	};

	_data.persons.push(newPerson);

	events.emit('insert', {
		type: 'person',
		data: newPerson
	});
}

function addLight(data) {
	_data.light.push(data);

	events.emit('insert', {
		type: 'light',
		data: data
	});
}

function addTemperature(data) {
	_data.temperature.push(data);

	events.emit('insert', {
		type: 'temperature',
		data: data
	});
}

function getPersons(amount) {
	let output = [];

	if (_data.persons.length === 0) {
		return [];
	}

	if (amount > _data.persons.length) {
		amount = _data.persons.length;
	}

	for (let i = 0; i < amount; i++) {
		output.push(_data.persons[_data.persons.length - amount + i]);
	}

	return output;
}

function getLight() {
	return Math.max(_data.light[_data.light.length - 1], 0);
}

function getTemperature() {
	if (_data.temperature.length === 0) {
		return {value: 0, timestamp: 0};
	}
	return _data.temperature[_data.temperature.length - 1];
}

module.exports = {
	addPerson,
	addLight,
	addTemperature,
	getPersons,
	getLight,
	getTemperature
};
