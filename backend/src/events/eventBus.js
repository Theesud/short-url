const { EventEmitter } = require('events');

const bus = new EventEmitter();

const EVENTS = {
  URL_VISITED: 'url.visited',
};

module.exports = { bus, EVENTS };