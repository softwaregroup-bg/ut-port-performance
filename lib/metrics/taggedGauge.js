var util = require('util');
var DynamicMetric = require('./super/tagged');

// options: code, name
function GaugeMetric(options) {
    DynamicMetric.call(this, options);
}

util.inherits(GaugeMetric, DynamicMetric);

GaugeMetric.prototype.handler = function(index, tag, value) {
    this.tags[tag].counters[index] = value;
};

GaugeMetric.prototype.influxDump = function() {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            return this.code + '=' + counter;
        }).join(',');
    }).join('');
};

GaugeMetric.prototype.statsDump = function(namespace) {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            return namespace + '.' + this.code + '=' + counter;
        }).join('\n');
    }).join('');
};

module.exports = GaugeMetric;
