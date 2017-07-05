var util = require('util');
var StandardMetric = require('./super/standard');

// options: code, name
function AverageMetric(options) {
    StandardMetric.call(this, options);
}

util.inherits(AverageMetric, StandardMetric);

AverageMetric.prototype.handler = function(value, count) {
    this.counter += value;
    this.counterDelta += value;
    this.denominator += count;
    this.denominatorDelta += count;
};

AverageMetric.prototype.influxDump = function(deltaTime) {
    var value = this.code + '=' + (this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0);
    this.counterDelta[index] = 0;
    this.denominatorDelta[index] = 0;
    return value;
};

AverageMetric.prototype.statsDump = function(deltaTime) {
    return this.code + '=' + (this.counter / this.denominator);
};

module.exports = AverageMetric;
