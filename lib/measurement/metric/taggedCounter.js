var util = require('util');
var AbstractMetric = require('./abstract');

// options: code, name
function CounterMetric(options) {
    AbstractMetric.call(this, options);
    this.tags = {};
}

util.inherits(CounterMetric, AbstractMetric);

CounterMetric.prototype.handler = function(tag, value) {
    if (!this.tags[tag]) {
        this.tags[tag] = {
            counter: 0,
            counterDelta: 0
        };
    }
    this.tags[tag].counter += value;
    this.tags[tag].counterDelta += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        var value = this.code + '=' + (deltaTime ? this.tags[tag].counterDelta / deltaTime : 0);
        this.tags[tag].countersDelta = 0;
        return value;
    }).join('');
};

CounterMetric.prototype.statsDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        var value = this.code + '=' + (deltaTime ? this.counter / deltaTime : 0);
        this.tags[tag].counterDelta = 0;
        return value;
    }).join('');
};

module.exports = CounterMetric;
