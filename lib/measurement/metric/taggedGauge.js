var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function GaugeMetric(options) {
    AbstractMetric.call(this, options);
    this.data = {};
}

util.inherits(GaugeMetric, AbstractMetric);

GaugeMetric.prototype.handler = function(id, tags, value) {
    if (!this.data[id]) {
        this.data[id] = {
            counter: 0,
            influxTags: Object.keys(tags).map((key) => (key + '=' + tags[key])).join(',')
        };
    }
    this.data[id].counter += value;
};

GaugeMetric.prototype.influxDump = function() {
    return Object.keys(this.data).map((id) => {
        return {
            tags: this.data[id].influxTags,
            value: this.code + '=' + this.data[id].counter
        };
    });
};

GaugeMetric.prototype.statsDump = function(namespace) {
    return Object.keys(this.data).map((id) => {
        return {
            value: this.code + '=' + this.data[id].counter
        };
    });
};

module.exports = GaugeMetric;
