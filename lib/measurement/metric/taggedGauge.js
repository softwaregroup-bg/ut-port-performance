var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function GaugeMetric(options) {
    AbstractMetric.call(this, options);
    this.tags = {};
}

util.inherits(GaugeMetric, AbstractMetric);

GaugeMetric.prototype.handler = function(index, tag, value) {
    if (!this.tags[tag]) {
        this.tags[tag] = {
            counter: 0
        };
    }
    this.tags[tag].counter += value;
};

GaugeMetric.prototype.influxDump = function() {
    return Object.keys(this.tags).map((tag) => {
        return this.code + '=' + this.tags[tag].counter;
    }).join('');
};

GaugeMetric.prototype.statsDump = function(namespace) {
    return Object.keys(this.tags).map((tag) => {
        return this.code + '=' + this.tags[tag].counter;
    }).join('');
};

module.exports = GaugeMetric;
