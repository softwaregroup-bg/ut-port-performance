var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function AverageMetric(options) {
    AbstractMetric.call(this, options);
    this.counter = 0;
    this.counterDelta = 0;
    this.denominator = 0;
    this.denominatorDelta = 0;
}

util.inherits(AverageMetric, AbstractMetric);

AverageMetric.prototype.handler = function(value, count) {
    this.counter += value;
    this.counterDelta += value;
    this.denominator += count;
    this.denominatorDelta += count;
};

AverageMetric.prototype.influxDump = function(deltaTime) {
    var value = this.denominatorDelta ? this.counterDelta / this.denominatorDelta : 0;
    this.counterDelta = 0;
    this.denominatorDelta = 0;
    return this.code + '=' + value;
};

AverageMetric.prototype.statsDump = function(deltaTime) {
    return this.code + '=' + (this.counter / this.denominator);
};

module.exports = AverageMetric;
