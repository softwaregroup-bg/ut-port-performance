var util = require('util');
var StaticMetric = require('./super/static');

// options: code, name
function CounterMetric(options) {
    StaticMetric.call(this, options);
}

util.inherits(CounterMetric, StaticMetric);

CounterMetric.prototype.handler = function(index, value) {
    this.data.counters[index] += value;
    this.data.countersDelta[index] += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    return this.data.counters.map((counter, index) => {
        var value = this.code + '=' + (deltaTime ? this.data.countersDelta[index] / deltaTime : 0);
        this.data.countersDelta[index] = 0;
        return value;
    }).join('');
};

CounterMetric.prototype.statsDump = function(namespace, deltaTime) {
    return this.data.counters.map((counter, index) => {
        var value = this.code + '=' + (deltaTime ? counter / deltaTime : 0);
        this.data.countersDelta[index] = 0;
        return namespace + '.' + value;
    }).join('/n');
};

module.exports = CounterMetric;
