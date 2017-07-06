var util = require('util');
var AbstractField = require('./abstract');

function CounterField() {
    AbstractField.apply(this, arguments);
    this.counterDelta = 0;
}

util.inherits(CounterField, AbstractField);

CounterField.prototype.update = function(value) {
    this.emit('update');
    this.counterDelta += value;
};

CounterField.prototype.flush = function(deltaTime) {
    this.emit('flush');
    var value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.counterDelta = 0;
    return value;
};

module.exports = CounterField;
