var util = require('util');
var AbstractField = require('./abstract');

function AverageField() {
    AbstractField.apply(this, arguments);
    this.counterDelta = 0;
    this.denominatorDelta = 0;
}

util.inherits(AverageField, AbstractField);

AverageField.prototype.update = function(value, count) {
    this.emit('update');
    this.counterDelta += value;
    this.denominatorDelta += count;
};

AverageField.prototype.flush = function(deltaTime) {
    this.emit('flush');
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    return value;
};

module.exports = AverageField;
