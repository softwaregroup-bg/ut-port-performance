var util = require('util');
var EventEmitter = require('events').EventEmitter;

function AbstractField(code, name) {
    EventEmitter.call(this);
    this.code = code;
    this.name = name;
    this.updated = false;
    this.on('update', () => (this.updated = true));
    this.on('flush', () => (this.updated = false));
}

util.inherits(AbstractField, EventEmitter);

AbstractField.prototype.update = function() {
    throw new Error('update method not implemented');
};

AbstractField.prototype.flush = function() {
    throw new Error('flush method not implemented');
};

module.exports = AbstractField;
