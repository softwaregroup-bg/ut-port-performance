var util = require('util');
var StandardMetric = require('./super/standard');

// options: code, name
function GaugeMetric(options) {
    StandardMetric.call(this, options);
}

util.inherits(GaugeMetric, StandardMetric);

GaugeMetric.prototype.handler = function(index, value) {
    this.data.counters[index] = value;
};

GaugeMetric.prototype.influxDump = function() {
    return this.data.counters.map((counter, index) => {
        return this.code + '=' + counter;
    }).join(',');
};

GaugeMetric.prototype.statsDump = function(namespace) {
    return this.data.counters.map((counter, index) => {
        return namespace + '.' + this.code + '=' + counter;
    }).join('/n');
};

module.exports = GaugeMetric;
