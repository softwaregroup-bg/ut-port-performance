var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function GaugeMetric(options) {
    AbstractMetric.call(this, options);
    this.counter = 0;
}

util.inherits(GaugeMetric, AbstractMetric);

GaugeMetric.prototype.handler = function(value) {
    this.counter = value;
};

GaugeMetric.prototype.influxDump = function(deltaTime) {
    return this.code + '=' + this.counter;
};

GaugeMetric.prototype.statsDump = function(deltaTime) {
    return this.code + '=' + this.counter;
};

module.exports = GaugeMetric;
