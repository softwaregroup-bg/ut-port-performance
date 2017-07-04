var util = require('util');
var StaticMetric = require('./super/standard');

// options: code, name
function AverageMetric(options) {
    StaticMetric.call(this, options);
}

util.inherits(AverageMetric, StaticMetric);

AverageMetric.prototype.handler = function(index, value, count) {
    this.data.counters[index] += value;
    this.data.countersDelta[index] += value;
    this.data.denominators[index] += count;
    this.data.denominatorsDelta[index] += count;
};

AverageMetric.prototype.influxDump = function(deltaTime) {
    return this.data.counters.map((counter, index) => {
        var value = this.code + '=' + (this.data.denominatorDelta[index] ? this.data.countersDelta[index] / this.data.denominatorDelta[index] : 0);
        this.data.countersDelta[index] = 0;
        this.data.denominatorsDelta[index] = 0;
        return value;
    }).join(',');
};

AverageMetric.prototype.statsDump = function(namespace, deltaTime) {
    return this.data.counters.map((counter, index) => {
        var value = this.code + '=' + (counter / this.data.denominator[index]);
        return namespace + '.' + value;
    }).join('/n');
};

module.exports = AverageMetric;
