const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('log', (data) => {
	console.log(`FROM: ${data.from} - ${JSON.stringify(data.message)}`);
});

module.exports = emitter;
