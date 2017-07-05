var util = require('util');
var StandardMetric = require('./super/standard');

// options: code, name
function CounterMetric(options) {
    StandardMetric.call(this, options);
}

util.inherits(CounterMetric, StandardMetric);

CounterMetric.prototype.handler = function(value) {
    this.counter += value;
    this.counterDelta += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    var value = this.code + '=' + (deltaTime ? this.counterDelta / deltaTime : 0);
    this.counterDelta = 0;
    return value;
};

CounterMetric.prototype.statsDump = function(deltaTime) {
    var value = this.code + '=' + (deltaTime ? this.counter / deltaTime : 0);
    this.counterDelta = 0;
    return value;
};

module.exports = CounterMetric;
