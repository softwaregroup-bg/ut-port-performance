var util = require('util');
var AbstractField = require('./abstract');

function GaugeField() {
    AbstractField.apply(this, arguments);
    this.counter = 0;
}

util.inherits(GaugeField, AbstractField);

GaugeField.prototype.update = function(value) {
    this.emit('update');
    this.counter = value;
};

GaugeField.prototype.flush = function(deltaTime) {
    this.emit('flush');
    return this.counter;
};

module.exports = GaugeField;
