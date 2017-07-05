var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function CounterMetric(options) {
    AbstractMetric.call(this, options);
    this.data = {};
}

util.inherits(CounterMetric, AbstractMetric);

CounterMetric.prototype.handler = function(id, tags, value) {
    if (!this.data[id]) {
        this.data[id] = {
            counter: 0,
            counterDelta: 0,
            influxTags: Object.keys(tags).map((key) => (key + '=' + tags[key])).join(',')
        };
    }
    this.data[id].counter += value;
    this.data[id].counterDelta += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.data).map((id) => {
        var value = deltaTime ? this.data[id].counterDelta / deltaTime : 0;
        this.data[id].countersDelta = 0;
        return {
            tags: this.data[id].influxTags,
            value: this.code + '=' + value
        };
    });
};

CounterMetric.prototype.statsDump = function(deltaTime) {
    return Object.keys(this.data).map((id) => {
        var value = deltaTime ? this.counter / deltaTime : 0;
        this.data[id].counterDelta = 0;
        return {
            value: this.code + '=' + value
        };
    });
};

module.exports = CounterMetric;
