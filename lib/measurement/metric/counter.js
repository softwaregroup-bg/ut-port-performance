var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function CounterMetric(options) {
    AbstractMetric.call(this, options);
    this.counter = 0;
    this.counterDelta = 0;
}

util.inherits(CounterMetric, AbstractMetric);

CounterMetric.prototype.handler = function(value) {
    this.counter += value;
    this.counterDelta += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    var value = deltaTime ? this.counterDelta / deltaTime : 0;
    this.counterDelta = 0;
    return this.code + '=' + value;
};

CounterMetric.prototype.statsDump = function(deltaTime) {
    var value = deltaTime ? this.counter / deltaTime : 0;
    this.counterDelta = 0;
    return this.code + '=' + value;
};

module.exports = CounterMetric;
