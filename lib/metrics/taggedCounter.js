var util = require('util');
var Dynamic = require('./super/tagged');

// options: code, name
function CounterMetric(options) {
    Dynamic.call(this, options);
}

util.inherits(CounterMetric, Dynamic);

CounterMetric.prototype.handler = function(index, tag, value) {
    this.tags[tag].counters[index] += value;
    this.tags[tag].countersDelta[index] += value;
};

CounterMetric.prototype.influxDump = function(deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            var value = this.code + '=' + (deltaTime ? this.tags[tag].countersDelta[index] / deltaTime : 0);
            this.tags[tag].countersDelta[index] = 0;
            return value;
        }).join(',');
    }).join('');
};

CounterMetric.prototype.statsDump = function(namespace, deltaTime) {
    return Object.keys(this.tags).map((tag) => {
        return this.tags[tag].counters.map((counter, index) => {
            var value = this.code + '=' + (deltaTime ? counter / deltaTime : 0);
            this.tags[tag].countersDelta[index] = 0;
            return namespace + '.' + value;
        }).join('\n');
    }).join('');
};

module.exports = CounterMetric;
