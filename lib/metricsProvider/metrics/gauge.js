var util = require('util');
var StandardMetric = require('./super/standard');

// options: code, name
function GaugeMetric(options) {
    StandardMetric.call(this, options);
}

util.inherits(GaugeMetric, StandardMetric);

GaugeMetric.prototype.handler = function(index, value) {
    this.counter = value;
};

GaugeMetric.prototype.influxDump = function() {
   return this.code + '=' + this.counter;
};

GaugeMetric.prototype.statsDump = function(namespace) {
    return this.code + '=' + this.counter;
};

module.exports = GaugeMetric;
